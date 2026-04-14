
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@maison/db';
import { produitQuerySchema } from '@maison/domain';

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const rawParams = parseMultiValueParams(url.searchParams);
  const filters = produitQuerySchema.parse(rawParams);

  const supabase = await createClient();
  const repo = new ProductRepository(supabase);
  
  const { data: products, count } = await repo.search(filters);

  return {
    items: products,
    total: count,
    page: Math.floor(filters.offset / filters.limit) + 1
  };
});

/**
 * Helper to correctly parse array-like search params which Next.js/Browser sometimes collapses
 */
function parseMultiValueParams(searchParams: URLSearchParams) {
  const result: Record<string, string | string[]> = {};
  searchParams.forEach((val, key) => {
    if (key === 'couleur' || key === 'taille') {
      if (!result[key]) {
        result[key] = searchParams.getAll(key);
      }
    } else {
      result[key] = val;
    }
  });
  return result;
}
