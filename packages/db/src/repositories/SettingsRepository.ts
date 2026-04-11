import { AppSupabaseClient } from '../client.types';

export interface SiteSettings {
  id?: string;
  admin_email?: string | null;
  email_entreprise: string | null;
  telephone: string | null;
  adresse: string | null;
  description: string | null;
  facebook: string | null;
  instagram: string | null;
  meta_pixel_code: string | null;
  google_tag_manager_header: string | null;
  google_tag_manager_body: string | null;
}

/** @deprecated Use SiteSettings */
export type EnterpriseSettings = Pick<SiteSettings, 'email_entreprise'>;

export class SettingsRepository {
  private supabase: AppSupabaseClient;

  constructor(supabase: AppSupabaseClient) {
    this.supabase = supabase;
  }

  async getSettings(): Promise<SiteSettings | null> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('id, email_entreprise, telephone, adresse, description, facebook, instagram, meta_pixel_code, google_tag_manager_header, google_tag_manager_body')
      .limit(1)
      .single();

    if (error) return null;
    return data as SiteSettings;
  }

  async upsertSettings(fields: Partial<Omit<SiteSettings, 'id'>>): Promise<SiteSettings | null> {
    const payload = { ...fields, updated_at: new Date().toISOString() };

    const { data: existing } = await this.supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (existing?.id) {
      const { data, error } = await this.supabase
        .from('settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as SiteSettings;
    }

    const { data, error } = await this.supabase
      .from('settings')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SiteSettings;
  }

  /** @deprecated Use getSettings */
  async getEnterpriseSettings(): Promise<EnterpriseSettings | null> {
    const settings = await this.getSettings();
    if (!settings) return null;
    return { email_entreprise: settings.email_entreprise };
  }
}
