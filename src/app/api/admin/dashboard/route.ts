import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

const activeBookingStatuses = ['pending', 'confirmed', 'in_progress'];

function getBangkokDateValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';

  return `${value('year')}-${value('month')}-${value('day')}`;
}

function getBangkokMonthRange() {
  const today = getBangkokDateValue();
  const [year, month] = today.split('-').map(Number);
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonthDate = new Date(Date.UTC(year, month, 1));
  const to = nextMonthDate.toISOString().slice(0, 10);

  return { from, to };
}

function mapBooking(booking: any) {
  return {
    id: booking.id,
    time: String(booking.booking_time).slice(0, 5),
    customerName: booking.customer_name,
    service: booking.spa_service_categories?.name ?? booking.spa_services?.name ?? '-',
    staff: booking.spa_staff?.display_name ?? '-',
    status: booking.status,
  };
}

function mapPromotion(promotion: any) {
  return {
    id: promotion.id,
    title: promotion.title,
    code: promotion.code,
    discountLabel: promotion.discount_label,
  };
}

function mapCustomer(customer: any) {
  return [
    customer.display_name,
    customer.total_visits > 1 ? 'ลูกค้าประจำ' : 'ลูกค้าใหม่',
    `${customer.total_visits ?? 0} ครั้ง`,
    customer.last_note || customer.spa_services?.name || '-',
  ];
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request, 'dashboard');

  if (auth.response) {
    return auth.response;
  }

  const today = getBangkokDateValue();
  const monthRange = getBangkokMonthRange();

  const [
    todayCountResult,
    customerCountResult,
    promotionCountResult,
    todayBookingsResult,
    promotionsResult,
    customersResult,
    monthBookingsResult,
    todayAvailabilityResult,
    todayActiveBookingsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from('spa_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('booking_date', today)
      .in('status', activeBookingStatuses),
    supabaseAdmin.from('spa_customers').select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('spa_promotions')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabaseAdmin
      .from('spa_bookings')
      .select(
        `
          id,
          customer_name,
          booking_time,
          status,
          spa_service_categories (name),
          spa_services (name),
          spa_staff (display_name)
        `
      )
      .eq('booking_date', today)
      .order('booking_time', { ascending: true })
      .limit(8),
    supabaseAdmin
      .from('spa_promotions')
      .select('id, title, code, discount_label')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('spa_customers')
      .select('id, display_name, total_visits, last_note, spa_services (name)')
      .order('last_visited_at', { ascending: false, nullsFirst: false })
      .limit(5),
    supabaseAdmin
      .from('spa_bookings')
      .select('id, spa_service_categories (price), spa_services (price)')
      .eq('status', 'completed')
      .gte('booking_date', monthRange.from)
      .lt('booking_date', monthRange.to),
    supabaseAdmin
      .from('spa_booking_availability')
      .select('max_bookings_per_day, is_closed')
      .eq('booking_date', today)
      .maybeSingle(),
    supabaseAdmin
      .from('spa_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('booking_date', today)
      .in('status', activeBookingStatuses),
  ]);

  const firstError = [
    todayCountResult.error,
    customerCountResult.error,
    promotionCountResult.error,
    todayBookingsResult.error,
    promotionsResult.error,
    customersResult.error,
    monthBookingsResult.error,
    todayAvailabilityResult.error,
    todayActiveBookingsResult.error,
  ].find(Boolean);

  if (firstError) {
    return NextResponse.json({ message: firstError.message }, { status: 400 });
  }

  const revenueThisMonth = (monthBookingsResult.data ?? []).reduce((total, booking: any) => {
    const price = Number(booking.spa_service_categories?.price ?? booking.spa_services?.price ?? 0);

    return total + price;
  }, 0);
  const maxBookingsPerDay = todayAvailabilityResult.data?.is_closed
    ? 0
    : todayAvailabilityResult.data?.max_bookings_per_day;
  const queueAvailable =
    maxBookingsPerDay === null || maxBookingsPerDay === undefined
      ? null
      : Math.max(0, Number(maxBookingsPerDay) - (todayActiveBookingsResult.count ?? 0));

  return NextResponse.json({
    stats: {
      bookingsToday: todayCountResult.count ?? 0,
      revenueThisMonth,
      customers: customerCountResult.count ?? 0,
      activePromotions: promotionCountResult.count ?? 0,
      queueAvailable,
    },
    bookings: (todayBookingsResult.data ?? []).map(mapBooking),
    promotions: (promotionsResult.data ?? []).map(mapPromotion),
    customers: (customersResult.data ?? []).map(mapCustomer),
  });
}
