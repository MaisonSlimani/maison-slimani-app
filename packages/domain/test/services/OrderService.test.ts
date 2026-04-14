import test from 'node:test';
import assert from 'node:assert/strict';
import { OrderService } from '../../src/services/OrderService';
import { IOrderRepository } from '../../src/repositories/IOrderRepository';
import { Order, DomainResult, OrderPlacementPayload } from '../../src/models';

class MockOrderRepository implements IOrderRepository {
  async placeOrder(payload: OrderPlacementPayload): Promise<DomainResult<Order>> {
    return { 
      success: true, 
      data: { 
        id: 'o_1', 
        customerName: payload.customerName,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        email: payload.email,
        items: payload.items,
        total: payload.total,
        status: 'En attente', 
        orderedAt: new Date().toISOString(),
        idempotencyKey: payload.idempotencyKey || null
      } 
    };
  }

  async findAll(): Promise<Order[]> { return []; }
  async findById(): Promise<Order | null> { return null; }
  async updateStatus(): Promise<DomainResult<Order>> { return { success: true }; }
  async delete(): Promise<DomainResult<void>> { return { success: true }; }
}

test('OrderService - placeOrder validates basic fields', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: OrderPlacementPayload = {
    customerName: 'Test',
    phone: '06',
    address: 'Addr',
    city: 'Casablanca',
    email: null,
    items: [{ id: '1', name: 'P1', price: 10, quantity: 1, image_url: null, size: null, color: null }],
    total: 10,
    idempotencyKey: 'key_1'
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.idempotencyKey, 'key_1');
});

test('OrderService - fails on negative total', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: OrderPlacementPayload = {
    customerName: 'Test',
    phone: '06',
    address: 'Some address',
    city: 'Casablanca',
    email: null,
    items: [{ id: '1', name: 'P1', price: 10, quantity: 1, image_url: null, size: null, color: null }],
    total: -50,
    idempotencyKey: 'key_2'
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Le montant total est invalide');
});

test('OrderService - handles missing mandatory fields', async () => {
  const repo = new MockOrderRepository();
  const service = new OrderService(repo);
  
  const payload: OrderPlacementPayload = {
    customerName: '', // Empty - should trigger validation failure
    phone: '06',
    address: 'Addr',
    city: 'Casablanca',
    email: null,
    items: [{ id: '1', name: 'P1', price: 10, quantity: 1, image_url: null, size: null, color: null }],
    total: 10,
    idempotencyKey: 'key_3'
  };

  const result = await service.placeOrder(payload);
  assert.strictEqual(result.success, false);
});
