import { CategoryPageData } from '@maison/domain'
import { FilterState } from '@/types'

/**
 * Pure functions for processing category and product data.
 * Extracted from hooks to enable better testing and separation of concerns.
 */

export function resolveInitialCategoryInfo(initialData: CategoryPageData | null | undefined, slug: string) {
  if (initialData?.category) {
    return {
      name: initialData.category.name,
      image: initialData.category.image_url || '/assets/hero-chaussures.jpg',
      description: initialData.category.description || '',
    };
  }
  if (slug === 'tous') {
    return {
      name: 'Tous nos produits',
      image: '/assets/hero-chaussures.jpg',
      description: 'Explorez notre collection complète de chaussures homme haut de gamme.',
    };
  }
  return null;
}

export function buildProductQueryParams(
  categorieSlug: string, 
  categorieNom: string | null, 
  triPrix: string, 
  searchQuery: string, 
  filters: FilterState
): URLSearchParams {
  const qParams = new URLSearchParams();
  if (categorieSlug !== 'tous' && categorieNom) qParams.set('category', categorieNom);
  
  if (triPrix === 'prix-asc') qParams.set('sort', 'price_asc');
  else if (triPrix === 'prix-desc') qParams.set('sort', 'price_desc');
  
  if (searchQuery.trim()) qParams.set('search', searchQuery.trim());
  
  if (filters.minPrice !== undefined) qParams.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) qParams.set('maxPrice', filters.maxPrice.toString());
  
  if (filters.taille?.length) {
    filters.taille.forEach((t: string) => qParams.append('size', t));
  }
  
  if (filters.couleur?.length) {
    filters.couleur.forEach((c: string) => qParams.append('color', c));
  }
  
  if (filters.inStock !== undefined) {
    qParams.set('inStock', filters.inStock.toString());
  }
  
  return qParams;
}
