import { z } from 'zod'

export const produitQuerySchema = z.object({
  categorie: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),
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
    .enum(['recent', 'prix-asc', 'prix-desc'])
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
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),
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

