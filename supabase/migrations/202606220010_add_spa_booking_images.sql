-- User-provided booking images.

alter table public.spa_bookings
add column if not exists image_urls text[] not null default '{}';
