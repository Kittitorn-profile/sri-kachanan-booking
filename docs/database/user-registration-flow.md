# User Registration Flow

## Tables

Run:

```sql
-- supabase/migrations/202606220001_create_user_profiles.sql
```

The main table is `public.user_profiles`.

Important columns:

- `id`: references `auth.users.id`
- `email`
- `display_name`
- `phone`
- `role`: `admin` or `user`
- `approval_status`: `pending`, `approved`, or `rejected`
- `requested_at`
- `approved_at`
- `rejected_at`

## Flow

1. User submits register form.
2. Frontend calls `POST /api/auth/sign-up`.
3. Backend creates Supabase Auth user and inserts/upserts `public.user_profiles`.
4. New users are created with:

```txt
account_source = web
role = user
approval_status = pending
```

5. Admin dashboard calls `GET /api/admin/users?role=user&status=pending`.
6. Admin approves or rejects via `PATCH /api/admin/users`.
7. Login is allowed only when:

```txt
role = admin
```

or:

```txt
role = user
approval_status = approved
```

## Supabase-Created Admins

Users created directly in Supabase Authentication are treated as super admins.
They do not have the web-registration marker, so the system stores them as:

```txt
role = admin
approval_status = approved
```

The base schema already creates the trigger and backfills existing Auth users:

```sql
-- supabase/migrations/202606220001_create_user_profiles.sql
```

If the table already exists and profiles need to be repaired, run:

```sql
-- supabase/migrations/202606220003_repair_user_profiles_from_auth.sql
```

Frontend registration still creates users with:

```txt
user_metadata.account_source = web
```

So frontend-registered users remain normal users and wait for approval.

If a Supabase-created admin still cannot log in, check both conditions:

```sql
select id, email, display_name, role, approval_status
from public.user_profiles
where email = '<admin-email>';
```

Expected:

```txt
role = admin
approval_status = approved
```

## Required Vercel Env

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

`SUPABASE_SECRET_KEY` stays server-side only and is used by `/api/*` routes.
