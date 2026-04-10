import { z } from 'zod'
import { commandeProduitSchema } from '@/lib/validations'

export const commandeEmailSchema = z.object({
  id: z.string().uuid(),
  nom_client: z.string(),
  telephone: z.string(),
  adresse: z.string(),
  ville: z.string(),
  produits: z.array(commandeProduitSchema),
  total: z.number().nonnegative(),
  statut: z.string(),
  notification_statut: z.boolean().optional(),
  ancien_statut: z.string().optional(),
  nouveau_statut: z.string().optional(),
  client_email: z.string().email().optional().nullable(),
})

export type CommandeEmailPayload = z.infer<typeof commandeEmailSchema>

