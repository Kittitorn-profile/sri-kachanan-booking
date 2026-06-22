-- Spa booking data model.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'spa_booking_status'
  ) then
    create type public.spa_booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
end;
$$;

create table if not exists public.spa_services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spa_staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.user_profiles (id) on delete set null,
  display_name text not null unique,
  specialty text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spa_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_no text not null unique,
  customer_id uuid not null references public.user_profiles (id) on delete cascade,
  service_id uuid not null references public.spa_services (id),
  staff_id uuid not null references public.spa_staff (id),
  booking_date date not null,
  booking_time time not null,
  customer_name text not null,
  phone text not null,
  customer_note text not null default '',
  status public.spa_booking_status not null default 'pending',
  review_rating integer check (review_rating between 1 and 5),
  review_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists spa_bookings_customer_id_idx on public.spa_bookings (customer_id);
create index if not exists spa_bookings_schedule_idx
  on public.spa_bookings (booking_date, booking_time, staff_id);

create unique index if not exists spa_bookings_no_double_slot_idx
  on public.spa_bookings (booking_date, booking_time, staff_id)
  where status in ('pending', 'confirmed');

drop trigger if exists spa_services_set_updated_at on public.spa_services;
create trigger spa_services_set_updated_at
before update on public.spa_services
for each row
execute function public.set_updated_at();

drop trigger if exists spa_staff_set_updated_at on public.spa_staff;
create trigger spa_staff_set_updated_at
before update on public.spa_staff
for each row
execute function public.set_updated_at();

drop trigger if exists spa_bookings_set_updated_at on public.spa_bookings;
create trigger spa_bookings_set_updated_at
before update on public.spa_bookings
for each row
execute function public.set_updated_at();

alter table public.spa_services enable row level security;
alter table public.spa_staff enable row level security;
alter table public.spa_bookings enable row level security;

drop policy if exists "Authenticated users can read active services" on public.spa_services;
create policy "Authenticated users can read active services"
on public.spa_services
for select
to authenticated
using (is_active = true);

drop policy if exists "Authenticated users can read active staff" on public.spa_staff;
create policy "Authenticated users can read active staff"
on public.spa_staff
for select
to authenticated
using (is_active = true);

drop policy if exists "Users can read own bookings" on public.spa_bookings;
create policy "Users can read own bookings"
on public.spa_bookings
for select
to authenticated
using (customer_id = auth.uid());

insert into public.spa_services (name, duration_minutes, price)
values
  ('นวดน้ำมันคชานัน', 90, 2400),
  ('พิธีผิวใสสมุนไพร', 75, 1900),
  ('แช่เท้าดอกบัวและประคบ', 60, 1500)
on conflict (name) do update
set
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  is_active = true;

insert into public.spa_staff (display_name, specialty)
values
  ('ดาว', 'นวดน้ำมัน'),
  ('น้ำ', 'ดูแลผิว'),
  ('เมย์', 'ประคบสมุนไพร')
on conflict (display_name) do update
set
  specialty = excluded.specialty,
  is_active = true;
