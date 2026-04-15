import { Category, CategoryInput, DomainResult } from '../models';

/**
 * Domain contract for Category data access.
 * Strictly typed, no any.
 */
export interface ICategoryRepository {
  /**
   * Retrieves all categories.
   */
  findAll(): Promise<Category[]>;

  /**
   * Retrieves all active/visible categories.
   */
  findAllActive(): Promise<Category[]>;

  /**
   * Retrieves a single category by its SEO slug.
   */
  findBySlug(slug: string): Promise<Category | null>;

  /**
   * Creates a new category.
   */
  create(payload: CategoryInput): Promise<DomainResult<Category>>;

  /**
   * Updates an existing category.
   */
  update(id: string, payload: Partial<CategoryInput>): Promise<DomainResult<Category>>;

  /**
   * Deletes a category.
   */
  delete(id: string): Promise<DomainResult<void>>;
}
