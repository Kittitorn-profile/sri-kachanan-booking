-- Booking job opening flow.

alter type public.spa_booking_status add value if not exists 'in_progress' after 'confirmed';

alter table public.spa_bookings
add column if not exists job_items text not null default '',
add column if not exists job_image_urls text[] not null default '{}',
add column if not exists job_opened_at timestamptz;
