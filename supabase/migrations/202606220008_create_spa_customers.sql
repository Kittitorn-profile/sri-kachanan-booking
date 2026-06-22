-- Customer master generated after completed spa bookings.

create table if not exists public.spa_customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.user_profiles (id) on delete set null,
  display_name text not null,
  phone text not null,
  email text,
  total_visits integer not null default 0 check (total_visits >= 0),
  last_booking_id uuid references public.spa_bookings (id) on delete set null,
  last_service_id uuid references public.spa_services (id) on delete set null,
  last_staff_id uuid references public.spa_staff (id) on delete set null,
  last_visited_at timestamptz,
  last_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spa_customers_profile_or_phone_unique unique (profile_id, phone)
);

create index if not exists spa_customers_profile_id_idx on public.spa_customers (profile_id);
create index if not exists spa_customers_phone_idx on public.spa_customers (phone);
create index if not exists spa_customers_last_visited_at_idx
  on public.spa_customers (last_visited_at desc);

drop trigger if exists spa_customers_set_updated_at on public.spa_customers;
create trigger spa_customers_set_updated_at
before update on public.spa_customers
for each row
execute function public.set_updated_at();

alter table public.spa_customers enable row level security;

drop policy if exists "Admins can read spa customers" on public.spa_customers;
create policy "Admins can read spa customers"
on public.spa_customers
for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "Admins can update spa customers" on public.spa_customers;
create policy "Admins can update spa customers"
on public.spa_customers
for update
to authenticated
using (
  exists (
    select 1
    from public.user_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);
