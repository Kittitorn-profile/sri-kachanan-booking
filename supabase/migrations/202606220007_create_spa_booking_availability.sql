-- Daily booking availability master.

create table if not exists public.spa_booking_availability (
  id uuid primary key default gen_random_uuid(),
  booking_date date not null unique,
  is_closed boolean not null default false,
  open_time time not null default '10:00',
  close_time time not null default '18:00',
  slot_interval_minutes integer not null default 90 check (slot_interval_minutes > 0),
  max_bookings_per_day integer not null default 6 check (max_bookings_per_day >= 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spa_booking_availability_time_order check (open_time < close_time)
);

create index if not exists spa_booking_availability_booking_date_idx
  on public.spa_booking_availability (booking_date);

drop trigger if exists spa_booking_availability_set_updated_at on public.spa_booking_availability;
create trigger spa_booking_availability_set_updated_at
before update on public.spa_booking_availability
for each row
execute function public.set_updated_at();

alter table public.spa_booking_availability enable row level security;

drop policy if exists "Authenticated users can read booking availability" on public.spa_booking_availability;
create policy "Authenticated users can read booking availability"
on public.spa_booking_availability
for select
to authenticated
using (true);

insert into public.spa_booking_availability (
  booking_date,
  is_closed,
  open_time,
  close_time,
  slot_interval_minutes,
  max_bookings_per_day,
  note
)
select
  (current_date + offset_day)::date,
  false,
  '10:00'::time,
  '18:00'::time,
  90,
  6,
  ''
from generate_series(0, 14) as offset_day
on conflict (booking_date) do nothing;
