import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { SearchRepository } from '@maison/db';
import { searchSuggestionsQuerySchema } from '@maison/domain';

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const { q: query, type = 'all', limit = 5 } = searchSuggestionsQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
  
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

  const response = NextResponse.json({ 
    success: true, 
    data: suggestions, 
    query 
  });
  
  response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30');
  
  return response;
});
