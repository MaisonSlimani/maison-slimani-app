import test from 'node:test';
import assert from 'node:assert/strict';
import { CartService } from '../../src/services/CartService';
import { CartItem } from '../../src/models';

test('CartService - addItem adds new item', () => {
  const service = new CartService();
  const items: CartItem[] = [];
  const newItem: CartItem = { id: '1', name: 'P1', price: 10, quantity: 1, stock: 10, image_url: null, size: 'M', color: 'Noir' };

  const result = service.addItem(items, newItem);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.length, 1);
  assert.strictEqual(result.data[0].quantity, 1);
});

test('CartService - addItem updates quantity for existing item (same variant)', () => {
  const service = new CartService();
  const items: CartItem[] = [
    { id: '1', name: 'P1', price: 10, quantity: 1, stock: 10, image_url: null, size: 'M', color: 'Noir' }
  ];
  const newItem: CartItem = { id: '1', name: 'P1', price: 10, quantity: 2, stock: 10, image_url: null, size: 'M', color: 'Noir' };

  const result = service.addItem(items, newItem);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.length, 1);
  assert.strictEqual(result.data[0].quantity, 3);
});

test('CartService - addItem treats different variants as separate items', () => {
  const service = new CartService();
  const items: CartItem[] = [
    { id: '1', name: 'P1', price: 10, quantity: 1, stock: 10, image_url: null, size: 'M', color: 'Noir' }
  ];
  const newItem: CartItem = { id: '1', name: 'P1', price: 10, quantity: 1, stock: 10, image_url: null, size: 'L', color: 'Noir' };

  const result = service.addItem(items, newItem);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.length, 2);
});

test('CartService - addItem fails if stock is insufficient for NEW item', () => {
  const service = new CartService();
  const items: CartItem[] = [];
  const newItem: CartItem = { id: '1', name: 'P1', price: 10, quantity: 5, stock: 3, image_url: null, size: 'M', color: 'Noir' };

  const result = service.addItem(items, newItem);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error?.includes('Stock insuffisant'), true);
});

test('CartService - addItem fails if stock is insufficient for UPDATED item', () => {
  const service = new CartService();
  const items: CartItem[] = [
    { id: '1', name: 'P1', price: 10, quantity: 2, stock: 3, image_url: null, size: 'M', color: 'Noir' }
  ];
  const newItem: CartItem = { id: '1', name: 'P1', price: 10, quantity: 2, stock: 3, image_url: null, size: 'M', color: 'Noir' };

  const result = service.addItem(items, newItem); // Adding 2 to 2 = 4, but stock is 3
  assert.strictEqual(result.success, false);
});

test('CartService - validateCart correctly identifies stock issues', () => {
  const service = new CartService();
  const items: CartItem[] = [
    { id: '1', name: 'Ok', price: 10, quantity: 1, stock: 10, image_url: null, size: 'M', color: 'Noir' },
    { id: '2', name: 'Fail', price: 10, quantity: 5, stock: 3, image_url: null, size: 'M', color: 'Noir' }
  ];

  const result = service.validateCart(items);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error?.includes('Fail'), true);
});

test('CartService - handles null/undefined stock as infinite', () => {
  const service = new CartService();
  const items: CartItem[] = [];
  const newItem: CartItem = { id: '1', name: 'Infinite', price: 10, quantity: 1000, stock: null, image_url: null, size: 'M', color: 'Noir' };

  const result = service.addItem(items, newItem);
  assert.strictEqual(result.success, true);
});
