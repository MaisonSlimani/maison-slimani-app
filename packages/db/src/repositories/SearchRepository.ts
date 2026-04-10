import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

export interface TrendingSearch {
  query: string;
  count: number;
}

export interface ProductSuggestion {
  id: string;
  nom: string;
  prix: number;
  image_url: string | null;
}

export interface CategorySuggestion {
  nom: string;
  slug: string;
  count: number;
}

export class SearchRepository {
  private supabase: SupabaseClient<Database, any>;
  constructor(supabase: SupabaseClient<Database, any>) {
    this.supabase = supabase;
  }

  async getTrendingSearches(limit: number = 5): Promise<TrendingSearch[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_trending_searches', {
        limit_count: limit
      });
      if (!error && data) {
        return (data as any[]).map(t => ({
          query: t.query,
          count: Number(t.search_count)
        }));
      }
    } catch (_e) { /* fallback */ }

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
    fallback.forEach((item: any) => {
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
      if (!error && data && data.length > 0) {
        const productIds = (data as any[]).map(p => p.product_id);
        const { data: products } = await this.supabase
          .from('produits')
          .select('id, nom, prix, image_url')
          .in('id', productIds);
        return products || [];
      }
    } catch (_e) { /* fallback */ }

    const { data: fallback } = await this.supabase
      .from('produits')
      .select('id, nom, prix, image_url')
      .or(`nom.ilike.${query}%,nom.ilike.%${query}%`)
      .order('vedette', { ascending: false })
      .limit(limit);
    return fallback || [];
  }

  async getCategorySuggestions(query: string, limit: number = 5): Promise<CategorySuggestion[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_category_suggestions', {
        search_term: query,
        limit_count: limit
      });
      if (!error && data && data.length > 0) {
        return (data as any[]).map(c => ({
          nom: c.category_name,
          slug: c.category_slug,
          count: Number(c.product_count)
        }));
      }
    } catch (_e) { /* fallback */ }

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
      results.push({ nom: cat.nom, slug: cat.slug, count: count || 0 });
    }
    return results;
  }
}
