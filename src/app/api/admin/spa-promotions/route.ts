import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

import { requireAdmin } from '../../_utils/auth';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

type PromotionBody = {
  id?: string;
  title?: string;
  code?: string;
  description?: string;
  discountLabel?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};

const promotionSelect =
  'id, title, code, description, discount_label, starts_at, ends_at, is_active, created_at, updated_at';

function mapPromotion(promotion: any) {
  return {
    id: promotion.id,
    title: promotion.title,
    code: promotion.code,
    description: promotion.description,
    discountLabel: promotion.discount_label,
    startsAt: promotion.starts_at,
    endsAt: promotion.ends_at,
    isActive: promotion.is_active,
    createdAt: promotion.created_at,
    updatedAt: promotion.updated_at,
  };
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeDate(date?: string | null) {
  return date?.trim() || null;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { data, error } = await supabaseAdmin
    .from('spa_promotions')
    .select(promotionSelect)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ promotions: (data ?? []).map(mapPromotion) });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as PromotionBody;
  const title = body.title?.trim();
  const code = body.code ? normalizeCode(body.code) : '';

  if (!title || !code) {
    return NextResponse.json({ message: 'Missing promotion title or code' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_promotions')
    .insert({
      title,
      code,
      description: body.description?.trim() ?? '',
      discount_label: body.discountLabel?.trim() ?? '',
      starts_at: normalizeDate(body.startsAt),
      ends_at: normalizeDate(body.endsAt),
      is_active: body.isActive ?? true,
    })
    .select(promotionSelect)
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ promotion: mapPromotion(data) });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as PromotionBody;
  const title = body.title?.trim();
  const code = body.code ? normalizeCode(body.code) : '';

  if (!body.id || !title || !code) {
    return NextResponse.json({ message: 'Missing promotion id, title or code' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('spa_promotions')
    .update({
      title,
      code,
      description: body.description?.trim() ?? '',
      discount_label: body.discountLabel?.trim() ?? '',
      starts_at: normalizeDate(body.startsAt),
      ends_at: normalizeDate(body.endsAt),
      is_active: body.isActive ?? true,
    })
    .eq('id', body.id)
    .select(promotionSelect)
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;

    return NextResponse.json({ message: error.message }, { status });
  }

  return NextResponse.json({ promotion: mapPromotion(data) });
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Missing promotion id' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('spa_promotions').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
