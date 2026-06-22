import { supabaseAdmin } from 'src/lib/supabase-admin';

// ----------------------------------------------------------------------

export type SpaCategoryRow = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const categorySelect = 'id, name, description, price, is_active, created_at, updated_at';

export function mapCategory(category: SpaCategoryRow) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    price: category.price === null ? null : Number(category.price),
    isActive: category.is_active,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}

export async function fetchSpaCategories({ includeInactive = false } = {}) {
  let query = supabaseAdmin
    .from('spa_service_categories')
    .select(categorySelect)
    .order(includeInactive ? 'created_at' : 'name', { ascending: !includeInactive });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  return query;
}
