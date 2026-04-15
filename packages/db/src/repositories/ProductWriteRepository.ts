import { mapDatabaseError } from '../errors';
import { AppSupabaseClient } from '../client.types';
import { Product, DomainResult } from '@maison/domain';
import { mapProductRow, mapProductToRow } from './product.mappers';

/**
 * Handles all write operations for the produits table.
 */
export class ProductWriteRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async create(payload: Partial<Product>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .insert(mapProductToRow(payload))
      .select()
      .single();

    if (error) return { success: false, error: mapDatabaseError(error).message };
    return { success: true, data: data ? mapProductRow(data) : undefined };
  }

  async update(id: string, payload: Partial<Product>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .update(mapProductToRow(payload))
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: mapDatabaseError(error).message };
    return { success: true, data: data ? mapProductRow(data) : undefined };
  }

  async delete(id: string): Promise<DomainResult<void>> {
    const { error } = await this.supabase
      .from('produits')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}
