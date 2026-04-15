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

  async findAll(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw mapDatabaseError(error);
    return (data || []).map(mapCategoryRow);
  }

  async findAllActive(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) throw mapDatabaseError(error);
    return (data || []).map(mapCategoryRow);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw mapDatabaseError(error);
    return data ? mapCategoryRow(data) : null;
  }

  async create(payload: CategoryInput): Promise<DomainResult<Category>> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        image_url: payload.image_url,
        is_active: payload.isActive,
        order: payload.order,
        color: payload.color
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? mapCategoryRow(data) : undefined };
  }

  async update(id: string, payload: Partial<CategoryInput>): Promise<DomainResult<Category>> {
    const dbPayload: TablesUpdate<'categories'> = {};
    if (payload.name !== undefined) dbPayload.name = payload.name;
    if (payload.slug !== undefined) dbPayload.slug = payload.slug;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.image_url !== undefined) dbPayload.image_url = payload.image_url;
    if (payload.isActive !== undefined) dbPayload.is_active = payload.isActive;
    if (payload.order !== undefined) dbPayload.order = payload.order;
    if (payload.color !== undefined) dbPayload.color = payload.color;

    const { data, error } = await this.supabase
      .from('categories')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? mapCategoryRow(data) : undefined };
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

function mapCategoryRow(data: CategoryRow): Category {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    image_url: data.image_url || null,
    isActive: data.is_active ?? false,
    order: data.order ?? 0,
    createdAt: data.created_at,
    color: data.color || null,
  };
}
