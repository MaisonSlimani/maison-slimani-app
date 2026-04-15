import { z } from 'zod';
import { 
  commandeSchema, 
  commentaireSchema, 
  updateCommentaireSchema, 
  adminCommentActionSchema,
  contactSchema,
  searchSuggestionsQuerySchema,
  categoryQuerySchema,
  commandeProduitSchema
} from '../validation/schemas';

export type CommandePayload = z.infer<typeof commandeSchema>;
export type CommandeProduit = z.infer<typeof commandeProduitSchema>;
export type CommentairePayload = z.infer<typeof commentaireSchema>;
export type UpdateCommentairePayload = z.infer<typeof updateCommentaireSchema>;
export type AdminCommentActionPayload = z.infer<typeof adminCommentActionSchema>;
export type ContactPayload = z.infer<typeof contactSchema>;
export type SearchSuggestionsQueryPayload = z.infer<typeof searchSuggestionsQuerySchema>;
export type CategoryQueryPayload = z.infer<typeof categoryQuerySchema>;

/**
 * Single source of truth for a Product variation (color/size combo)
 */
export interface ProductVariation {
  name: string;
  code?: string;
  stock?: number;
  sizes?: { name: string; stock: number }[];
  images?: string[];
}

/**
 * Item in the Shopping Cart
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  image?: string; // Legacy support
  size?: string | null;
  color?: string | null;
  stock?: number | null;
  category?: string | null;
  slug?: string | null;
  categorySlug?: string | null;
}

/**
 * Domain-level Product model
 * Fully decoupled from infrastructure naming.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  totalStock: number | null;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  featured: boolean | null;
  hasColors: boolean | null;
  colors: ProductVariation[] | null;
  sizes: { name: string; stock: number }[] | null;
  size: string | null;
  slug: string | null;
  createdAt: string | null;
}

/**
 * Lightweight DTO for product cards (Home/Gallery)
 */
export type ProductCardDTO = Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'slug' | 'category'>;

/**
 * Filter and pagination parameters for product searches.
 */
export interface ProductSearchParams {
  search?: string;
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  color?: string | string[];
  size?: string | string[];
  sort?: 'prix_asc' | 'prix_desc' | string;
  limit?: number;
  offset?: number;
  useFullText?: boolean;
}

/**
 * Domain-level Order model
 */
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  email: string | null;
  items: CommandeProduit[];
  total: number;
  status: 'En attente' | 'Expédiée' | 'Livrée' | 'Annulée' | string | null;
  orderedAt: string | null;
  idempotencyKey?: string | null;
}

/**
 * Domain-level Category model
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  isActive: boolean | null;
  order: number | null;
  createdAt: string | null;
  color: string | null;
}

/**
 * Site-wide configuration and metadata
 */
export interface SiteSettings {
  id?: string;
  companyEmail: string | null;
  phone: string | null;
  whatsapp?: string | null;
  address: string | null;
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  metaPixelCode?: string | null;
  gtmHeader?: string | null;
  gtmBody?: string | null;
}

export type CategoryInput = Omit<Category, 'id' | 'createdAt'>;

/**
 * Aggregated data needed for the Home page
 */
export interface HomeData {
  categories: Category[];
  featuredProducts: Product[];
  settings: SiteSettings | null;
  whatsappNumber: string | null;
}

/**
 * Aggregated data needed for a Category page
 */
export interface CategoryPageData {
  category: Category;
  products: Product[];
  allCategories: Category[];
}

/**
 * Payload for creating a new order
 */
export interface OrderPlacementPayload {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  email: string | null;
  items: CommandeProduit[];
  total: number;
  idempotencyKey?: string;
}

export interface DomainResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
