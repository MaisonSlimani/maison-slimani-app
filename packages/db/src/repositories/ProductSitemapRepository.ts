import { AppSupabaseClient } from '../client.types';

export class ProductSitemapRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getSitemapData() {
    // These are typed precisely because the client is typed with Database
    const { data: categories, error: catError } = await this.supabase
      .from('categories')
      .select('name, slug, created_at')
      .eq('is_active', true);
    
    if (catError) throw catError;
    
    const { data: produits, error: prodError } = await this.supabase
      .from('produits')
      .select('id, name, created_at, category, slug');
      
    if (prodError) throw prodError;
    
    // Returning raw data for sitemap as it's a specific subset
    return { 
      categories: categories || [], 
      produits: produits || [] 
    };
  }
}
