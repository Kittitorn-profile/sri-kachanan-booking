-- Master categories for spa services.

create table if not exists public.spa_service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.spa_services
add column if not exists category_id uuid references public.spa_service_categories (id) on delete restrict;

create index if not exists spa_services_category_id_idx on public.spa_services (category_id);

drop trigger if exists spa_service_categories_set_updated_at on public.spa_service_categories;
create trigger spa_service_categories_set_updated_at
before update on public.spa_service_categories
for each row
execute function public.set_updated_at();

alter table public.spa_service_categories enable row level security;

drop policy if exists "Authenticated users can read active spa categories" on public.spa_service_categories;
create policy "Authenticated users can read active spa categories"
on public.spa_service_categories
for select
to authenticated
using (is_active = true);

insert into public.spa_service_categories (name, description)
values
  ('นวดผ่อนคลาย', 'บริการนวดเพื่อผ่อนคลายกล้ามเนื้อและลดความตึงเครียด'),
  ('ดูแลผิว', 'ทรีตเมนต์ผิวหน้าและผิวกายด้วยสมุนไพร'),
  ('ประคบสมุนไพร', 'บริการประคบและแช่เท้าด้วยสมุนไพรไทย')
on conflict (name) do update
set
  description = excluded.description,
  is_active = true;

update public.spa_services service
set category_id = category.id
from public.spa_service_categories category
where service.name = 'นวดน้ำมันคชานัน'
  and category.name = 'นวดผ่อนคลาย';

update public.spa_services service
set category_id = category.id
from public.spa_service_categories category
where service.name = 'พิธีผิวใสสมุนไพร'
  and category.name = 'ดูแลผิว';

update public.spa_services service
set category_id = category.id
from public.spa_service_categories category
where service.name = 'แช่เท้าดอกบัวและประคบ'
  and category.name = 'ประคบสมุนไพร';
