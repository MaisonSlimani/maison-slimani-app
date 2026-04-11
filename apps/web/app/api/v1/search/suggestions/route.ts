import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { SearchRepository } from '@maison/db';

const querySchema = z.object({
  q: z.string().trim().min(0).max(100).optional(),
  type: z.enum(['all', 'products', 'categories', 'trending']).optional(),
  limit: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(20))
    .optional(),
});

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const validated = querySchema.parse(Object.fromEntries(url.searchParams.entries()));

  const { q: query, type = 'all', limit = 5 } = validated;
  
  const supabase = await createClient();
  const repo = new SearchRepository(supabase);
  
  const suggestions: {
    products: Awaited<ReturnType<SearchRepository['getProductSuggestions']>>;
    categories: Awaited<ReturnType<SearchRepository['getCategorySuggestions']>>;
    trending: Awaited<ReturnType<SearchRepository['getTrendingSearches']>>;
  } = {
    products: [],
    categories: [],
    trending: []
  };

  if (type === 'all' || type === 'trending') {
    suggestions.trending = await repo.getTrendingSearches(limit);
  }

  if (query) {
    if (type === 'all' || type === 'products') {
      suggestions.products = await repo.getProductSuggestions(query, limit);
    }
    if (type === 'all' || type === 'categories') {
      suggestions.categories = await repo.getCategorySuggestions(query, limit);
    }
  }

  const response = NextResponse.json({ data: suggestions, query });
  response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30');
  
  return response;
});
