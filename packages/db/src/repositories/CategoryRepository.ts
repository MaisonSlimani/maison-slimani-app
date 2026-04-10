import { SupabaseClient } from '@supabase/supabase-js';
import { Category, DomainResult } from '@maison/domain';
import { Database, TablesInsert, TablesUpdate } from '../database.types';

export class CategoryRepository {
  private supabase: SupabaseClient<Database, any>;
  constructor(supabase: SupabaseClient<Database, any>) {
    this.supabase = supabase;
  }

  private mapCategory(data: Database["public"]["Tables"]["categories"]["Row"]): Category {
    return {
      ...data,
      description: data.description || null,
      image_url: data.image_url || null,
      active: data.active || false,
      ordre: data.ordre || 0,
      date_creation: data.date_creation || null,
      couleur: data.couleur || null,
    };
  }

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('ordre', { ascending: true });

    if (error) throw error;
    return (data || []).map(d => this.mapCategory(d));
  }

  async findAllActive(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('ordre', { ascending: true });

    if (error) throw error;
    return (data || []).map(d => this.mapCategory(d));
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data ? this.mapCategory(data) : null;
  }

  async create(payload: TablesInsert<'categories'>): Promise<DomainResult<Category>> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? this.mapCategory(data) : undefined };
  }

  async update(id: string, payload: TablesUpdate<'categories'>): Promise<DomainResult<Category>> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? this.mapCategory(data) : undefined };
  }

  async delete(id: string): Promise<DomainResult<void>> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }
}
