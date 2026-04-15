import { AppSupabaseClient } from '../client.types';
import { Database } from '../database.types';
import { ProductVariation, IProductFilterRepository, ProductFilterOptions } from '@maison/domain';

type ProductRow = Database["public"]["Tables"]["produits"]["Row"];

export class ProductFilterRepository implements IProductFilterRepository {
  constructor(private supabase: AppSupabaseClient) {}

  async getFilterOptions(category?: string): Promise<ProductFilterOptions> {
    let query = this.supabase.from('produits').select('prix, stock, taille, tailles, couleurs, has_colors, categorie');
    if (category) query = query.eq('categorie', category);

    const { data: productos, error } = await query;
    if (error) throw error;

    if (!productos || productos.length === 0) {
      return { minPrice: 0, maxPrice: 0, sizes: [], colors: [], categories: [] };
    }

    const prices = productos.map(p => p.prix).filter((p): p is number => p != null);
    
    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      sizes: this.extractUniqueSizes(productos),
      colors: this.extractUniqueColors(productos),
      categories: category ? [] : Array.from(new Set(productos.map(p => p.categorie).filter((c): c is string => !!c))).sort()
    };
  }

  private extractUniqueSizes(productos: Partial<ProductRow>[]): string[] {
    const sizesSet = new Set<string>();
    productos.forEach(p => {
      // 1. Check mapped sizes JSON
      if (p.tailles && Array.isArray(p.tailles)) {
        (p.tailles as unknown as { nom: string; stock: number }[]).forEach(t => { 
          if (t.nom && t.stock > 0) sizesSet.add(t.nom); 
        });
      } 
      // 2. Check legacy comma-separated string
      else if (p.taille) {
        p.taille.split(',').map((t: string) => t.trim()).filter(Boolean).forEach((t: string) => {
          if ((p.stock || 0) > 0) sizesSet.add(t);
        });
      }
      
      // 3. Check variation-specific sizes
      if (p.has_colors && p.couleurs) {
        const variations = (p.couleurs as unknown as ProductVariation[]);
        if (Array.isArray(variations)) {
          variations.forEach(v => {
            // Note: v.sizes is using 'nom' internally in our JSON but our Domain model was renamed.
            // In the DB row, the variation JSON properties are still 'nom' and 'tailles'
            const rawVariation = v as unknown as { tailles?: { nom: string; stock: number }[]; stock?: number; taille?: string };
            if (rawVariation.tailles) {
              rawVariation.tailles.forEach(t => { if (t.stock > 0) sizesSet.add(t.nom); });
            } else if (rawVariation.taille && (rawVariation.stock || 0) > 0) {
              rawVariation.taille.split(',').forEach((t: string) => sizesSet.add(t.trim()));
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
      if (p.has_colors && p.couleurs) {
        const variations = (p.couleurs as unknown as Array<{ nom?: string, code?: string }>);
        if (Array.isArray(variations)) {
          variations.forEach(v => {
            if (!v.nom) return;
            const key = v.nom.toLowerCase();
            if (!map.has(key)) {
              map.set(key, { name: v.nom, code: v.code || '#000000' });
            }
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}
