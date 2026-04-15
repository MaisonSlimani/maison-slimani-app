import { AppSupabaseClient } from '../client.types';
import { SiteSettings } from '@maison/domain';
import { Database, TablesUpdate } from '../database.types';

type SettingsRow = Database["public"]["Tables"]["settings"]["Row"];

export class SettingsRepository {
  constructor(private supabase: AppSupabaseClient) {}

  /**
   * Maps a raw database row to a clean Domain SiteSettings model.
   */
  private mapSettings(data: SettingsRow): SiteSettings {
    return {
      id: data.id,
      companyEmail: data.email_entreprise,
      phone: data.telephone,
      address: data.adresse,
      description: data.description,
      facebook: data.facebook,
      instagram: data.instagram,
      metaPixelCode: data.meta_pixel_code,
      gtmHeader: data.google_tag_manager_header,
      gtmBody: data.google_tag_manager_body,
    };
  }

  async getSettings(): Promise<SiteSettings | null> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error) return null;
    return data ? this.mapSettings(data) : null;
  }

  async upsertSettings(fields: Partial<SiteSettings>): Promise<SiteSettings | null> {
    // Translate domain naming back to DB-naming for the update
    const payload: TablesUpdate<'settings'> = { 
      updated_at: new Date().toISOString() 
    };

    if (fields.companyEmail !== undefined) payload.email_entreprise = fields.companyEmail;
    if (fields.phone !== undefined) payload.telephone = fields.phone;
    if (fields.address !== undefined) payload.adresse = fields.address;
    if (fields.description !== undefined) payload.description = fields.description;
    if (fields.facebook !== undefined) payload.facebook = fields.facebook;
    if (fields.instagram !== undefined) payload.instagram = fields.instagram;
    if (fields.metaPixelCode !== undefined) payload.meta_pixel_code = fields.metaPixelCode;
    if (fields.gtmHeader !== undefined) payload.google_tag_manager_header = fields.gtmHeader;
    if (fields.gtmBody !== undefined) payload.google_tag_manager_body = fields.gtmBody;

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
      return data ? this.mapSettings(data) : null;
    }

    const { data, error } = await this.supabase
      .from('settings')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data ? this.mapSettings(data) : null;
  }

  /**
   * Specifically returns enterprise settings for public use
   */
  async getEnterpriseSettings(): Promise<SiteSettings | null> {
    return this.getSettings();
  }
}
