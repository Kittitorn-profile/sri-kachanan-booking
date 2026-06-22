-- Store back-office menu permissions for employee accounts.

alter table public.user_profiles
  add column if not exists admin_permissions text[] not null default '{}';

update public.user_profiles
set admin_permissions = array['dashboard']::text[]
where role = 'employee'
  and admin_permissions = '{}'::text[];
