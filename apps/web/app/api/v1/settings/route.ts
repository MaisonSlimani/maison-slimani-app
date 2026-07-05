import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { SettingsRepository } from '@maison/db';

export const dynamic = 'force-dynamic';

/**
 * Returns enterprise settings (e.g. email)
 */
export const GET = createApiHandler(async () => {
  const supabase = await createClient();
  const settingsRepo = new SettingsRepository(supabase);
  
  const data = await settingsRepo.getEnterpriseSettings();

  // Return defaults when no settings row exists yet (first deploy)
  return data ?? {
    companyEmail: '',
    phone: '',
    address: '',
    description: '',
    facebook: '',
    instagram: '',
    metaPixelCode: null,
    gtmHeader: null,
    gtmBody: null,
  };
});
