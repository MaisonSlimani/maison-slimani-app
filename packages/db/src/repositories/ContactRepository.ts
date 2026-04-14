import { AppSupabaseClient } from '../client.types';
import { IContactRepository, ContactMessage, DomainResult } from '@maison/domain';

export class ContactRepository implements IContactRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async findAll(): Promise<ContactMessage[]> {
    // Note: contact_messages table is not currently in the schema.
    // Returning empty array for now but with strict typing and clean Domain names.
    return [];
  }

  async create(payload: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<DomainResult<ContactMessage>> {
    // Placeholder implementation for future DB logging
    return { 
      success: true, 
      data: {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        isRead: false
      }
    };
  }

  async markAsRead(id: string): Promise<DomainResult<void>> {
    return { success: true };
  }

  async delete(id: string): Promise<DomainResult<void>> {
    return { success: true };
  }

  /**
   * Retrieves the support email from settings.
   */
  async getSupportEmail(): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('settings')
      .select('email_entreprise')
      .limit(1)
      .single();
    if (error) return null;
    return data.email_entreprise;
  }
}
