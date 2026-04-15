import test from 'node:test';
import assert from 'node:assert';
import { OrderRepository } from '../../src/repositories/OrderRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';
import { OrderPlacementPayload } from '@maison/domain';

test('OrderRepository', async (t) => {
  await t.test('placeOrder() handles successful atomic RPC transaction', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new OrderRepository(client);

    const payload: OrderPlacementPayload = {
      customerName: 'John Doe',
      phone: '0600000000',
      address: '123 Fake St',
      city: 'Casablanca',
      email: 'john@example.com',
      items: [{ id: '1', name: 'Shoe', quantity: 1, price: 100 }],
      total: 100,
      idempotencyKey: 'ik_123'
    };

    builder.setResponse({
      success: true,
      data: {
        id: 'order_1',
        customer_name: 'John Doe',
        phone: '0600000000',
        address: '123 Fake St',
        city: 'Casablanca',
        email: 'john@example.com',
        items: [],
        total: 100,
        status: 'en_attente',
        created_at: new Date().toISOString()
      }
    });

    const result = await repo.placeOrder(payload);
    
    // Using Record<string, unknown> to avoid 'any'
    const rpcArgs = builder.lastRpcArgs as Record<string, unknown>;
    assert.ok(builder.lastRpcArgs !== null);
    assert.strictEqual(rpcArgs.p_customer_name, 'John Doe');
    assert.strictEqual(rpcArgs.p_idempotency_key, 'ik_123');

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data?.id, 'order_1');
  });

  await t.test('placeOrder() returns domain error gracefully if RPC explicitly fails (e.g. stock missing)', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new OrderRepository(client);

    const payload: OrderPlacementPayload = {
       customerName: 'John', phone: '00', address: 'addr', city: 'city', email: 'e@mail.com',
       items: [], total: 100, idempotencyKey: 'ik_123'
    };

    builder.setResponse({
      success: false,
      error: 'Stock insuffisant pour: Article A'
    });

    const result = await repo.placeOrder(payload);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Stock insuffisant pour: Article A');
  });
});
