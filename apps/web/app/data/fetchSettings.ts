import { createPublicClient } from '@/lib/supabase/server'
import { SettingsRepository } from '@maison/db'
import { SiteSettings } from '@maison/domain'
import { unstable_cache } from 'next/cache'

/**
 * Fetches site settings for the contact page.
 */
export const fetchSettingsData = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    const supabase = await createPublicClient()
    return new SettingsRepository(supabase).getSettings()
  },
  ['site-settings'],
  { revalidate: 3600, tags: ['settings'] }
)
