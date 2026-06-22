-- Spa promotions and coupons.

create extension if not exists pgcrypto;

create table if not exists public.spa_promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null unique,
  description text not null default '',
  discount_label text not null default '',
  starts_at date,
  ends_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spa_promotions_date_range_check
    check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create index if not exists spa_promotions_active_idx
  on public.spa_promotions (is_active, starts_at, ends_at);

drop trigger if exists spa_promotions_set_updated_at on public.spa_promotions;
create trigger spa_promotions_set_updated_at
before update on public.spa_promotions
for each row
execute function public.set_updated_at();

alter table public.spa_promotions enable row level security;

drop policy if exists "Authenticated users can read active promotions" on public.spa_promotions;
create policy "Authenticated users can read active promotions"
on public.spa_promotions
for select
to authenticated
using (is_active = true);

insert into public.spa_promotions (title, code, description, discount_label, starts_at, ends_at)
values
  (
    'ลด 20% สำหรับจองออนไลน์',
    'ONLINE20',
    'ใช้สำหรับลูกค้าที่จองคิวผ่านระบบออนไลน์',
    'ลด 20%',
    current_date,
    current_date + interval '30 days'
  ),
  (
    'คูปองวันเกิดสมาชิก',
    'BDAYSPA',
    'คูปองสำหรับสมาชิกในเดือนเกิด',
    'ของขวัญวันเกิด',
    null,
    null
  )
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  discount_label = excluded.discount_label,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  is_active = true;
