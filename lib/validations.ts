import { z } from 'zod'

export const produitQuerySchema = z.object({
  categorie: z
    .union([
      z.string().trim().min(1).max(100),
      z.array(z.string().trim().min(1).max(100))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (Array.isArray(val)) return val
      return [val]
    }),
  vedette: z
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
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  offset: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().nonnegative())
    .optional(),
  sort: z
    .enum(['prix_asc', 'prix_desc', 'prix-asc', 'prix-desc'])
    .optional(),
  useFullText: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  // Filter parameters
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
  taille: z
    .union([
      z.string().trim().min(1).max(50),
      z.array(z.string().trim().min(1).max(50))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (Array.isArray(val)) return val
      // Handle comma-separated string or single value
      if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map(t => t.trim()).filter(t => t.length > 0)
      }
      return [val]
    }),
  inStock: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  couleur: z
    .union([
      z.string().trim().min(1).max(100),
      z.array(z.string().trim().min(1).max(100))
    ])
    .optional()
    .transform((val) => {
      if (!val) return undefined
      if (Array.isArray(val)) return val
      return [val]
    }),
})

export const commandeProduitSchema = z.object({
  id: z.string().uuid(),
  nom: z.string(),
  prix: z.number().positive(),
  quantite: z.number().int().positive(),
  image_url: z.string().optional().nullable(),
  taille: z.string().optional().nullable(),
  couleur: z.string().optional().nullable(),
})

export const commandeSchema = z.object({
  nom_client: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().min(1, "L'adresse est requise"),
  ville: z.string().min(1, 'La ville est requise'),
  produits: z.array(commandeProduitSchema).min(1, 'Au moins un produit est requis'),
})

export const statutCommandeSchema = z.object({
  nouveau_statut: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']),
})

export type CommandePayload = z.infer<typeof commandeSchema>

// Comment schemas
export const commentaireSchema = z.object({
  produit_id: z.string().uuid('ID produit invalide'),
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
  commentaire: z.string().min(1, 'Le commentaire est requis').max(2000, 'Le commentaire est trop long'),
  images: z.array(z.string().url('URL d\'image invalide')).max(6, 'Maximum 6 images autorisées').optional(),
})

export const updateCommentaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long').optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5').optional(),
  commentaire: z.string().min(1, 'Le commentaire est requis').max(2000, 'Le commentaire est trop long').optional(),
  images: z.array(z.string().url('URL d\'image invalide')).max(6, 'Maximum 6 images autorisées').optional(),
})

export const adminCommentActionSchema = z.object({
  approved: z.boolean().optional(),
  flagged: z.boolean().optional(),
})

export type CommentairePayload = z.infer<typeof commentaireSchema>
export type UpdateCommentairePayload = z.infer<typeof updateCommentaireSchema>
export type AdminCommentActionPayload = z.infer<typeof adminCommentActionSchema>

