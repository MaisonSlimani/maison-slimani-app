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
  
  if (!data) {
    throw { status: 404, message: 'Paramètres introuvables' };
  }

  // Returning directly as createApiHandler handles the envelope
  return data;
});
