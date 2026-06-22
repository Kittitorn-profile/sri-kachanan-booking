import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../_utils/auth';
import { mapCategory, categorySelect, fetchSpaCategories } from '../_utils/spa-categories';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type CategoryBody = {
  id?: string;
  name?: string;
  description?: string;
  price?: number | null;
  isActive?: boolean;
};

function validatePrice(price: number | null | undefined) {
  if (price === undefined || price === null) {
    return null;
  }

  if (!Number.isFinite(price) || price < 0) {
    return 'กรุณาระบุราคาเป็นตัวเลข 0 ขึ้นไป';
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get('includeInactive') === 'true';

  if (includeInactive) {
    const auth = await requireAdmin(request, 'categories');

    if (auth.response) {
      return auth.response;
    }
  }

  const { data, error } = await fetchSpaCategories({ includeInactive });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ categories: (data ?? []).map(mapCategory) });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request, 'categories');

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CategoryBody;
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ message: 'Missing category name' }, { status: 400 });
  }

  const priceError = validatePrice(body.price);

  if (priceError) {
    return NextResponse.json({ message: priceError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_service_categories')
    .insert({
      name,
      description: body.description ?? '',
      price: body.price ?? null,
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
  const auth = await requireAdmin(request, 'categories');

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as CategoryBody;
  const name = body.name?.trim();

  if (!body.id || !name) {
    return NextResponse.json({ message: 'Missing category id or name' }, { status: 400 });
  }

  const priceError = validatePrice(body.price);

  if (priceError) {
    return NextResponse.json({ message: priceError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_service_categories')
    .update({
      name,
      description: body.description ?? '',
      price: body.price ?? null,
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
  const auth = await requireAdmin(request, 'categories');

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
          ? 'งานบริการนี้ถูกใช้งานอยู่ กรุณาปิดใช้งานแทนการลบ'
          : error.message,
      },
      { status: isReferenced ? 409 : 400 }
    );
  }

  return NextResponse.json({ success: true });
}
