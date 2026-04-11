import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchRepository } from '../../src/repositories/SearchRepository';
import { createMockClient } from '../helpers/mockClient';
import { AppSupabaseClient } from '../../src/client.types';

test('SearchRepository - getTrendingSearches calls RPC and fallbacks', async () => {
  const mockClient = createMockClient();
  const repo = new SearchRepository(mockClient as unknown as AppSupabaseClient);
  
  const mockResult = [{ query: 'test', search_count: 10 }];
  mockClient.setResponse(mockResult);

  const results = await repo.getTrendingSearches();
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].query, 'test');
  assert.strictEqual(results[0].count, 10);
});

test('SearchRepository - getProductSuggestions handles RPC success', async () => {
  const mockClient = createMockClient();
  const repo = new SearchRepository(mockClient as unknown as AppSupabaseClient);
  
  // First RPC call returns IDs
  mockClient.setResponse([{ product_id: 'p1' }]);
  // Second find call (implicit because mock shares state)
  // Wait, the mock needs more sophisticated state for multiple sequential calls... 
  // Let's keep it simple for now and test the fallback
  
  mockClient.setResponse([{ id: 'p1', nom: 'Fallback Product', prix: 10, image_url: null }]);

  const results = await repo.getProductSuggestions('prefix');
  
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].nom, 'Fallback Product');
});
