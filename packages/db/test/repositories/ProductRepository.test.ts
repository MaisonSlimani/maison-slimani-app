import test from 'node:test';
import assert from 'node:assert';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { createMockSupabaseClient, createFailingSupabaseClient } from '../helpers/mockSupabase';
import { DatabaseConnectionError } from '../../src/errors';

test('ProductRepository', async (t) => {
  await t.test('findAll() returns mapped products', async () => {
    const mockClient = createMockSupabaseClient();
    const repo = new ProductRepository(mockClient);

    const mockFrom = mockClient.from;
    type MockFrom = typeof mockFrom;
    mockClient.from = ((table: string) => {
      const builders = mockFrom(table as never);
      return {
        ...builders,
        then: (resolve: (value: unknown) => void) => {
          resolve({
            data: [{
              id: '123',
              nom: 'Shoe',
              description: 'Nice shoe',
              prix: 100,
              stock: 10,
              categorie: 'sneakers',
              slug: 'shoe',
              date_ajout: new Date().toISOString(),
              vedette: false,
              couleurs: [],
              tailles: [],
              images: [],
              image_url: 'url',
              total_stock: 10,
              has_colors: false,
              upsell_products: []
            }],
            error: null
          });
        }
      };
    }) as unknown as MockFrom;

    const products = await repo.findAll();
    
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].nom, 'Shoe');
    assert.strictEqual(products[0].stock, 10);
    assert.deepStrictEqual(products[0].couleurs, []);
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
    const mockClient = createMockSupabaseClient();
    const repo = new ProductRepository(mockClient);

    mockClient.rpc = ((funcName: string, args: unknown) => {
      return {
         then: (resolve: (value: unknown) => void) => {
          resolve({
            data: [{
              id: '456',
              nom: 'Search Result',
              description: 'search result desc',
              prix: 150,
              stock: 5,
              categorie: 'sneakers',
              slug: 'search-result',
              date_ajout: new Date().toISOString(),
              vedette: false,
              couleurs: [],
              tailles: [],
              images: [],
              image_url: 'url2',
              total_stock: 5,
              has_colors: false,
              upsell_products: []
            }],
            error: null
          });
        }
      };
    }) as unknown as typeof mockClient.rpc;

    const result = await repo.search({ search: 'Shoe', limit: 12, offset: 0 });
    
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.data[0].nom, 'Search Result');
    assert.strictEqual(result.count, 1);
  });
});
