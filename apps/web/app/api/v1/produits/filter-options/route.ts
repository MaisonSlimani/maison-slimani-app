import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { ProductFilterRepository } from '@maison/db';

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const categorie = url.searchParams.get('categorie');

  const supabase = await createClient();
  const repo = new ProductFilterRepository(supabase);
  
  const options = await repo.getFilterOptions(categorie || undefined);

  return options;
});
