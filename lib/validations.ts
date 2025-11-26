import { z } from 'zod'
import { villesMaroc } from '@/lib/constants/villes'

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

export const villeSchema = z.enum(villesMaroc)

export const commandeSchema = z.object({
  nom_client: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().min(1, 'Le téléphone est requis'),
  adresse: z.string().min(1, "L'adresse est requise"),
  ville: villeSchema,
  produits: z.array(commandeProduitSchema).min(1, 'Au moins un produit est requis'),
})

export const statutCommandeSchema = z.object({
  nouveau_statut: z.enum(['En attente', 'Expédiée', 'Livrée', 'Annulée']),
})

export type VilleMaroc = (typeof villesMaroc)[number]
export type CommandePayload = z.infer<typeof commandeSchema>

export { villesMaroc }

