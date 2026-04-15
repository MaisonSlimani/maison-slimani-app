import { createPublicClient } from '@/lib/supabase/server'
import { CategoryRepository, ProductRepository, SettingsRepository } from '@maison/db'
import { HomeData } from '@maison/domain'
import { unstable_cache } from 'next/cache'

/**
 * Fetches all necessary data for the home page in a single pass.
 * Optimized with Next.js unstable_cache for 2-minute persistence.
 */
export const fetchHomeData = unstable_cache(
  async (): Promise<HomeData> => {
    const supabase = await createPublicClient()
    
    // Concurrent fetching for minimum latency
    const [categories, featuredProducts, settings] = await Promise.all([
      new CategoryRepository(supabase).findAllActive(),
      new ProductRepository(supabase).findFeatured(6),
      new SettingsRepository(supabase).getSettings()
    ])

    // Process WhatsApp number exactly as the client hook did
    let whatsappNumber = null
    if (settings?.phone) {
      let phone = settings.phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\+/g, '')
      if (!phone.startsWith('212')) {
        const processedPhone = phone.startsWith('0') ? phone.substring(1) : phone
        phone = '212' + processedPhone
      }
      whatsappNumber = phone
    }

    return { 
      categories, 
      featuredProducts, 
      settings,
      whatsappNumber 
    }
  },
  ['home-data'],
  { revalidate: 120, tags: ['products', 'categories', 'settings'] }
)
