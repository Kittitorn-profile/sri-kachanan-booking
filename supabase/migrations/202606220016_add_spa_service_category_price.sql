-- Optional service-job price on master service categories.

alter table public.spa_service_categories
  add column if not exists price numeric(10, 2) check (price is null or price >= 0);
