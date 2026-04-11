import { z } from 'zod';
import { 
  commandeSchema, 
  commentaireSchema, 
  updateCommentaireSchema, 
  adminCommentActionSchema,
  commandeProduitSchema
} from '../validation/schemas';

export type CommandePayload = z.infer<typeof commandeSchema>;
export type CommandeProduit = z.infer<typeof commandeProduitSchema>;
export type CommentairePayload = z.infer<typeof commentaireSchema>;
export type UpdateCommentairePayload = z.infer<typeof updateCommentaireSchema>;
export type AdminCommentActionPayload = z.infer<typeof adminCommentActionSchema>;

/**
 * Single source of truth for a Product variation (color/size combo)
 */
export interface ProductVariation {
  nom: string;
  code?: string;
  stock?: number;
  tailles?: { nom: string; stock: number }[];
  images?: string[];
}

/**
 * Item in the Shopping Cart
 */
export interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  image_url: string | null;
  image?: string; // Legacy support
  taille?: string | null;
  couleur?: string | null;
  stock?: number | null;
  categorie?: string | null;
  slug?: string | null;
  categorySlug?: string | null;
}

/**
 * Domain-level Product model
 * Strictly aligned with database schema but with typed JSON fields.
 */
export interface Product {
  id: string;
  nom: string;
  description: string;
  prix: number;
  stock: number | null;
  total_stock: number | null;
  image_url: string | null;
  images: string[] | null;
  categorie: string | null;
  vedette: boolean | null;
  has_colors: boolean | null;
  couleurs: ProductVariation[] | null;
  tailles: { nom: string; stock: number }[] | null;
  taille: string | null;
  slug: string | null;
  average_rating: number | null;
  rating_count: number | null;
  date_ajout: string | null;
}

/**
 * Filter and pagination parameters for product searches.
 */
export interface ProductSearchParams {
  search?: string;
  categorie?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  couleur?: string | string[];
  taille?: string | string[];
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
  nom_client: string;
  telephone: string;
  adresse: string;
  ville: string;
  email: string | null;
  produits: CommandeProduit[];
  total: number;
  statut: 'En attente' | 'Expédiée' | 'Livrée' | 'Annulée' | string | null;
  date_commande: string | null;
  idempotency_key?: string | null;
}

/**
 * Domain-level Category model
 */
export interface Category {
  id: string;
  nom: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean | null;
  ordre: number | null;
  date_creation: string | null;
  couleur: string | null;
}

/**
 * Site-wide configuration and metadata
 */
export interface SiteSettings {
  id?: string;
  email_entreprise: string | null;
  telephone: string | null;
  whatsapp?: string | null;
  adresse: string | null;
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  meta_pixel_code?: string | null;
  google_tag_manager_header?: string | null;
  google_tag_manager_body?: string | null;
}

/**
 * Aggregated data needed for the Home page
 */
export interface HomeData {
  categories: Category[];
  produitsVedette: Product[];
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
  nom_client: string;
  telephone: string;
  adresse: string;
  ville: string;
  email: string | null;
  produits: CommandeProduit[];
  total: number;
  idempotency_key: string;
}

export interface DomainResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
