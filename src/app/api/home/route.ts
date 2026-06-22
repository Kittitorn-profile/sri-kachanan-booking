import { NextResponse } from 'next/server';

import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

export const runtime = 'nodejs';

const serviceImages = [
  '/assets/spa/aroma-oil.png',
  '/assets/spa/facial-ritual.png',
  '/assets/spa/herbal-soak.png',
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const [categoriesResult, promotionsResult] = await Promise.all([
    supabaseAdmin
      .from('spa_service_categories')
      .select('id, name, description, price')
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('spa_promotions')
      .select('id, title, code, description, discount_label, starts_at, ends_at')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${today}`)
      .or(`ends_at.is.null,ends_at.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const firstError = [categoriesResult.error, promotionsResult.error].find(Boolean);

  if (firstError) {
    return NextResponse.json({ message: firstError.message }, { status: 400 });
  }

  const services = (categoriesResult.data ?? []).map((category, index) => ({
    id: category.id,
    title: category.name,
    price: category.price === null ? null : Number(category.price),
    tag: index === 0 ? 'แนะนำ' : index === 1 ? 'ขายดี' : 'ผ่อนคลาย',
    body: stripHtml(category.description || ''),
    image: serviceImages[index % serviceImages.length],
  }));
  const promotions = (promotionsResult.data ?? []).map((promotion) => ({
    id: promotion.id,
    title: promotion.title,
    code: promotion.code,
    description: promotion.description,
    discountLabel: promotion.discount_label,
  }));

  return NextResponse.json({
    services,
    promotions,
    heroPromotion: promotions[0] ?? null,
  });
}
