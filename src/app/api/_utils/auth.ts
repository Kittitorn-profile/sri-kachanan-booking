import type { User } from '@supabase/supabase-js';

import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

const backOfficeRoles = ['admin', 'employee'];

export type ApiAuthResult =
  | { user: User; response?: never }
  | { user?: never; response: NextResponse };

export async function requireAdmin(
  request: Request,
  permission?: string
): Promise<ApiAuthResult> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      response: NextResponse.json({ message: 'Missing authorization token' }, { status: 401 }),
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return {
      response: NextResponse.json({ message: 'Invalid authorization token' }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('role, admin_permissions')
    .eq('id', data.user.id)
    .single();

  if (profileError || !backOfficeRoles.includes(profile?.role)) {
    return {
      response: NextResponse.json({ message: 'Admin permission required' }, { status: 403 }),
    };
  }

  if (
    profile.role === 'employee' &&
    permission &&
    !(profile.admin_permissions ?? []).includes(permission)
  ) {
    return {
      response: NextResponse.json({ message: 'Menu permission required' }, { status: 403 }),
    };
  }

  return { user: data.user };
}

export async function requireBackOffice(
  request: Request,
  permission?: string
): Promise<ApiAuthResult> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      response: NextResponse.json({ message: 'Missing authorization token' }, { status: 401 }),
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return {
      response: NextResponse.json({ message: 'Invalid authorization token' }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('role, admin_permissions')
    .eq('id', data.user.id)
    .single();

  if (profileError || !['admin', 'employee'].includes(profile?.role)) {
    return {
      response: NextResponse.json({ message: 'Back office permission required' }, { status: 403 }),
    };
  }

  if (
    profile.role === 'employee' &&
    permission &&
    !(profile.admin_permissions ?? []).includes(permission)
  ) {
    return {
      response: NextResponse.json({ message: 'Menu permission required' }, { status: 403 }),
    };
  }

  return { user: data.user };
}
