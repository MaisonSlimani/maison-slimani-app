import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@maison/db';
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export const GET = createApiHandler(async (_req: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;

  if (!id) {
    throw { status: 400, message: 'ID requis' };
  }

  const supabase = await createClient();
  const repo = new ProductRepository(supabase);
  
  const products = await repo.getUpsellProducts(id);

  const response = NextResponse.json({ data: products });
  response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG);
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  return response;
});
