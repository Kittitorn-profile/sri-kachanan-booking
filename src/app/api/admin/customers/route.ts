import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

function mapCustomer(customer: any) {
  return {
    id: customer.id,
    profileId: customer.profile_id,
    displayName: customer.display_name,
    phone: customer.phone,
    email: customer.email,
    totalVisits: customer.total_visits,
    lastVisitedAt: customer.last_visited_at,
    lastNote: customer.last_note,
    lastService: customer.spa_services?.name ?? '-',
    lastStaff: customer.spa_staff?.display_name ?? '-',
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();

  let query = supabaseAdmin
    .from('spa_customers')
    .select(
      `
        id,
        profile_id,
        display_name,
        phone,
        email,
        total_visits,
        last_visited_at,
        last_note,
        created_at,
        updated_at,
        spa_services (name),
        spa_staff (display_name)
      `
    )
    .order('last_visited_at', { ascending: false, nullsFirst: false });

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    customers: (data ?? []).map(mapCustomer),
    total: data?.length ?? 0,
  });
}
