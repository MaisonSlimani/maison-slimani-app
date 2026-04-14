import { z } from 'zod';
import { htmlSanitizedString } from './sanitization';

/**
 * Filter and pagination parameters for product searches.
 * Clean domain names (CamelCase).
 */
export const produitQuerySchema = z.object({
  category: z
    .union([
      z.string().trim().min(1).max(100),
      z.array(z.string().trim().min(1).max(100))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return [val];
    }),
  featured: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  search: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional(),
  limit: z
    .string()
    .default('12')
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(100)),
  offset: z
    .string()
    .default('0')
    .transform((value) => Number(value))
    .pipe(z.number().int().nonnegative()),
  sort: z
    .enum(['prix_asc', 'prix_desc', 'prix-asc', 'prix-desc'])
    .optional(),
  useFullText: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  minPrice: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().nonnegative())
    .optional(),
  maxPrice: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().positive())
    .optional(),
  size: z
    .union([
      z.string().trim().min(1).max(50),
      z.array(z.string().trim().min(1).max(50))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
      return [val];
    }),
  inStock: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  color: z
    .union([
      z.string().trim().min(1).max(100),
      z.array(z.string().trim().min(1).max(100))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return [val];
    }),
});

/**
 * Item in an order
 */
export const commandeProduitSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image_url: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

/**
 * Item in the Shopping Cart
 */
export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image_url: z.string().optional().nullable(),
  image: z.string().optional(), // Legacy support
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  stock: z.number().optional().nullable(),
  category: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
});

/**
 * Item in the Wishlist
 */
export const wishlistItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  image: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  categorySlug: z.string().optional().nullable(),
});

/**
 * Order Validation Schema
 */
export const commandeSchema = z.object({
  customerName: z.string().min(1, 'Le nom est requis'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')).or(z.null()),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, 'La ville est requise'),
  items: z.array(commandeProduitSchema).min(1, 'Au moins un produit est requis'),
  total: z.number().nonnegative('Le total est invalide'),
});

/**
 * Order Status update
 */
export const statutCommandeSchema = z.object({
  newStatus: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']),
});

/**
 * Public comment schema
 */
export const commentaireSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
  content: htmlSanitizedString.pipe(z.string().min(1, 'Le commentaire est requis').max(2000, 'Le commentaire est trop long')),
  images: z.array(z.string().url('URL d\'image invalide')).max(6, 'Maximum 6 images autorisées').optional(),
});

/**
 * Admin comment update
 */
export const updateCommentaireSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long').optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5').optional(),
  content: htmlSanitizedString.pipe(z.string().min(1, 'Le commentaire est requis').max(2000, 'Le commentaire est trop long')).optional(),
  images: z.array(z.string().url('URL d\'image invalide')).max(6, 'Maximum 6 images autorisées').optional(),
});

export const adminCommentActionSchema = z.object({
  approved: z.boolean().optional(),
  flagged: z.boolean().optional(),
});

/**
 * Contact form schema
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Le message est requis'),
});

export const searchSuggestionsQuerySchema = z.object({
  q: z.string().trim().min(0).max(100).optional().default(''),
  type: z.enum(['all', 'products', 'categories', 'trending']).optional().default('all'),
  limit: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(20))
    .optional()
    .default('5'),
});

export const categoryQuerySchema = z.object({
  slug: z.string().min(1).optional(),
  isActive: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
});
