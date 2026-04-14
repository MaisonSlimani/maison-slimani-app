import { mapDatabaseError } from '../errors';
import { AppSupabaseClient } from '../client.types';
import { Product, ProductSearchParams, ProductCardDTO } from '@maison/domain';
import { ProductRow, mapProductRow, mapProductCardDTORow } from './product.mappers';

/**
 * Handles all read operations for the produits table.
 */
export class ProductQueryRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async findAll(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .order('date_ajout', { ascending: false });

    if (error) throw mapDatabaseError(error);
    return (data || []).map(mapProductRow);
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw mapDatabaseError(error);
    return data ? mapProductRow(data) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw mapDatabaseError(error);
    return data ? mapProductRow(data) : null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('categorie', category)
      .order('date_ajout', { ascending: false });

    if (error) throw mapDatabaseError(error);
    return (data || []).map(mapProductRow);
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
    return data ? mapProductRow(data) : null;
  }

  async findFeatured(limit?: number): Promise<Product[]> {
    let query = this.supabase
      .from('produits')
      .select('*')
      .eq('vedette', true)
      .order('date_ajout', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw mapDatabaseError(error);
    return (data || []).map(mapProductRow);
  }

  async findFeaturedDTO(limit?: number): Promise<ProductCardDTO[]> {
    let query = this.supabase
      .from('produits')
      .select('id, nom, prix, image_url, slug, categorie')
      .eq('vedette', true)
      .order('date_ajout', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw mapDatabaseError(error);
    return (data as unknown as ProductRow[] || []).map(mapProductCardDTORow);
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
      offset_count: params.offset || 0,
    });

    if (error) throw mapDatabaseError(error);
    const products = (data as unknown as ProductRow[] || []).map(mapProductRow);
    return { data: products, count: products.length };
  }

  async getSimilarProducts(id: string, limit = 4): Promise<Product[]> {
    const { data, error } = await this.supabase.rpc('get_similar_products', {
      product_id: id,
      limit_count: limit,
    });
    if (error) throw mapDatabaseError(error);
    return (data as unknown as ProductRow[] || []).map(mapProductRow);
  }

  async getUpsellProducts(id: string, limit = 4): Promise<Product[]> {
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
    return (data || []).map(mapProductRow);
  }
}
