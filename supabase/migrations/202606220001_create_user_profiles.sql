-- User registration and approval schema for Sri Kachanan Booking.
-- Run this in Supabase SQL editor or via Supabase CLI.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'user');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'approval_status'
  ) then
    create type public.approval_status as enum ('pending', 'approved', 'rejected');
  end if;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  phone text,
  role public.app_role not null default 'user',
  approval_status public.approval_status not null default 'pending',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_role_idx on public.user_profiles (role);
create index if not exists user_profiles_approval_status_idx
  on public.user_profiles (approval_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_web_registered boolean :=
    new.raw_user_meta_data ->> 'account_source' = 'web'
    or new.raw_user_meta_data ? 'requested_at';
  next_role public.app_role := case
    when is_web_registered then 'user'::public.app_role
    else 'admin'::public.app_role
  end;
  next_status public.approval_status := case
    when not is_web_registered then 'approved'::public.approval_status
    else coalesce(
      (new.raw_user_meta_data ->> 'approval_status')::public.approval_status,
      'pending'::public.approval_status
    )
  end;
begin
  insert into public.user_profiles (
    id,
    email,
    display_name,
    phone,
    role,
    approval_status,
    requested_at,
    approved_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    next_role,
    next_status,
    coalesce((new.raw_user_meta_data ->> 'requested_at')::timestamptz, now()),
    case when next_status = 'approved' then now() else null end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name,
    phone = excluded.phone,
    role = excluded.role,
    approval_status = excluded.approval_status,
    requested_at = excluded.requested_at,
    approved_at = excluded.approved_at,
    rejected_at = null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles
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

drop policy if exists "Admins can update all profiles" on public.user_profiles;
create policy "Admins can update all profiles"
on public.user_profiles
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

-- Backfill existing Supabase Authentication users after creating/recreating the profile table.
insert into public.user_profiles (
  id,
  email,
  display_name,
  role,
  approval_status,
  approved_at
)
select
  auth_user.id,
  coalesce(auth_user.email, ''),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'display_name', ''), auth_user.email, 'Super Admin'),
  case
    when auth_user.raw_user_meta_data ->> 'account_source' = 'web'
      or auth_user.raw_user_meta_data ? 'requested_at'
      then 'user'::public.app_role
    else 'admin'::public.app_role
  end,
  case
    when auth_user.raw_user_meta_data ->> 'account_source' = 'web'
      or auth_user.raw_user_meta_data ? 'requested_at'
      then coalesce(
      (auth_user.raw_user_meta_data ->> 'approval_status')::public.approval_status,
      'pending'::public.approval_status
    )
    else 'approved'::public.approval_status
  end,
  case
    when auth_user.raw_user_meta_data ->> 'account_source' = 'web'
      or auth_user.raw_user_meta_data ? 'requested_at'
      then null
    else now()
  end
from auth.users auth_user
on conflict (id) do update
set
  email = excluded.email,
  display_name = coalesce(nullif(public.user_profiles.display_name, ''), excluded.display_name),
  role = excluded.role,
  approval_status = excluded.approval_status,
  approved_at = coalesce(public.user_profiles.approved_at, excluded.approved_at),
  rejected_at = null;
