import test from 'node:test';
import assert from 'node:assert';
import { OrderRepository } from '../../src/repositories/OrderRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';
import { OrderPlacementPayload } from '@maison/domain';

test('OrderRepository', async (t) => {
  await t.test('placeOrder() handles successful atomic RPC transaction', async () => {
    const mockClient = createMockSupabaseClient();
    const repo = new OrderRepository(mockClient);

    const payload: OrderPlacementPayload = {
      nom_client: 'John Doe',
      telephone: '0600000000',
      adresse: '123 Fake St',
      ville: 'Casablanca',
      email: 'john@example.com',
      produits: [{ id: '1', nom: 'Shoe', quantite: 1, prix: 100 }],
      total: 100,
      idempotency_key: 'ik_123'
    };

    mockClient.rpc = ((funcName: string, args: unknown) => {
      const rpcArgs = args as Record<string, unknown>;
      assert.strictEqual(funcName, 'create_order_v2_atomic');
      assert.strictEqual(rpcArgs.p_nom_client, 'John Doe');
      assert.strictEqual(rpcArgs.p_idempotency_key, 'ik_123');

      return {
         then: (resolve: (value: unknown) => void) => {
          resolve({
            data: {
              success: true,
              data: {
                id: 'order_1',
                nom_client: 'John Doe',
                telephone: '0600000000',
                adresse: '123 Fake St',
                ville: 'Casablanca',
                email: 'john@example.com',
                produits: [],
                total: 100,
                statut: 'en_attente',
                date_commande: new Date().toISOString()
              }
            },
            error: null
          });
        }
      };
    }) as unknown as typeof mockClient.rpc;

    const result = await repo.placeOrder(payload);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data?.id, 'order_1');
  });

  await t.test('placeOrder() returns domain error gracefully if RPC explicitly fails (e.g. stock missing)', async () => {
    const mockClient = createMockSupabaseClient();
    const repo = new OrderRepository(mockClient);

    const payload: OrderPlacementPayload = {
       nom_client: 'John', telephone: '00', adresse: 'addr', ville: 'city', email: 'e@mail.com',
       produits: [], total: 100, idempotency_key: 'ik_123'
    };

    // Mock RPC returning an application error (data.success = false)
    mockClient.rpc = ((funcName: string, args: unknown) => {
      return {
         then: (resolve: (value: unknown) => void) => {
          resolve({
            data: {
              success: false,
              error: 'Stock insuffisant pour: Article A'
            },
            error: null
          });
        }
      };
    }) as unknown as typeof mockClient.rpc;

    const result = await repo.placeOrder(payload);
    
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Stock insuffisant pour: Article A');
  });
});
