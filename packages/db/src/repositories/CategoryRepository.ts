import { AppSupabaseClient } from '../client.types';
import { Category, CategoryInput, DomainResult, ICategoryRepository } from '@maison/domain';
import { Database, TablesUpdate } from '../database.types';
import { mapDatabaseError } from '../errors';

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export class CategoryRepository implements ICategoryRepository {
  private supabase: AppSupabaseClient;
  constructor(supabase: AppSupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Maps a raw database row to a clean Domain Category model.
   */
  private mapCategory(data: CategoryRow): Category {
    return {
      id: data.id,
      name: data.nom,
      slug: data.slug,
      description: data.description || null,
      image_url: data.image_url || null,
      isActive: data.active ?? false,
      order: data.ordre ?? 0,
      createdAt: data.date_creation,
      color: data.couleur || null,
    };
  }

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('ordre', { ascending: true });

    if (error) throw mapDatabaseError(error);
    return (data || []).map(d => this.mapCategory(d));
  }

  async findAllActive(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('ordre', { ascending: true });

    if (error) throw mapDatabaseError(error);
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

  async create(payload: CategoryInput): Promise<DomainResult<Category>> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        nom: payload.name,
        slug: payload.slug,
        description: payload.description,
        image_url: payload.image_url,
        active: payload.isActive,
        ordre: payload.order,
        couleur: payload.color
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? this.mapCategory(data) : undefined };
  }

  async update(id: string, payload: Partial<CategoryInput>): Promise<DomainResult<Category>> {
    const dbPayload: TablesUpdate<'categories'> = {};
    if (payload.name !== undefined) dbPayload.nom = payload.name;
    if (payload.slug !== undefined) dbPayload.slug = payload.slug;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.image_url !== undefined) dbPayload.image_url = payload.image_url;
    if (payload.isActive !== undefined) dbPayload.active = payload.isActive;
    if (payload.order !== undefined) dbPayload.ordre = payload.order;
    if (payload.color !== undefined) dbPayload.couleur = payload.color;

    const { data, error } = await this.supabase
      .from('categories')
      .update(dbPayload)
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
