import { NextRequest, NextResponse, after } from 'next/server'
import { revalidateTag } from 'next/cache'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { sendCommandeEmails } from '@/lib/emails/send'
import { getClientIdentifier } from '@/lib/middleware/rate-limit'
import { errorResponse } from '@/lib/api/response'
import { CommandeEmailPayload } from '@/lib/emails/types'
import { OrderService, Order } from '@maison/domain'
import { OrderRepository, createClient } from '@maison/db'

export const dynamic = 'force-dynamic'

async function triggerPostOrderActions(commande: Order) {
  try {
    await sendCommandeEmails({
      id: commande.id,
      nom_client: commande.nom_client,
      telephone: commande.telephone,
      adresse: commande.adresse,
      ville: commande.ville,
      produits: commande.produits as CommandeEmailPayload['produits'],
      total: commande.total,
      statut: commande.statut || 'En attente',
      client_email: commande.email,
    })
    revalidateTag(PRODUCTS_CACHE_TAG)
  } catch (err: unknown) {
    console.error('Post-order error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request)
    const body = await request.json()
    
    // 1. Server-side Validation
    const { commandeSchema } = await import('@maison/domain')
    const validation = commandeSchema.safeParse(body)
    
    if (!validation.success) {
      const error = validation.error.errors[0]
      const message = `${error.path.join('.')}: ${error.message}`
      console.warn('Order Validation Failed:', message, body)
      return errorResponse(message, 400)
    }

    // 2. Security: Recalculate total on server (Industry Standard)
    const serverTotal = validation.data.produits.reduce(
      (acc, p) => acc + (p.prix * p.quantite), 0
    )

    const supabase = await createClient()
    const orderRepo = new OrderRepository(supabase)
    const orderService = new OrderService(orderRepo)

    // 3. Atomic Order Placement
    const result = await orderService.placeOrder({
      nom_client: validation.data.nom_client,
      telephone: validation.data.telephone,
      adresse: validation.data.adresse,
      ville: validation.data.ville,
      email: validation.data.email || null,
      produits: validation.data.produits,
      total: serverTotal, // Use recalculated total
      idempotency_key: body.idempotency_key || identifier
    })

    if (!result.success || !result.data) {
      console.error('Order Placement Failed:', result.error)
      const status = result.error?.includes('Stock') ? 409 : 400
      return errorResponse(result.error || 'Échec de la transaction', status)
    }

    const commande = result.data
    // Use Next.js 15 after() to handle side effects without blocking or losing execution in Serverless
    after(() => {
      triggerPostOrderActions(commande)
    })

    return NextResponse.json({ success: true, data: commande })
  } catch (err: unknown) {
    console.error('Checkout API Critical Error:', err)
    const message = err instanceof Error ? err.message : 'Une erreur interne est survenue'
    return NextResponse.json(
      { success: false, error: message }, 
      { status: 500 }
    )
  }
}
