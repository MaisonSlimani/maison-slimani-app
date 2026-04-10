import { SupabaseClient } from '@supabase/supabase-js';
import { Product, DomainResult, ProductVariation } from '@maison/domain';
import { Database, TablesInsert, TablesUpdate } from '../database.types';

export class ProductRepository {
  private supabase: SupabaseClient<Database, any>;
  constructor(supabase: SupabaseClient<Database, any>) {
    this.supabase = supabase;
  }

  private mapProduct(data: Database["public"]["Tables"]["produits"]["Row"]): Product {
    return {
      ...data,
      // Handle the strict typing of JSON fields
      couleurs: (data.couleurs as unknown as ProductVariation[]) || null,
      tailles: (data.tailles as unknown as { nom: string; stock: number }[]) || null,
      images: (data.images as unknown as string[]) || null,
      // Ensure description is a string (DB says string, but handled gracefully)
      description: data.description || '',
      stock: data.stock,
      total_stock: data.total_stock,
    };
  }

  async findAll(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .order('date_ajout', { ascending: false });
      
    if (error) throw error;
    return (data || []).map(p => this.mapProduct(p));
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data ? this.mapProduct(data) : null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('categorie', category)
      .order('date_ajout', { ascending: false });
      
    if (error) throw error;
    return (data || []).map(p => this.mapProduct(p));
  }

  async findFeatured(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('produits')
      .select('*')
      .eq('vedette', true)
      .order('date_ajout', { ascending: false });
      
    if (error) throw error;
    return (data || []).map(p => this.mapProduct(p));
  }

  async create(payload: TablesInsert<'produits'>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .insert(payload)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ? this.mapProduct(data) : undefined };
  }

  async update(id: string, payload: TablesUpdate<'produits'>): Promise<DomainResult<Product>> {
    const { data, error } = await this.supabase
      .from('produits')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
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

  async getSitemapData() {
    // These are typed precisely because the client is typed with Database
    const { data: categories, error: catError } = await this.supabase
      .from('categories')
      .select('nom, slug, date_creation')
      .eq('active', true);
    
    if (catError) throw catError;
    
    const { data: produits, error: prodError } = await this.supabase
      .from('produits')
      .select('id, nom, date_ajout, categorie, slug');
      
    if (prodError) throw prodError;
    
    // Returning raw data for sitemap as it's a specific subset
    return { 
      categories: categories || [], 
      produits: produits || [] 
    };
  }

  async search(params: any): Promise<{ data: Product[]; count: number }> {
    const { data, error } = await this.supabase.rpc('search_products', {
      search_query: params.search || '',
      category_filter: params.categorie || null,
      min_price: params.minPrice || null,
      max_price: params.maxPrice || null,
      in_stock: params.inStock ?? null,
      couleur_filter: Array.isArray(params.couleur) ? params.couleur : params.couleur ? [params.couleur] : null,
      taille_filter: Array.isArray(params.taille) ? params.taille : params.taille ? [params.taille] : null,
      sort_by: params.sort || 'date_ajout_desc',
      limit_count: params.limit || 50,
      offset_count: params.offset || 0
    });

    if (error) throw error;
    const products = (data as any[] || []).map(p => this.mapProduct(p));
    return { data: products, count: products.length };
  }

  async getFilterOptions(categorie?: string): Promise<any> {
    let query = this.supabase.from('produits').select('prix, stock, taille, tailles, couleurs, has_colors, categorie');
    if (categorie) query = query.eq('categorie', categorie);

    const { data: productos, error } = await query;
    if (error) throw error;

    if (!productos || productos.length === 0) {
      return { minPrice: 0, maxPrice: 0, tailles: [], couleurs: [], categories: [] };
    }

    const prices = productos.map(p => p.prix).filter(p => p != null);
    
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      tailles: this.extractUniqueTailles(productos),
      couleurs: this.extractUniqueCouleurs(productos),
      categories: categorie ? [] : Array.from(new Set(productos.map(p => p.categorie).filter(Boolean))).sort()
    };
  }

  private extractUniqueTailles(productos: any[]): string[] {
    const taillesSet = new Set<string>();
    productos.forEach(p => {
      if (p.tailles && Array.isArray(p.tailles)) {
        p.tailles.forEach((t: any) => { if (t.nom && t.stock > 0) taillesSet.add(t.nom); });
      } else if (p.taille) {
        p.taille.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
          if (p.stock > 0) taillesSet.add(t);
        });
      }
      
      if (p.has_colors && p.couleurs) {
        const colors = typeof p.couleurs === 'string' ? JSON.parse(p.couleurs) : p.couleurs;
        if (Array.isArray(colors)) {
          colors.forEach(c => {
            if (c.tailles) c.tailles.forEach((t: any) => { if (t.stock > 0) taillesSet.add(t.nom); });
            else if (c.taille && c.stock > 0) c.taille.split(',').forEach((t: string) => taillesSet.add(t.trim()));
          });
        }
      }
    });
    return Array.from(taillesSet).sort((a, b) => {
      const nA = parseInt(a), nB = parseInt(b);
      return !isNaN(nA) && !isNaN(nB) ? nA - nB : a.localeCompare(b);
    });
  }

  private extractUniqueCouleurs(productos: any[]): { nom: string; code: string }[] {
    const map = new Map<string, { nom: string; code: string }>();
    productos.forEach(p => {
      if (p.has_colors && p.couleurs) {
        const colors = typeof p.couleurs === 'string' ? JSON.parse(p.couleurs) : p.couleurs;
        if (Array.isArray(colors)) {
          colors.forEach(c => {
            if (!c.nom) return;
            const key = c.nom.toLowerCase();
            if (!map.has(key)) map.set(key, { nom: c.nom, code: c.code || '#000000' });
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }

  async getSimilarProducts(id: string, limit: number = 4): Promise<Product[]> {
    const { data, error } = await this.supabase.rpc('get_similar_products', {
      product_id: id,
      limit_count: limit
    });
    if (error) throw error;
    return (data as any[] || []).map(p => this.mapProduct(p));
  }
}
