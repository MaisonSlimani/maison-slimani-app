import test from 'node:test';
import assert from 'node:assert/strict';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { createMockClient } from '../helpers/mockClient';
import { AppSupabaseClient } from '../../src/client.types';

test('ProductRepository - findById returns product when found', async () => {
  const mockClient = createMockClient();
  const repo = new ProductRepository(mockClient as unknown as AppSupabaseClient);
  
  const mockProduct = { id: 'p1', nom: 'Product 1', prix: 100, vedette: true };
  mockClient.setResponse(mockProduct);

  const product = await repo.findById('p1');
  
  assert.strictEqual(product?.id, 'p1');
  assert.strictEqual(product?.nom, 'Product 1');
});

test('ProductRepository - findById returns null when not found', async () => {
  const mockClient = createMockClient();
  const repo = new ProductRepository(mockClient as unknown as AppSupabaseClient);
  
  mockClient.setResponse(null);

  const product = await repo.findById('non_existent');
  assert.strictEqual(product, null);
});

test('ProductRepository - findFeatured uses search_products RPC', async () => {
  const mockClient = createMockClient();
  const repo = new ProductRepository(mockClient as unknown as AppSupabaseClient);
  
  const mockProducts = [
    { id: 'p1', nom: 'Featured 1', vedette: true },
    { id: 'p2', nom: 'Featured 2', vedette: true }
  ];
  mockClient.setResponse(mockProducts);

  const products = await repo.findFeatured(2);
  
  assert.strictEqual(products.length, 2);
  assert.strictEqual(products[0].nom, 'Featured 1');
});

test('ProductRepository - search handles limit and offset correctly', async () => {
  const mockClient = createMockClient();
  const repo = new ProductRepository(mockClient as unknown as AppSupabaseClient);
  
  const mockData = [{ id: 'p1', nom: 'Result' }];
  mockClient.setResponse(mockData, null, 1);

  const { data, count } = await repo.search({ limit: 10, offset: 20 });
  
  assert.strictEqual(data.length, 1);
  assert.strictEqual(count, 1);
});
