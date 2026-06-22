import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type AppRole = 'admin' | 'user';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return NextResponse.json({ message: 'Missing authorization token' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json({ message: 'Invalid authorization token' }, { status: 401 });
  }

  const metadata = data.user.user_metadata ?? {};
  const isWebRegistered = metadata.account_source === 'web' || Boolean(metadata.requested_at);
  const role: AppRole = isWebRegistered ? 'user' : 'admin';
  const approvalStatus: ApprovalStatus =
    role === 'admin'
      ? 'approved'
      : ((metadata.approval_status as ApprovalStatus | undefined) ?? 'pending');
  const displayName =
    (metadata.display_name as string | undefined) || data.user.email || (role === 'admin' ? 'Super Admin' : '');

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        id: data.user.id,
        email: data.user.email ?? '',
        display_name: displayName,
        role,
        approval_status: approvalStatus,
        approved_at: approvalStatus === 'approved' ? new Date().toISOString() : null,
        rejected_at: null,
      },
      { onConflict: 'id' }
    )
    .select('display_name, role, approval_status')
    .single();

  if (profileError) {
    return NextResponse.json({ message: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ profile });
}
