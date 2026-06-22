-- Treat users created directly in Supabase Authentication as super admins.
--
-- Frontend registration uses /api/auth/sign-up and writes user_metadata.account_source = 'web'.
-- Users created manually in Supabase Auth do not have that web-registration marker,
-- so they are promoted to admin and approved automatically.

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
