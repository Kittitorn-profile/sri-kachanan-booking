-- Booking no longer requires staff selection. Categories/services are the shared master data.

alter table public.spa_bookings
  alter column staff_id drop not null;

drop index if exists public.spa_bookings_schedule_idx;
drop index if exists public.spa_bookings_no_double_slot_idx;

create index if not exists spa_bookings_schedule_idx
  on public.spa_bookings (booking_date, booking_time);

create unique index if not exists spa_bookings_no_double_slot_idx
  on public.spa_bookings (booking_date, booking_time)
  where status in ('pending', 'confirmed', 'in_progress');
