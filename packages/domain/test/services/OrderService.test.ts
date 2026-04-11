import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderService, IOrderRepository } from '../../src/services/OrderService';
import { Order, DomainResult, OrderPlacementPayload } from '../../src/models';

class MockOrderRepository implements IOrderRepository {
  async placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>> {
    return { 
      success: true, 
      data: { 
        id: 'o_1', 
        ...payload, 
        statut: 'En attente', 
        date_commande: new Date().toISOString(),
        idempotency_key: payload.idempotency_key || null
      } 
    };
  }
}

test('OrderService - placeOrder validates basic fields', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: OrderPlacementPayload = {
    nom_client: 'Test',
    telephone: '06',
    adresse: 'Addr',
    ville: 'Casablanca',
    email: null,
    produits: [{ id: '1', nom: 'P1', prix: 10, quantite: 1, image_url: null, taille: null, couleur: null }],
    total: 10,
    idempotency_key: 'key_1'
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.idempotency_key, 'key_1');
});

test('OrderService - fails on negative total', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: any = {
    nom_client: 'Test',
    adresse: 'Some address',
    produits: [{ id: '1', nom: 'P1', prix: 10, quantite: 1, image_url: null, taille: null, couleur: null }],
    total: -50
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Le montant total est invalide');
});

test('OrderService - handles missing mandatory fields', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: any = {
    nom_client: '', // Empty
    produits: [{ id: '1', nom: 'P1', prix: 10, quantite: 1, image_url: null, taille: null, couleur: null }],
    total: 10
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, false);
});
