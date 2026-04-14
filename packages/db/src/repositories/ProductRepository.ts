import { AppSupabaseClient } from '../client.types';
import { Product, DomainResult, ProductSearchParams, IProductRepository, ProductCardDTO } from '@maison/domain';
import { ProductQueryRepository } from './ProductQueryRepository';
import { ProductWriteRepository } from './ProductWriteRepository';

/**
 * Facade that composes ProductQueryRepository and ProductWriteRepository
 * to satisfy the IProductRepository contract.
 *
 * Keep this file thin — all logic lives in the composed repositories.
 */
export class ProductRepository implements IProductRepository {
  private readonly query: ProductQueryRepository;
  private readonly write: ProductWriteRepository;

  constructor(supabase: AppSupabaseClient) {
    this.query = new ProductQueryRepository(supabase);
    this.write = new ProductWriteRepository(supabase);
  }

  findAll(): Promise<Product[]> { return this.query.findAll(); }
  findById(id: string): Promise<Product | null> { return this.query.findById(id); }
  findBySlug(slug: string): Promise<Product | null> { return this.query.findBySlug(slug); }
  findByCategory(category: string): Promise<Product[]> { return this.query.findByCategory(category); }
  findByCategoryAndSlug(categorySlug: string, slug: string): Promise<Product | null> { return this.query.findByCategoryAndSlug(categorySlug, slug); }
  findFeatured(limit?: number): Promise<Product[]> { return this.query.findFeatured(limit); }
  findFeaturedDTO(limit?: number): Promise<ProductCardDTO[]> { return this.query.findFeaturedDTO(limit); }
  search(params: ProductSearchParams): Promise<{ data: Product[]; count: number }> { return this.query.search(params); }
  getSimilarProducts(id: string, limit?: number): Promise<Product[]> { return this.query.getSimilarProducts(id, limit); }
  getUpsellProducts(id: string, limit?: number): Promise<Product[]> { return this.query.getUpsellProducts(id, limit); }
  create(payload: Partial<Product>): Promise<DomainResult<Product>> { return this.write.create(payload); }
  update(id: string, payload: Partial<Product>): Promise<DomainResult<Product>> { return this.write.update(id, payload); }
  delete(id: string): Promise<DomainResult<void>> { return this.write.delete(id); }
}
