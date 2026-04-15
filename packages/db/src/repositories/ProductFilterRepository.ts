import { AppSupabaseClient } from '../client.types';
import { Database } from '../database.types';
import { ProductVariation, IProductFilterRepository, ProductFilterOptions } from '@maison/domain';

type ProductRow = Database["public"]["Tables"]["produits"]["Row"];

export class ProductFilterRepository implements IProductFilterRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getFilterOptions(category?: string): Promise<ProductFilterOptions> {
    let query = this.supabase.from('produits').select('price, stock, size, sizes, colors, has_colors, category');
    if (category) query = query.eq('category', category);

    const { data: productos, error } = await query;
    if (error) throw error;

    if (!productos || productos.length === 0) {
      return { minPrice: 0, maxPrice: 0, sizes: [], colors: [], categories: [] };
    }

    const prices = productos.map(p => p.price).filter((p): p is number => p != null);
    
    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      sizes: this.extractUniqueSizes(productos),
      colors: this.extractUniqueColors(productos),
      categories: category ? [] : Array.from(new Set(productos.map(p => p.category).filter((c): c is string => !!c))).sort()
    };
  }

  private extractUniqueSizes(productos: Partial<ProductRow>[]): string[] {
    const sizesSet = new Set<string>();
    productos.forEach(p => {
      // 1. Check mapped sizes JSON
      if (p.sizes && Array.isArray(p.sizes)) {
        (p.sizes as unknown as { name: string; stock: number }[]).forEach(t => { 
          if (t.name && t.stock > 0) sizesSet.add(t.name); 
        });
      } 
      // 2. Check legacy comma-separated string
      else if (p.size) {
        p.size.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
          if ((p.stock || 0) > 0) sizesSet.add(t);
        });
      }
      
      // 3. Check variation-specific sizes
      if (p.has_colors && p.colors) {
        const variations = (p.colors as unknown as ProductVariation[]);
        if (Array.isArray(variations)) {
          variations.forEach(v => {
            const rawVariation = v as unknown as { sizes?: { name: string; stock: number }[]; stock?: number; size?: string };
            if (rawVariation.sizes) {
              rawVariation.sizes.forEach(t => { if (t.stock > 0) sizesSet.add(t.name); });
            } else if (rawVariation.size && (rawVariation.stock || 0) > 0) {
              rawVariation.size.split(',').forEach((t: string) => sizesSet.add(t.trim()));
            }
          });
        }
      }
    });

    return Array.from(sizesSet).sort((a, b) => {
      const nA = parseInt(a), nB = parseInt(b);
      return !isNaN(nA) && !isNaN(nB) ? nA - nB : a.localeCompare(b);
    });
  }

  private extractUniqueColors(productos: Partial<ProductRow>[]): { name: string; code: string }[] {
    const map = new Map<string, { name: string; code: string }>();
    productos.forEach(p => {
      if (p.has_colors && p.colors) {
        const variations = (p.colors as unknown as Array<{ name?: string, code?: string }>);
        if (Array.isArray(variations)) {
          variations.forEach(v => {
            if (!v.name) return;
            const key = v.name.toLowerCase();
            if (!map.has(key)) {
              map.set(key, { name: v.name, code: v.code || '#000000' });
            }
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}
