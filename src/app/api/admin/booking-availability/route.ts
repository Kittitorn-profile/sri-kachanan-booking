import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type AvailabilityBody = {
  id?: string;
  date?: string;
  isClosed?: boolean;
  openTime?: string;
  closeTime?: string;
  slotIntervalMinutes?: number | null;
  maxBookingsPerDay?: number | null;
  note?: string;
};

const availabilitySelect =
  'id, booking_date, is_closed, open_time, close_time, slot_interval_minutes, max_bookings_per_day, note, created_at, updated_at';

function toMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number);

  return hours * 60 + minutes;
}

function mapAvailability(day: any) {
  return {
    id: day.id,
    date: day.booking_date,
    isClosed: day.is_closed,
    openTime: String(day.open_time).slice(0, 5),
    closeTime: String(day.close_time).slice(0, 5),
    slotIntervalMinutes: day.slot_interval_minutes,
    maxBookingsPerDay: day.max_bookings_per_day,
    note: day.note,
    createdAt: day.created_at,
    updatedAt: day.updated_at,
  };
}

function validateAvailabilityBody(body: AvailabilityBody) {
  if (!body.date || !body.openTime || !body.closeTime) {
    return 'Missing availability fields';
  }

  if (toMinutes(body.openTime) >= toMinutes(body.closeTime)) {
    return 'เวลาเปิดรับต้องน้อยกว่าเวลาปิดรับ';
  }

  if (
    body.slotIntervalMinutes !== undefined &&
    body.slotIntervalMinutes !== null &&
    (!Number.isInteger(body.slotIntervalMinutes) || body.slotIntervalMinutes <= 0)
  ) {
    return 'กรุณาระบุรอบเวลาเป็นจำนวนนาทีที่มากกว่า 0';
  }

  if (
    body.maxBookingsPerDay !== undefined &&
    body.maxBookingsPerDay !== null &&
    (!Number.isInteger(body.maxBookingsPerDay) || body.maxBookingsPerDay < 0)
  ) {
    return 'กรุณาระบุจำนวนคิวต่อวันเป็นเลข 0 ขึ้นไป';
  }

  return null;
}

function toAvailabilityPayload(body: AvailabilityBody) {
  return {
    booking_date: body.date,
    is_closed: body.isClosed ?? false,
    open_time: body.openTime,
    close_time: body.closeTime,
    slot_interval_minutes: body.slotIntervalMinutes ?? null,
    max_bookings_per_day: body.maxBookingsPerDay ?? null,
    note: body.note?.trim() ?? '',
  };
}

function mapAvailabilityError(error: { code?: string; message: string }) {
  if (error.code === '23505') {
    return {
      status: 409,
      message: 'วันที่นี้มีในตารางเปิดรับคิวแล้ว กรุณาแก้ไขรายการเดิม',
    };
  }

  return {
    status: 400,
    message: error.message,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabaseAdmin
    .from('spa_booking_availability')
    .select(availabilitySelect)
    .order('booking_date', { ascending: true });

  if (from) {
    query = query.gte('booking_date', from);
  }

  if (to) {
    query = query.lte('booking_date', to);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ availability: (data ?? []).map(mapAvailability) });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as AvailabilityBody;
  const validationError = validateAvailabilityBody(body);

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_booking_availability')
    .upsert(toAvailabilityPayload(body), { onConflict: 'booking_date' })
    .select(availabilitySelect)
    .single();

  if (error) {
    const mappedError = mapAvailabilityError(error);

    return NextResponse.json({ message: mappedError.message }, { status: mappedError.status });
  }

  return NextResponse.json({ day: mapAvailability(data) });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as AvailabilityBody;
  const validationError = validateAvailabilityBody(body);

  if (!body.id) {
    return NextResponse.json({ message: 'Missing availability fields' }, { status: 400 });
  }

  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_booking_availability')
    .update(toAvailabilityPayload(body))
    .eq('id', body.id)
    .select(availabilitySelect)
    .single();

  if (error) {
    const mappedError = mapAvailabilityError(error);

    return NextResponse.json({ message: mappedError.message }, { status: mappedError.status });
  }

  return NextResponse.json({ day: mapAvailability(data) });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Missing availability id' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('spa_booking_availability').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
