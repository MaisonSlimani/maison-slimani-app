import test from 'node:test';
import assert from 'node:assert';
import { OrderRepository } from '../../src/repositories/OrderRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';
import { TablesUpdate } from '../../src/database.types';

test('Order Lifecycle - Stock State Management (Typed)', async (t) => {
  await t.test('updateStatus() to "annulee" triggers restocking state', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new OrderRepository(client);

    builder.setResponse({ id: 'o1', status: 'annulee' });

    await repo.updateStatus('o1', 'annulee');
    
    const payload = builder.lastPayload as TablesUpdate<'commandes'>;
    assert.strictEqual(payload.status, 'annulee');
    assert.strictEqual(builder.lastFilters.id, 'o1');
  });

  await t.test('placeOrder() payload maps variants correctly', async () => {
     const { client, builder } = createMockSupabaseClient();
     const repo = new OrderRepository(client);

     builder.setResponse({ success: true, data: { id: 'o1' } });

     await repo.placeOrder({
       customerName: 'A', phone: '0', address: 'B', city: 'C', email: 'e@e.com',
       items: [{ id: '1', name: 'S', price: 10, quantity: 1, size: '42', color: 'Black' }],
       total: 10,
       idempotencyKey: 'k'
     });

     const args = builder.lastRpcArgs as Record<string, unknown>;
     const items = args.p_items as Array<{ size: string, color: string }>;
     assert.strictEqual(items[0].size, '42');
     assert.strictEqual(items[0].color, 'Black');
  });
});
