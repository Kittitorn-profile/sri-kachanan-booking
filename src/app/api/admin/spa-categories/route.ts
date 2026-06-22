import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type CategoryBody = {
  id?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
};

function mapCategory(category: any) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.is_active,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}

const categorySelect = 'id, name, description, is_active, created_at, updated_at';

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { data, error } = await supabaseAdmin
    .from('spa_service_categories')
    .select(categorySelect)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ categories: (data ?? []).map(mapCategory) });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CategoryBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ message: 'Missing category name' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_service_categories')
    .insert({
      name,
      description: body.description?.trim() ?? '',
      is_active: body.isActive ?? true,
    })
    .select(categorySelect)
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ category: mapCategory(data) });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CategoryBody;
  const name = body.name?.trim();

  if (!body.id || !name) {
    return NextResponse.json({ message: 'Missing category id or name' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_service_categories')
    .update({
      name,
      description: body.description?.trim() ?? '',
      is_active: body.isActive ?? true,
    })
    .eq('id', body.id)
    .select(categorySelect)
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ category: mapCategory(data) });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Missing category id' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('spa_service_categories').delete().eq('id', id);

  if (error) {
    const isReferenced = error.code === '23503';

    return NextResponse.json(
      {
        message: isReferenced
          ? 'หมวดหมู่นี้ถูกใช้งานกับบริการอยู่ กรุณาปิดใช้งานแทนการลบ'
          : error.message,
      },
      { status: isReferenced ? 409 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
