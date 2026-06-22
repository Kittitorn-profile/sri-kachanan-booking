import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireBackOffice } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

type UpdateBookingBody = {
  bookingId?: string;
  status?: BookingStatus;
};

const bookingSelect = `
  id,
  booking_no,
  customer_id,
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
  created_at,
  updated_at,
  user_profiles (email, display_name),
  spa_service_categories (name),
  spa_services (name, duration_minutes, price),
  spa_staff (display_name)
`;

function mapBooking(booking: any) {
  return {
    id: booking.id,
    bookingNo: booking.booking_no,
    customerId: booking.customer_id,
    customerName: booking.customer_name,
    customerEmail: booking.user_profiles?.email ?? '',
    phone: booking.phone,
    customerNote: booking.customer_note,
    imageUrls: Array.isArray(booking.image_urls) ? booking.image_urls.slice(0, 4) : [],
    jobItems: booking.job_items ?? '',
    jobImageUrls: Array.isArray(booking.job_image_urls) ? booking.job_image_urls.slice(0, 4) : [],
    jobOpenedAt: booking.job_opened_at,
    service: booking.spa_service_categories?.name ?? booking.spa_services?.name ?? '-',
    category: booking.spa_service_categories?.name ?? '-',
    duration: `${booking.spa_services?.duration_minutes ?? 0} นาที`,
    price: Number(booking.spa_services?.price ?? 0),
    staff: booking.spa_staff?.display_name ?? '-',
    date: booking.booking_date,
    time: String(booking.booking_time).slice(0, 5),
    status: booking.status,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
}

function getRelationOne<T>(relation: T | T[] | null | undefined): T | null {
  return Array.isArray(relation) ? (relation[0] ?? null) : (relation ?? null);
}

async function upsertCompletedCustomer(bookingId: string) {
  const { data: booking, error } = await supabaseAdmin
    .from('spa_bookings')
    .select(
      `
        id,
        customer_id,
        service_id,
        staff_id,
        customer_name,
        phone,
        customer_note,
        booking_date,
        booking_time,
        user_profiles (email)
      `
    )
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    throw error ?? new Error('Booking not found');
  }

  const visitedAt = new Date(
    `${booking.booking_date}T${String(booking.booking_time).slice(0, 8)}`
  ).toISOString();

  const { data: existingCustomer, error: existingError } = await supabaseAdmin
    .from('spa_customers')
    .select('id, total_visits, last_booking_id')
    .eq('profile_id', booking.customer_id)
    .eq('phone', booking.phone)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const userProfile = getRelationOne<{ email?: string }>(booking.user_profiles);
  const isSameCompletedBooking = existingCustomer?.last_booking_id === booking.id;
  const payload = {
    profile_id: booking.customer_id,
    display_name: booking.customer_name,
    phone: booking.phone,
    email: userProfile?.email ?? null,
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

export async function GET(request: Request) {
  const auth = await requireBackOffice(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabaseAdmin
    .from('spa_bookings')
    .select(bookingSelect)
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });

  if (status === 'working') {
    query = query.eq('status', 'in_progress');
  } else if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    bookings: (data ?? []).map(mapBooking),
    total: data?.length ?? 0,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireBackOffice(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as UpdateBookingBody;

  if (!body.bookingId || !body.status) {
    return NextResponse.json({ message: 'Missing bookingId or status' }, { status: 400 });
  }

  if (!['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(body.status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_bookings')
    .update({ status: body.status })
    .eq('id', body.bookingId)
    .select(bookingSelect)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (data.status === 'completed') {
    try {
      await upsertCompletedCustomer(data.id);
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
