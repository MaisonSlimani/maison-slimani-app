import test from 'node:test';
import assert from 'node:assert';
import { ProductRepository } from '../../src/repositories/ProductRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';
import { Product } from '@maison/domain';
import { TablesInsert } from '../../src/database.types';

test('ProductRepository - Administrative Mutations (Typed)', async (t) => {
  await t.test('create() formats complex nested variations correctly', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new ProductRepository(client);

    const product: Partial<Product> = {
      name: 'Luxury Shoe',
      price: 1500,
      colors: [{
        name: 'Black', code: '#000', stock: 20, sizes: [], images: []
      }]
    };

    builder.setResponse({ id: 'p_1', name: 'Luxury Shoe', price: 1500 });

    await repo.create(product);
    
    const payload = builder.lastPayload as TablesInsert<'produits'>;
    assert.strictEqual(payload.name, 'Luxury Shoe');
    assert.ok(Array.isArray(payload.colors));
    
    // Explicitly define structure for JSONB fields to avoid 'any'
    const colors = payload.colors as Array<{ name: string }>; 
    assert.strictEqual(colors[0].name, 'Black');
  });

  await t.test('update() maintains complex nested structure', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new ProductRepository(client);

    builder.setResponse({ id: 'p_1', price: 1600 });

    await repo.update('p_1', { price: 1600 });
    
    const payload = builder.lastPayload as TablesInsert<'produits'>;
    assert.strictEqual(payload.price, 1600);
    assert.strictEqual(builder.lastFilters.id, 'p_1');
  });
});
