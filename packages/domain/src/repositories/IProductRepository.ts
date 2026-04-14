import { Product, ProductSearchParams, DomainResult, ProductCardDTO } from '../models';

/**
 * Domain contract for Product data access.
 * Strictly typed, no any.
 */
export interface IProductRepository {
  /**
   * Retrieves all products.
   */
  findAll(): Promise<Product[]>;

  /**
   * Retrieves a single product by its unique ID.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Retrieves a single product by its SEO slug.
   */
  findBySlug(slug: string): Promise<Product | null>;

  /**
   * Retrieves a single product by category and slug.
   */
  findByCategoryAndSlug(categorySlug: string, slug: string): Promise<Product | null>;

  /**
   * Performs advanced product searching and filtering.
   */
  search(params: ProductSearchParams): Promise<{ data: Product[]; count: number }>;

  /**
   * Retrieves featured products (full model).
   */
  findFeatured(limit?: number): Promise<Product[]>;

  /**
   * Retrieves featured products as lightweight DTOs.
   */
  findFeaturedDTO(limit?: number): Promise<ProductCardDTO[]>;

  /**
   * Retrieves products similar to a target product.
   */
  getSimilarProducts(id: string, limit?: number): Promise<Product[]>;

  /**
   * Retrieves upsell/related products for a specific item.
   */
  getUpsellProducts(id: string, limit?: number): Promise<Product[]>;

  /**
   * Creates a new product from a domain model.
   */
  create(payload: Partial<Product>): Promise<DomainResult<Product>>;

  /**
   * Updates an existing product from a domain model.
   */
  update(id: string, payload: Partial<Product>): Promise<DomainResult<Product>>;

  /**
   * Deletes a product.
   */
  delete(id: string): Promise<DomainResult<void>>;
}
