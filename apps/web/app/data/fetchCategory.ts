import { createPublicClient } from '@/lib/supabase/server'
import { CategoryRepository, ProductRepository } from '@maison/db'
import { CategoryPageData } from '@maison/domain'
import { unstable_cache } from 'next/cache'

/**
 * Fetches specific category details and its standard product list.
 */
export const fetchCategoryData = async (categorySlug: string): Promise<CategoryPageData | null> => {
  return unstable_cache(
    async () => {
      const supabase = await createPublicClient()
      const categoryRepo = new CategoryRepository(supabase)
      const productRepo = new ProductRepository(supabase)
      
      const allCategories = await categoryRepo.findAllActive()
      
      // Handle "tous" (all) category case
      if (categorySlug === 'tous') {
        const products = await productRepo.search({ limit: 100 }).then(res => res.data)
        return {
          category: { 
            id: 'all', 
            name: 'Toutes les chaussures', 
            slug: 'tous', 
            description: 'Découvrez notre collection complète de chaussures artisanales en cuir.', 
            isActive: true, 
            order: 0, 
            image_url: null, 
            createdAt: null, 
            color: null 
          },
          products,
          allCategories
        }
      }

      const category = allCategories.find(c => c.slug === categorySlug)
      if (!category) return null

      const products = await productRepo.search({ 
        category: category.name, 
        limit: 100 
      }).then(res => res.data)
      
      return {
        category,
        products,
        allCategories
      }
    },
    [`category-detail-${categorySlug}`],
    { revalidate: 300, tags: ['products', 'categories'] }
  )()
}
