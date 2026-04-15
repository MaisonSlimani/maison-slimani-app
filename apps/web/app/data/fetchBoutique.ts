import { createPublicClient } from '@/lib/supabase/server'
import { CategoryRepository } from '@maison/db'
import { unstable_cache } from 'next/cache'

/**
 * Fetches active categories for the boutique landing.
 */
export const fetchBoutiqueData = unstable_cache(
  async () => {
    const supabase = await createPublicClient()
    const categories = await new CategoryRepository(supabase).findAllActive()
    return { categories }
  },
  ['boutique-categories'],
  { revalidate: 600, tags: ['categories'] }
)
