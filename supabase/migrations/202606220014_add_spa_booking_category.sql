-- Store the customer-selected master category directly on bookings.

alter table public.spa_bookings
add column if not exists category_id uuid references public.spa_service_categories (id) on delete restrict;

update public.spa_bookings booking
set category_id = service.category_id
from public.spa_services service
where booking.category_id is null
  and booking.service_id = service.id;

alter table public.spa_bookings
  alter column service_id drop not null;

create index if not exists spa_bookings_category_id_idx
  on public.spa_bookings (category_id);

create unique index if not exists spa_bookings_no_double_time_idx
  on public.spa_bookings (booking_date, booking_time)
  where status in ('pending', 'confirmed', 'in_progress');
