import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

export class ContactRepository {
  private supabase: SupabaseClient<Database>;
  constructor(supabase: any) {
    this.supabase = supabase;
  }

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
  async logContactMessage(payload: any) {
    console.log('Contact message received (not logged to DB):', payload);
    return { success: true };
  }
}
