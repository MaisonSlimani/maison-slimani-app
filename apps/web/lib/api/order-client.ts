import { CartItem, OrderPlacementPayload } from '@maison/domain';

/**
 * Data cleaning for cart items to ensure only necessary data is sent to API
 */
export function cleanCartItems(items: CartItem[]) {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url || null,
    size: item.size || null,
    color: item.color || null
  }));
}

/**
 * Sends order to the API with timeout and idempotency handling
 */
export async function sendOrder(data: OrderPlacementPayload): Promise<{ success: boolean; data?: unknown; error?: string; status?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    const response = await fetch('/api/v1/commandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...data, 
        idempotencyKey: crypto.randomUUID() 
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
