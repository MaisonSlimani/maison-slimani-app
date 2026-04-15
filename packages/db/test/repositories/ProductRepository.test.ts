import test from 'node:test';
import assert from 'node:assert';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { createMockSupabaseClient, createFailingSupabaseClient } from '../helpers/mockSupabase';
import { DatabaseConnectionError } from '../../src/errors';

test('ProductRepository', async (t) => {
  await t.test('findAll() returns mapped products', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new ProductRepository(client);

    builder.setResponse([{
      id: '123',
      name: 'Shoe',
      description: 'Nice shoe',
      price: 100,
      stock: 10,
      category: 'sneakers',
      slug: 'shoe',
      created_at: new Date().toISOString(),
      featured: false,
      colors: [],
      sizes: [],
      images: [],
      image_url: 'url',
      total_stock: 10,
      has_colors: false,
      upsell_products: []
    }]);

    const products = await repo.findAll();
    
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].name, 'Shoe');
    assert.strictEqual(products[0].stock, 10);
  });

  await t.test('findAll() throws typed DatabaseConnectionError on fetch failure', async () => {
    const failingClient = createFailingSupabaseClient('ECONNREFUSED', 'fetch error');
    const repo = new ProductRepository(failingClient);

    await assert.rejects(
      async () => await repo.findAll(),
      (err: unknown) => {
        return err instanceof DatabaseConnectionError;
      }
    );
  });
  
  await t.test('search() maps RPC results and returns correct format', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new ProductRepository(client);

    builder.setResponse([{
      id: '456',
      name: 'Search Result',
      description: 'search result desc',
      price: 150,
      stock: 5,
      category: 'sneakers',
      slug: 'search-result',
      created_at: new Date().toISOString(),
      featured: false,
      colors: [],
      sizes: [],
      images: [],
      image_url: 'url2',
      total_stock: 5,
      has_colors: false,
      upsell_products: [],
      total_count: 1
    }]);

    const result = await repo.search({ search: 'Shoe', limit: 12, offset: 0 });
    
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.data[0].name, 'Search Result');
    assert.strictEqual(result.count, 1);
  });
});
