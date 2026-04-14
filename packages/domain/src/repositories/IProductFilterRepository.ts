/**
 * Specific types for product filtering options.
 * Strictly typed, no any.
 */
export interface ProductFilterOptions {
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: { name: string; code: string }[];
  categories: string[];
}

/**
 * Domain contract for product filtering intelligence.
 */
export interface IProductFilterRepository {
  /**
   * Generates dynamic filter options based on the current product catalog.
   */
  getFilterOptions(categorySlug?: string): Promise<ProductFilterOptions>;
}
