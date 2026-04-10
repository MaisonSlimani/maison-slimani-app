import test from 'node:test'
import assert from 'node:assert/strict'
import { OrderService, IOrderRepository } from '../../src/services/OrderService'
import { Order, DomainResult } from '../../src/models'

// Mock Repository
class MockOrderRepository implements IOrderRepository {
  async placeOrder(payload: any): Promise<DomainResult<Order>> {
    if (payload.total <= 0) {
      return { success: false, error: 'Total invalid' }
    }
    return { 
      success: true, 
      data: { 
        id: 'order_123', 
        nom_client: payload.nom_client,
        telephone: payload.telephone,
        adresse: payload.adresse,
        ville: payload.ville,
        email: payload.email,
        produits: payload.produits,
        total: payload.total, 
        statut: 'En attente', 
        date_commande: new Date().toISOString(),
        idempotency_key: payload.idempotency_key || null
      } 
    }
  }
}

test('OrderService - placeOrder succeeds with valid payload', async () => {
  const repo = new MockOrderRepository()
  const service = new OrderService(repo)
  
  const payload = {
    nom_client: 'John Doe',
    telephone: '123456789',
    adresse: 'Main St',
    ville: 'Casablanca',
    email: 'john@example.com',
    produits: [{ id: '1', nom: 'P1', prix: 10, quantite: 1 }],
    total: 100,
    idempotency_key: 'key_1'
  }

  const result = await service.placeOrder(payload)
  
  assert.strictEqual(result.success, true)
  assert.strictEqual(result.data?.id, 'order_123')
})

test('OrderService - placeOrder fails if cart is empty', async () => {
  const repo = new MockOrderRepository()
  const service = new OrderService(repo)
  
  const payload = {
    nom_client: 'John',
    telephone: '123',
    adresse: 'Addr',
    ville: 'City',
    email: null,
    produits: [],
    total: 0,
    idempotency_key: 'key_2'
  }

  const result = await service.placeOrder(payload)
  
  assert.strictEqual(result.success, false)
  assert.strictEqual(result.error, 'Le panier est vide')
})
