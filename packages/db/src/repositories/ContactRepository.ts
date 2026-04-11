import { AppSupabaseClient } from '../client.types';

export class ContactRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getSettings() {
    const { data, error } = await this.supabase
      .from('settings')
      .select('email_entreprise')
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  /**
   * Note: contact_messages table is not currently in the schema.
   * This is a placeholder for future logging if needed.
   */
  async logContactMessage(_payload: Record<string, unknown>) {
    // console.log('Contact message received (not logged to DB):', payload);
    return { success: true };
  }
}
