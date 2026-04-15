import { createPublicClient } from '@/lib/supabase/server'
import { ProductRepository } from '@maison/db'
import { Product } from '@maison/domain'
import { createLogger } from '@maison/shared'

const logger = createLogger('data.fetchProduct')

/**
  * Fetches a single product by category slug and product slug with caching.
  * Follows Clean Architecture by using the Repository layer.
  */
export const fetchProductByPath = async (categorySlug: string, productSlug: string): Promise<Product | null> => {
  logger.info(`Requesting: category=${categorySlug}, slug=${productSlug}`);
  
  try {
    const supabase = await createPublicClient()
    const repo = new ProductRepository(supabase)
    
    const product = await repo.findByCategoryAndSlug(categorySlug, productSlug)
    logger.info(`Result: ${product ? 'Found' : 'NOT FOUND'}`);
    return product;
  } catch (error) {
    console.error(`[FetchProduct] Error:`, error);
    return null;
  }
}
