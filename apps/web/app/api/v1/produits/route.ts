
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@maison/db';

const optionalNumber = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.coerce.number().optional()
);

const querySchema = z.object({
  search: z.string().optional(),
  categorie: z.string().optional(),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  inStock: z.preprocess((v) => v === 'true', z.boolean().optional()),
  couleur: z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : undefined), z.array(z.string()).optional()),
  taille: z.preprocess((v) => (Array.isArray(v) ? v : v ? [v] : undefined), z.array(z.string()).optional()),
  sort: z.enum(['prix_asc', 'prix_desc']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  useFullText: z.preprocess((v) => v === 'true', z.boolean().default(false))
});

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const rawParams = parseMultiValueParams(url.searchParams);
  const filters = querySchema.parse(rawParams);

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
