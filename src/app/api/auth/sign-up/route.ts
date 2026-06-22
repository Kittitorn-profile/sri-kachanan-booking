import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type SignUpBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignUpBody;

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';
  const firstName = body.firstName?.trim() ?? '';
  const lastName = body.lastName?.trim() ?? '';

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      account_source: 'web',
      role: 'user',
      approval_status: 'pending',
      display_name: `${firstName} ${lastName}`,
      requested_at: new Date().toISOString(),
    },
  });

  if (error) {
    const status = error.message.toLowerCase().includes('already') ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  const { error: profileError } = await supabaseAdmin.from('user_profiles').upsert({
    id: data.user.id,
    email,
    display_name: `${firstName} ${lastName}`,
    role: 'user',
    approval_status: 'pending',
    requested_at: new Date().toISOString(),
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    return NextResponse.json({ message: profileError.message }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: 'user',
      approvalStatus: 'pending',
    },
  });
}
