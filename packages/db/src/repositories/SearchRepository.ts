import { AppSupabaseClient } from '../client.types';

export interface TrendingSearch {
  query: string;
  count: number;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

export interface CategorySuggestion {
  name: string;
  slug: string;
  count: number;
}

interface TrendingSearchRpc {
  query: string;
  search_count: number;
}

interface ProductSuggestionRpc {
  product_id: string;
}

interface CategorySuggestionRpc {
  category_name: string;
  category_slug: string;
  product_count: number;
}

export class SearchRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getTrendingSearches(limit: number = 5): Promise<TrendingSearch[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_trending_searches', {
        limit_count: limit
      });
      if (!error && data) {
        return (data as unknown as TrendingSearchRpc[]).map(t => ({
          query: t.query,
          count: Number(t.search_count)
        }));
      }
    } catch { /* fallback */ }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: fallback } = await this.supabase
      .from('search_queries')
      .select('query')
      .gt('results_count', 0)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!fallback) return [];
    const counts: Record<string, number> = {};
    fallback.forEach((item) => {
      const q = item.query?.trim()?.toLowerCase() || '';
      if (q.length >= 4 && /[a-zA-Z0-9]/.test(q)) {
        counts[q] = (counts[q] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .filter(([_, c]) => c >= 3)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }

  async getProductSuggestions(query: string, limit: number = 5): Promise<ProductSuggestion[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_product_suggestions', {
        search_prefix: query,
        limit_count: limit
      });
      if (!error && data && (data as unknown as ProductSuggestionRpc[]).length > 0) {
        const productIds = (data as unknown as ProductSuggestionRpc[]).map(p => p.product_id);
        const { data: products } = await this.supabase
          .from('produits')
          .select('id, nom, prix, image_url')
          .in('id', productIds);
        
        return (products || []).map(p => ({
            id: p.id,
            name: p.nom,
            price: p.prix,
            image_url: p.image_url
        }));
      }
    } catch { /* fallback */ }

    const { data: fallback } = await this.supabase
      .from('produits')
      .select('id, nom, prix, image_url')
      .or(`nom.ilike.${query}%,nom.ilike.%${query}%`)
      .order('vedette', { ascending: false })
      .limit(limit);
      
    return (fallback || []).map(p => ({
        id: p.id,
        name: p.nom,
        price: p.prix,
        image_url: p.image_url
    }));
  }

  async getCategorySuggestions(query: string, limit: number = 5): Promise<CategorySuggestion[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_category_suggestions', {
        search_term: query,
        limit_count: limit
      });
      if (!error && data && (data as unknown as CategorySuggestionRpc[]).length > 0) {
        return (data as unknown as CategorySuggestionRpc[]).map(c => ({
          name: c.category_name,
          slug: c.category_slug,
          count: Number(c.product_count)
        }));
      }
    } catch { /* fallback */ }

    const { data: cats } = await this.supabase
      .from('categories')
      .select('nom, slug')
      .eq('active', true)
      .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
      .order('ordre')
      .limit(limit);

    if (!cats) return [];
    const results = [];
    for (const cat of cats) {
      const { count } = await this.supabase
        .from('produits')
        .select('*', { count: 'exact', head: true })
        .eq('categorie', cat.nom);
      results.push({ name: cat.nom, slug: cat.slug, count: count || 0 });
    }
    return results;
  }
}
