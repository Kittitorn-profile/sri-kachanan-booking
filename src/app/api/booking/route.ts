import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

type BookingBody = {
  bookingId?: string;
  serviceId?: string;
  categoryId?: string;
  date?: string;
  time?: string;
  customerName?: string;
  phone?: string;
  customerNote?: string;
  imageUrls?: string[];
  jobItems?: string;
  jobImageUrls?: string[];
  status?: BookingStatus;
  reviewRating?: number;
  reviewComment?: string;
};

type AvailabilityDay = {
  id: string;
  date: string;
  label: string;
  fullLabel: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: number | null;
  maxBookingsPerDay: number | null;
  bookedCount: number;
  remainingBookings: number | null;
  note: string;
  slots: string[];
};

const DEFAULT_SLOT_INTERVAL_MINUTES = 30;

async function requireApprovedUser(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      response: NextResponse.json({ message: 'Missing authorization token' }, { status: 401 }),
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return {
      response: NextResponse.json({ message: 'Invalid authorization token' }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('id, display_name, phone, role, approval_status')
    .eq('id', data.user.id)
    .single();

  if (profileError || profile?.approval_status !== 'approved') {
    return {
      response: NextResponse.json({ message: 'Approved account required' }, { status: 403 }),
    };
  }

  return { user: data.user, profile };
}

function createBookingNo() {
  const date = new Date();
  const datePart = [
    String(date.getFullYear()).slice(-2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');

  return `BK-${datePart}-${String(Date.now()).slice(-5)}`;
}

function formatDateLabel(dateValue: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatShortDateLabel(dateValue: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateValue}T00:00:00`));
}

function toMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);

  return hours * 60 + minutes;
}

function toTimeValue(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function getBangkokDateTimeParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function createSlots(openTime: string, closeTime: string, interval: number) {
  const slots: string[] = [];

  for (let minutes = toMinutes(openTime); minutes < toMinutes(closeTime); minutes += interval) {
    slots.push(toTimeValue(minutes));
  }

  return slots;
}

async function getAvailabilityDays(): Promise<AvailabilityDay[]> {
  const bangkokNow = getBangkokDateTimeParts();
  const fromValue = bangkokNow.date;
  const toValue = addDaysToDateValue(fromValue, 14);

  const { data: days, error: daysError } = await supabaseAdmin
    .from('spa_booking_availability')
    .select(
      'id, booking_date, is_closed, open_time, close_time, slot_interval_minutes, max_bookings_per_day, note'
    )
    .gte('booking_date', fromValue)
    .lte('booking_date', toValue)
    .order('booking_date', { ascending: true });

  if (daysError) {
    throw daysError;
  }

  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from('spa_bookings')
    .select('booking_date, booking_time, status')
    .gte('booking_date', fromValue)
    .lte('booking_date', toValue)
    .in('status', ['pending', 'confirmed', 'in_progress']);

  if (bookingsError) {
    throw bookingsError;
  }

  return (days ?? []).map((day) => {
    const date = day.booking_date;
    const activeBookings = (bookings ?? []).filter((booking) => booking.booking_date === date);
    const bookedTimes = new Set(activeBookings.map((booking) => String(booking.booking_time).slice(0, 5)));
    const bookedCount = activeBookings.length;
    const maxBookingsPerDay =
      day.max_bookings_per_day === null ? null : Number(day.max_bookings_per_day);
    const remainingBookings =
      maxBookingsPerDay === null ? null : Math.max(0, maxBookingsPerDay - bookedCount);
    const slotIntervalMinutes =
      day.slot_interval_minutes === null ? null : Number(day.slot_interval_minutes);
    const openTime = String(day.open_time).slice(0, 5);
    const closeTime = String(day.close_time).slice(0, 5);
    const openMinutes = toMinutes(openTime);
    const closeMinutes = toMinutes(closeTime);
    const isTodayOpenNow =
      date === fromValue && bangkokNow.minutes >= openMinutes && bangkokNow.minutes < closeMinutes;
    const openSlots = createSlots(
      openTime,
      closeTime,
      slotIntervalMinutes ?? DEFAULT_SLOT_INTERVAL_MINUTES
    );
    const availableSlots = isTodayOpenNow
      ? Array.from(new Set([toTimeValue(bangkokNow.minutes), ...openSlots])).sort(
          (firstSlot, secondSlot) => toMinutes(firstSlot) - toMinutes(secondSlot)
        )
      : openSlots;
    const slots =
      day.is_closed || remainingBookings === 0
        ? []
        : availableSlots.filter((slot) => {
            const isPastTodaySlot = date === fromValue && toMinutes(slot) < bangkokNow.minutes;

            return !isPastTodaySlot && !bookedTimes.has(slot);
          });

    return {
      id: day.id,
      date,
      label: formatShortDateLabel(date),
      fullLabel: formatDateLabel(date),
      isClosed: day.is_closed,
      openTime,
      closeTime,
      slotIntervalMinutes,
      maxBookingsPerDay,
      bookedCount,
      remainingBookings,
      note: day.note,
      slots,
    };
  });
}

async function validateAvailability(date: string, time: string, excludeBookingId?: string) {
  const { data: day, error: dayError } = await supabaseAdmin
    .from('spa_booking_availability')
    .select('is_closed, open_time, close_time, slot_interval_minutes, max_bookings_per_day')
    .eq('booking_date', date)
    .single();

  if (dayError || !day) {
    return 'วันนี้ยังไม่เปิดรับจองคิว';
  }

  if (day.is_closed) {
    return 'วันนี้ปิดรับคิว';
  }

  const normalizedTime = time.slice(0, 5);
  const openTime = String(day.open_time).slice(0, 5);
  const closeTime = String(day.close_time).slice(0, 5);
  const bangkokNow = getBangkokDateTimeParts();
  const slotIntervalMinutes =
    day.slot_interval_minutes === null ? null : Number(day.slot_interval_minutes);
  const isTodayBooking = date === bangkokNow.date;

  if (toMinutes(normalizedTime) < toMinutes(openTime) || toMinutes(normalizedTime) >= toMinutes(closeTime)) {
    return 'เวลานี้อยู่นอกช่วงเปิดรับคิว';
  }

  if (!isTodayBooking && slotIntervalMinutes !== null) {
    const slots = createSlots(openTime, closeTime, slotIntervalMinutes);

    if (!slots.includes(normalizedTime)) {
      return 'เวลานี้อยู่นอกช่วงเปิดรับคิว';
    }
  }

  let countQuery = supabaseAdmin
    .from('spa_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed', 'in_progress']);

  if (excludeBookingId) {
    countQuery = countQuery.neq('id', excludeBookingId);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    return countError.message;
  }

  if (day.max_bookings_per_day !== null && (count ?? 0) >= day.max_bookings_per_day) {
    return 'วันนี้คิวเต็มแล้ว';
  }

  return null;
}

function mapService(service: any) {
  return {
    id: service.id,
    name: service.name,
    categoryId: service.category_id,
    durationMinutes: service.duration_minutes,
    duration: `${service.duration_minutes} นาที`,
    price: Number(service.price),
  };
}

function mapBooking(booking: any) {
  const categoryName = booking.spa_service_categories?.name ?? booking.spa_services?.name ?? '';

  return {
    id: booking.id,
    bookingNo: booking.booking_no,
    serviceId: booking.service_id ?? '',
    service: categoryName,
    duration: `${booking.spa_services?.duration_minutes ?? 0} นาที`,
    price: Number(booking.spa_services?.price ?? 0),
    categoryId: booking.category_id ?? null,
    date: booking.booking_date,
    time: String(booking.booking_time).slice(0, 5),
    staffId: booking.staff_id ?? '',
    staff: booking.spa_staff?.display_name ?? '',
    customerName: booking.customer_name,
    phone: booking.phone,
    customerNote: booking.customer_note,
    imageUrls: Array.isArray(booking.image_urls) ? booking.image_urls.slice(0, 4) : [],
    jobItems: booking.job_items ?? '',
    jobImageUrls: Array.isArray(booking.job_image_urls) ? booking.job_image_urls.slice(0, 4) : [],
    jobOpenedAt: booking.job_opened_at,
    status: booking.status,
    reviewRating: booking.review_rating,
    reviewComment: booking.review_comment,
  };
}

async function upsertCompletedCustomer(bookingId: string, profile: any) {
  const { data: booking, error } = await supabaseAdmin
    .from('spa_bookings')
    .select('id, customer_id, service_id, staff_id, customer_name, phone, customer_note, booking_date, booking_time')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    throw error ?? new Error('Booking not found');
  }

  const visitedAt = new Date(`${booking.booking_date}T${String(booking.booking_time).slice(0, 8)}`).toISOString();

  const { data: existingCustomer, error: existingError } = await supabaseAdmin
    .from('spa_customers')
    .select('id, total_visits, last_booking_id')
    .eq('profile_id', booking.customer_id)
    .eq('phone', booking.phone)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const isSameCompletedBooking = existingCustomer?.last_booking_id === booking.id;
  const payload = {
    profile_id: booking.customer_id,
    display_name: booking.customer_name,
    phone: booking.phone,
    email: profile.email ?? null,
    total_visits: isSameCompletedBooking
      ? (existingCustomer?.total_visits ?? 0)
      : (existingCustomer?.total_visits ?? 0) + 1,
    last_booking_id: booking.id,
    last_service_id: booking.service_id,
    last_staff_id: booking.staff_id,
    last_visited_at: visitedAt,
    last_note: booking.customer_note ?? '',
  };

  if (existingCustomer) {
    const { error: updateError } = await supabaseAdmin
      .from('spa_customers')
      .update(payload)
      .eq('id', existingCustomer.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabaseAdmin.from('spa_customers').insert(payload);

  if (insertError) {
    throw insertError;
  }
}

const bookingSelect = `
  id,
  booking_no,
  category_id,
  service_id,
  staff_id,
  booking_date,
  booking_time,
  customer_name,
  phone,
  customer_note,
  image_urls,
  job_items,
  job_image_urls,
  job_opened_at,
  status,
  review_rating,
  review_comment,
  spa_services (
    name,
    duration_minutes,
    price
  ),
  spa_service_categories (name),
  spa_staff (display_name)
`;

export async function GET(request: Request) {
  const auth = await requireApprovedUser(request);

  if (auth.response) {
    return auth.response;
  }

  const [servicesResult, bookingsResult, availabilityResult] = await Promise.all([
    supabaseAdmin
      .from('spa_services')
      .select('id, name, category_id, duration_minutes, price')
      .eq('is_active', true)
      .order('name'),
    supabaseAdmin
      .from('spa_bookings')
      .select(bookingSelect)
      .eq('customer_id', auth.profile.id)
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false }),
    getAvailabilityDays(),
  ]);

  const error = servicesResult.error || bookingsResult.error;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    profile: {
      displayName: auth.profile.display_name,
      phone: auth.profile.phone,
    },
    services: (servicesResult.data ?? []).map(mapService),
    availability: availabilityResult,
    bookings: (bookingsResult.data ?? []).map(mapBooking),
  });
}

export async function POST(request: Request) {
  const auth = await requireApprovedUser(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as BookingBody;
  const imageUrls = (body.imageUrls ?? []).filter(Boolean).slice(0, 4);

  if (!body.categoryId || !body.date || !body.time || !body.customerName || !body.phone) {
    return NextResponse.json({ message: 'Missing booking fields' }, { status: 400 });
  }

  const availabilityError = await validateAvailability(body.date, body.time);

  if (availabilityError) {
    return NextResponse.json({ message: availabilityError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_bookings')
    .insert({
      booking_no: createBookingNo(),
      customer_id: auth.profile.id,
      category_id: body.categoryId,
      service_id: body.serviceId || null,
      staff_id: null,
      booking_date: body.date,
      booking_time: body.time,
      customer_name: body.customerName.trim(),
      phone: body.phone.trim(),
      customer_note: body.customerNote?.trim() ?? '',
      image_urls: imageUrls,
      status: 'pending',
    })
    .select(bookingSelect)
    .single();

  if (error) {
    const isDoubleBooking = error.code === '23505';

    return NextResponse.json(
      { message: isDoubleBooking ? 'เวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น' : error.message },
      { status: isDoubleBooking ? 409 : 400 }
    );
  }

  if (data.status === 'completed') {
    try {
      await upsertCompletedCustomer(data.id, auth.user);
    } catch (customerError) {
      return NextResponse.json(
        {
          message:
            customerError instanceof Error
              ? customerError.message
              : 'บันทึกข้อมูลลูกค้าไม่สำเร็จ',
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ booking: mapBooking(data) });
}

export async function PATCH(request: Request) {
  const auth = await requireApprovedUser(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as BookingBody;

  if (!body.bookingId) {
    return NextResponse.json({ message: 'Missing bookingId' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.date && body.time) {
    const availabilityError = await validateAvailability(body.date, body.time, body.bookingId);

    if (availabilityError) {
      return NextResponse.json({ message: availabilityError }, { status: 400 });
    }
  }

  if (typeof body.serviceId === 'string') {
    patch.service_id = body.serviceId || null;
  }

  if (body.categoryId) {
    patch.category_id = body.categoryId;
  }

  if (body.date) {
    patch.booking_date = body.date;
  }

  if (body.time) {
    patch.booking_time = body.time;
  }

  if (body.customerName) {
    patch.customer_name = body.customerName.trim();
  }

  if (body.phone) {
    patch.phone = body.phone.trim();
  }

  if (typeof body.customerNote === 'string') {
    patch.customer_note = body.customerNote.trim();
  }

  if (Array.isArray(body.imageUrls)) {
    patch.image_urls = body.imageUrls.filter(Boolean).slice(0, 4);
  }

  if (typeof body.jobItems === 'string') {
    patch.job_items = body.jobItems.trim();
  }

  if (Array.isArray(body.jobImageUrls)) {
    patch.job_image_urls = body.jobImageUrls.filter(Boolean).slice(0, 4);
  }

  if (body.status) {
    patch.status = body.status;
  }

  if (body.status === 'in_progress') {
    patch.job_opened_at = new Date().toISOString();
  }

  if (body.reviewRating) {
    patch.review_rating = body.reviewRating;
    patch.review_comment = body.reviewComment?.trim() ?? '';
    patch.status = 'completed';
  }

  const { data, error } = await supabaseAdmin
    .from('spa_bookings')
    .update(patch)
    .eq('id', body.bookingId)
    .eq('customer_id', auth.profile.id)
    .select(bookingSelect)
    .single();

  if (error) {
    const isDoubleBooking = error.code === '23505';

    return NextResponse.json(
      { message: isDoubleBooking ? 'เวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น' : error.message },
      { status: isDoubleBooking ? 409 : 400 }
    );
  }

  return NextResponse.json({ booking: mapBooking(data) });
}
