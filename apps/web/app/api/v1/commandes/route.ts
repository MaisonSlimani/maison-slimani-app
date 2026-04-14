import { NextRequest, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createApiHandler } from '@/lib/api/handler';
import { createClient } from '@/lib/supabase/server';
import { OrderRepository } from '@maison/db';
import { OrderService, Order, commandeSchema } from '@maison/domain';
import { sendCommandeEmails } from '@/lib/emails/send';
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags';
import { getClientIdentifier, applyRateLimit } from '@/lib/middleware/rate-limit';
import { createLogger } from '@maison/shared';

const logger = createLogger('commandes.route');

/**
 * Handle post-order side effects asynchronously without blocking the request
 */
async function triggerPostOrderActions(commande: Order) {
  try {
    await sendCommandeEmails({
      id: commande.id,
      clientName: commande.customerName,
      phone: commande.phone,
      address: commande.address,
      city: commande.city,
      products: commande.items,
      total: commande.total,
      status: commande.status || 'En attente',
      clientEmail: commande.email,
    });
    revalidateTag(PRODUCTS_CACHE_TAG);
    } catch (err: unknown) {
    logger.error('After-Order Actions Failed:', err, { 
      orderId: commande.id,
      clientEmail: commande.email 
    });
  }
}

export const dynamic = 'force-dynamic';

export const POST = createApiHandler(async (req: Request) => {
  const identifier = getClientIdentifier(req as NextRequest);
  
  // 1. Rate Limiting
  const rateLimitStatus = await applyRateLimit({
    key: `order_limit_${identifier}`,
    limit: 5,
    windowMs: 60 * 60 * 1000 // 1 hour
  });

  if (!rateLimitStatus.success) {
    throw {
      status: 429,
      message: `Trop de requêtes. Veuillez réessayer dans ${rateLimitStatus.retryAfter} secondes.`,
    };
  }

  const body = await req.json();

  // 2. Validation
  const validatedData = commandeSchema.parse(body);

  // 3. Security: Recalculate total on server
  const serverTotal = validatedData.items.reduce(
    (acc, p) => acc + (p.price * p.quantity), 0
  );

  // 3. Dependency Injection
  const supabase = await createClient();
  const orderRepo = new OrderRepository(supabase);
  const orderService = new OrderService(orderRepo);

  // 4. Atomic Execution
  const result = await orderService.placeOrder({
    customerName: validatedData.customerName,
    phone: validatedData.phone,
    address: validatedData.address,
    city: validatedData.city,
    email: validatedData.email || null,
    items: validatedData.items,
    total: serverTotal,
    idempotencyKey: body.idempotencyKey || identifier
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
