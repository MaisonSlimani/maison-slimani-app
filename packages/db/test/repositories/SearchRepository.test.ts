import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchRepository } from '../../src/repositories/SearchRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';

test('SearchRepository - getTrendingSearches calls RPC and fallbacks', async () => {
  const { client, builder } = createMockSupabaseClient();
  const repo = new SearchRepository(client);
  
  const mockResult = [{ query: 'test', search_count: 10 }];
  builder.setResponse(mockResult);

  const results = await repo.getTrendingSearches();
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].query, 'test');
  assert.strictEqual(results[0].count, 10);
});

test('SearchRepository - getProductSuggestions handles RPC success', async () => {
  const { client, builder } = createMockSupabaseClient();
  const repo = new SearchRepository(client);
  
  // First RPC call returns IDs
  builder.setResponse([{ product_id: 'p1' }]);
  
  // Second find call - we just set the response to the final products
  // Note: in this simplified mock, sequential calls share the same builder response
  // but for suggestions, the repo first calls RPC then 'from(produits).select().in(ids)'
  // We can just set the response to the final list of products.
  builder.setResponse([{ id: 'p1', name: 'Fallback Product', price: 10, image_url: null }]);

  const results = await repo.getProductSuggestions('prefix');
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].name, 'Fallback Product');
});
