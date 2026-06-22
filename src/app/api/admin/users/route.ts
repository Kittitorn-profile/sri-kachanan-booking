import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type AppRole = 'admin' | 'employee' | 'user';

type UpdateUserBody = {
  userId?: string;
  approvalStatus?: ApprovalStatus;
  adminPermissions?: string[];
};

type CreateUserBody = {
  email?: string;
  password?: string;
  displayName?: string;
  phone?: string;
  role?: AppRole;
  approvalStatus?: ApprovalStatus;
  adminPermissions?: string[];
};

const adminPermissionValues = [
  'dashboard',
  'registrationRequests',
  'customers',
  'services',
  'staff',
  'availability',
  'promotions',
  'categories',
  'revenue',
];

function normalizeAdminPermissions(permissions: string[] | undefined) {
  return Array.from(
    new Set(
      (permissions ?? ['dashboard']).filter((permission) => adminPermissionValues.includes(permission))
    )
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const role = searchParams.get('role');
  const auth = await requireAdmin(request, role === 'user' ? 'registrationRequests' : 'staff');

  if (auth.response) {
    return auth.response;
  }

  let query = supabaseAdmin
    .from('user_profiles')
    .select(
      'id, email, phone, display_name, role, approval_status, admin_permissions, requested_at, approved_at, rejected_at, created_at, updated_at'
    )
    .order('requested_at', { ascending: false });

  if (status) {
    query = query.eq('approval_status', status);
  }

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const users = data.map((user) => ({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    displayName: user.display_name,
    adminPermissions: user.admin_permissions ?? [],
    approvalStatus: user.approval_status,
    requestedAt: user.requested_at,
    approvedAt: user.approved_at,
    rejectedAt: user.rejected_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));

  return NextResponse.json({
    users,
    total: users.length,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request, 'staff');

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CreateUserBody;

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';
  const displayName = body.displayName?.trim() ?? '';
  const phone = body.phone?.trim() || null;
  const role = body.role ?? 'employee';
  const approvalStatus = body.approvalStatus ?? 'approved';
  const adminPermissions = normalizeAdminPermissions(body.adminPermissions);
  const requestedAt = new Date().toISOString();

  if (!email || !password || !displayName) {
    return NextResponse.json({ message: 'Missing email, password, or displayName' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }

  if (role !== 'employee') {
    return NextResponse.json({ message: 'Only employee creation is supported here' }, { status: 400 });
  }

  if (!['approved', 'rejected'].includes(approvalStatus)) {
    return NextResponse.json(
      { message: 'Employee approvalStatus must be approved or rejected' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    phone: phone ?? undefined,
    user_metadata: {
      account_source: 'admin',
      role,
      approval_status: approvalStatus,
      admin_permissions: adminPermissions,
      display_name: displayName,
      phone,
      requested_at: requestedAt,
      approved_at: approvalStatus === 'approved' ? requestedAt : null,
      rejected_at: approvalStatus === 'rejected' ? requestedAt : null,
    },
  });

  if (error) {
    const status = error.message.toLowerCase().includes('already') ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id: data.user.id,
      email,
      phone,
      display_name: displayName,
      role,
      approval_status: approvalStatus,
      admin_permissions: adminPermissions,
      requested_at: requestedAt,
      approved_at: approvalStatus === 'approved' ? requestedAt : null,
      rejected_at: approvalStatus === 'rejected' ? requestedAt : null,
    })
    .select(
      'id, email, phone, display_name, role, approval_status, admin_permissions, requested_at, approved_at, rejected_at, created_at, updated_at'
    )
    .single();

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);

    return NextResponse.json({ message: profileError.message }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      displayName: profile.display_name,
      adminPermissions: profile.admin_permissions ?? [],
      approvalStatus: profile.approval_status,
      requestedAt: profile.requested_at,
      approvedAt: profile.approved_at,
      rejectedAt: profile.rejected_at,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as UpdateUserBody;

  if (!body.userId || (!body.approvalStatus && !body.adminPermissions)) {
    return NextResponse.json({ message: 'Missing userId, approvalStatus, or adminPermissions' }, { status: 400 });
  }

  const { data: targetUser, error: targetUserError } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', body.userId)
    .single();

  if (targetUserError) {
    return NextResponse.json({ message: targetUserError.message }, { status: 400 });
  }

  const auth = await requireAdmin(
    request,
    targetUser.role === 'user' ? 'registrationRequests' : 'staff'
  );

  if (auth.response) {
    return auth.response;
  }

  if (body.approvalStatus && !['pending', 'approved', 'rejected'].includes(body.approvalStatus)) {
    return NextResponse.json({ message: 'Invalid approvalStatus' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.approvalStatus) {
    const timestampKey =
      body.approvalStatus === 'approved'
        ? 'approved_at'
        : body.approvalStatus === 'rejected'
          ? 'rejected_at'
          : 'requested_at';

    patch.approval_status = body.approvalStatus;
    patch[timestampKey] = new Date().toISOString();
  }

  if (body.adminPermissions) {
    patch.admin_permissions = normalizeAdminPermissions(body.adminPermissions);
  }

  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(patch)
    .eq('id', body.userId)
    .select(
      'id, email, phone, display_name, role, approval_status, admin_permissions, requested_at, approved_at, rejected_at, created_at, updated_at'
    )
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  await supabaseAdmin.auth.admin.updateUserById(body.userId, {
    user_metadata: {
      role: data.role,
      approval_status: data.approval_status,
      admin_permissions: data.admin_permissions ?? [],
      display_name: data.display_name,
      requested_at: data.requested_at,
      approved_at: data.approved_at,
      rejected_at: data.rejected_at,
    },
  });

  return NextResponse.json({
    user: {
      id: data.id,
      email: data.email,
      phone: data.phone,
      role: data.role,
      displayName: data.display_name,
      adminPermissions: data.admin_permissions ?? [],
      approvalStatus: data.approval_status,
      requestedAt: data.requested_at,
      approvedAt: data.approved_at,
      rejectedAt: data.rejected_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  });
}
