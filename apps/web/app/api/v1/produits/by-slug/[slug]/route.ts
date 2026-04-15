import { NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ProductRepository } from '@maison/db';
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

/**
 * Fetches a single product by its slug.
 */
export const GET = createApiHandler(async (_req: Request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;

  if (!slug) {
    throw { status: 400, message: 'Slug requis' };
  }

  const supabase = await createClient();
  const repo = new ProductRepository(supabase);
  
  const product = await repo.findBySlug(slug);

  if (!product) {
    throw { status: 404, message: 'Produit introuvable' };
  }

  const response = NextResponse.json({ data: product });
  response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG);
  
  return response;
});
