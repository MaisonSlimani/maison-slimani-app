import { NextRequest, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { OrderRepository } from '@maison/db';
import { OrderService, Order, commandeSchema } from '@maison/domain';
import { sendCommandeEmails } from '@/lib/emails/send';
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags';
import { getClientIdentifier } from '@/lib/middleware/rate-limit';
import { CommandeEmailPayload } from '@/lib/emails/types';

/**
 * Handle post-order side effects asynchronously without blocking the request
 */
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
    });
    revalidateTag(PRODUCTS_CACHE_TAG);
  } catch (err: unknown) {
    console.error('[After-Order Error]:', err);
  }
}

export const dynamic = 'force-dynamic';

export const POST = createApiHandler(async (req: Request) => {
  const identifier = getClientIdentifier(req as NextRequest);
  const body = await req.json();

  // 1. Validation
  const validatedData = commandeSchema.parse(body);

  // 2. Security: Recalculate total on server
  const serverTotal = validatedData.produits.reduce(
    (acc, p) => acc + (p.prix * p.quantite), 0
  );

  // 3. Dependency Injection
  const supabase = await createClient();
  const orderRepo = new OrderRepository(supabase);
  const orderService = new OrderService(orderRepo);

  // 4. Atomic Execution
  const result = await orderService.placeOrder({
    nom_client: validatedData.nom_client,
    telephone: validatedData.telephone,
    adresse: validatedData.adresse,
    ville: validatedData.ville,
    email: validatedData.email || null,
    produits: validatedData.produits,
    total: serverTotal,
    idempotency_key: body.idempotency_key || identifier
  });

  if (!result.success || !result.data) {
    const isOutOfStock = result.error?.includes('Stock');
    throw { 
      status: isOutOfStock ? 409 : 400, 
      message: result.error || 'Échec de la transaction' 
    };
  }

  const commande = result.data;

  // 5. Side Effects (Backgrounded)
  after(() => {
    triggerPostOrderActions(commande);
  });

  return commande;
});
