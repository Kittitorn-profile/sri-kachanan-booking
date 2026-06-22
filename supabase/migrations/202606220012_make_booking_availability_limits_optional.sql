-- Allow booking interval and daily capacity to be optional.

alter table public.spa_booking_availability
  alter column slot_interval_minutes drop not null,
  alter column max_bookings_per_day drop not null;
