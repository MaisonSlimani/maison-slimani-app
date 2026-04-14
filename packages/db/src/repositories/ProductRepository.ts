import { mapDatabaseError } from '../errors';
import { AppSupabaseClient } from '../client.types';
import { Product, DomainResult, ProductVariation, ProductSearchParams, IProductRepository } from '@maison/domain';
import { Database, TablesInsert, TablesUpdate } from '../database.types';

type ProductRow = Database["public"]["Tables"]["produits"]["Row"];

export class ProductRepository implements IProductRepository {
  constructor(private supabase: AppSupabaseClient) {}

  /**
   * Maps a raw database row to a clean Domain Product model.
   * Handles property renaming and structural transformation.
   */
  private mapProduct(data: ProductRow): Product {
    return {
      id: data.id,
      name: data.nom,
      description: data.description || '',
      price: data.prix,
      stock: data.stock,
      totalStock: data.total_stock,
      image_url: data.image_url,
      images: (data.images as unknown as string[]) || null,
      category: data.categorie,
      featured: data.vedette,
      hasColors: data.has_colors,
      colors: (data.couleurs as unknown as Array<{ nom: string, code: string, stock: number, tailles?: Array<{ nom: string, stock: number }>, images?: string[] }>)?.map(v => ({
        name: v.nom,
        code: v.code,
        stock: v.stock,
        sizes: v.tailles?.map((t: { nom: string; stock: number }) => ({ name: t.nom, stock: t.stock })),
        images: v.images
      })) as ProductVariation[] || null,
      sizes: (data.tailles as unknown as Array<{ nom: string, stock: number }>)?.map(t => ({
        name: t.nom,
        stock: t.stock
      })) || null,
      size: data.taille,
      slug: data.slug,
      averageRating: data.average_rating,
      ratingCount: data.rating_count,
      createdAt: data.date_ajout,
    };
  }

  async findAll(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .order('date_ajout', { ascending: false });
      
    if (error) throw mapDatabaseError(error);
    return (data || []).map(p => this.mapProduct(p));
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw mapDatabaseError(error);
    return data ? this.mapProduct(data) : null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('categorie', category)
      .order('date_ajout', { ascending: false });
      
    if (error) throw mapDatabaseError(error);
    return (data || []).map(p => this.mapProduct(p));
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    let query = this.supabase
      .from('produits')
      .select('*')
      .eq('vedette', true)
      .order('date_ajout', { ascending: false });
      
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw mapDatabaseError(error);
    return (data || []).map(p => this.mapProduct(p));
  }

  async create(payload: TablesInsert<'produits'>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: mapDatabaseError(error).message };
    return { success: true, data: data ? this.mapProduct(data) : undefined };
  }

  async update(id: string, payload: TablesUpdate<'produits'>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: mapDatabaseError(error).message };
    return { success: true, data: data ? this.mapProduct(data) : undefined };
  }

  async delete(id: string): Promise<DomainResult<void>> {
    const { error } = await this.supabase
      .from('produits')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async search(params: ProductSearchParams): Promise<{ data: Product[]; count: number }> {
    const { data, error } = await this.supabase.rpc('search_products', {
      search_query: params.search || '',
      category_filter: Array.isArray(params.category) ? params.category[0] : (params.category ?? undefined),
      min_price: params.minPrice ?? undefined,
      max_price: params.maxPrice ?? undefined,
      in_stock: params.inStock ?? undefined,
      couleur_filter: Array.isArray(params.color) ? params.color : params.color ? [params.color] : undefined,
      taille_filter: Array.isArray(params.size) ? params.size : params.size ? [params.size] : undefined,
      sort_by: params.sort || 'date_ajout_desc',
      limit_count: params.limit || 50,
      offset_count: params.offset || 0
    });

    if (error) throw mapDatabaseError(error);
    const rawData = (data as unknown as ProductRow[] || []);
    const products = rawData.map(p => this.mapProduct(p));
    return { data: products, count: products.length };
  }

  async getSimilarProducts(id: string, limit: number = 4): Promise<Product[]> {
    const { data, error } = await this.supabase.rpc('get_similar_products', {
      product_id: id,
      limit_count: limit
    });
    if (error) throw mapDatabaseError(error);
    const rawData = (data as unknown as ProductRow[] || []);
    return rawData.map(p => this.mapProduct(p));
  }

  async getUpsellProducts(id: string, limit: number = 4): Promise<Product[]> {
    const { data: product, error: fetchError } = await this.supabase
      .from('produits')
      .select('upsell_products')
      .eq('id', id)
      .single();

    if (fetchError || !product?.upsell_products) return [];

    const upsellIds = Array.isArray(product.upsell_products) ? product.upsell_products : [];
    if (upsellIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .in('id', (upsellIds as string[]).slice(0, limit));

    if (error) throw mapDatabaseError(error);
    return (data || []).map(p => this.mapProduct(p));
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw mapDatabaseError(error);
    return data ? this.mapProduct(data) : null;
  }

  async findByCategoryAndSlug(categorySlug: string, productSlug: string): Promise<Product | null> {
    if (categorySlug === 'tous') {
      return this.findBySlug(productSlug);
    }

    const { data: cat, error: catErr } = await this.supabase
      .from('categories')
      .select('nom')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (catErr || !cat) return null;

    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('categorie', cat.nom)
      .eq('slug', productSlug)
      .maybeSingle();

    if (error) throw mapDatabaseError(error);
    return data ? this.mapProduct(data) : null;
  }
}
