-- Repair public.user_profiles from existing Supabase Authentication users.
-- Use this when auth users already exist but login shows "ไม่พบข้อมูลสิทธิ์ผู้ใช้".

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
