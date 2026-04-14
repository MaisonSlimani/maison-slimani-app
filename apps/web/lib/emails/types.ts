import { z } from 'zod'
import { commandeProduitSchema } from '@maison/domain'

export const commandeEmailSchema = z.object({
  id: z.string().uuid(),
  clientName: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  products: z.array(commandeProduitSchema),
  total: z.number().nonnegative(),
  status: z.string(),
  statusNotification: z.boolean().optional(),
  oldStatus: z.string().optional(),
  newStatus: z.string().optional(),
  clientEmail: z.string().email().optional().nullable(),
})

export type CommandeEmailPayload = z.infer<typeof commandeEmailSchema>
