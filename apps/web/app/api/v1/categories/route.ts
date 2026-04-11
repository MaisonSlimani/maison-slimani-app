import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { CategoryRepository } from '@maison/db';
import { CATEGORIES_CACHE_TAG } from '@/lib/cache/tags';

const querySchema = z.object({
  slug: z.string().min(1).optional(),
  active: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
});

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const { slug, active } = querySchema.parse(Object.fromEntries(url.searchParams.entries()));

  const supabase = await createClient();
  const repo = new CategoryRepository(supabase);

  let data;
  if (slug) {
    const category = await repo.findBySlug(slug);
    data = category ? [category] : [];
  } else {
    data = active !== undefined ? await repo.findAllActive() : await repo.findAll();
  }

  const response = NextResponse.json({ data });
  
  // Set Caching Headers
  response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=900');
  response.headers.set('x-vercel-cache-tags', CATEGORIES_CACHE_TAG);

  return response;
});
