import test from 'node:test';
import assert from 'node:assert';
import { CategoryRepository } from '../../src/repositories/CategoryRepository';
import { createMockSupabaseClient } from '../helpers/mockSupabase';
import { CategoryInput } from '@maison/domain';
import { TablesInsert, TablesUpdate } from '../../src/database.types';

test('CategoryRepository - Admin Operations (Clean)', async (t) => {
  await t.test('create() maps input correctly and verifies payload', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new CategoryRepository(client);

    const input: CategoryInput = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Desc',
      image_url: 'img.png',
      isActive: true,
      order: 1,
      color: '#000000'
    };

    builder.setResponse({ id: 'cat_1', name: 'Test Category', is_active: true });

    const result = await repo.create(input);
    
    // Assert against the captured payload instead of mocking functions
    const payload = builder.lastPayload as TablesInsert<'categories'>;
    assert.strictEqual(payload.name, 'Test Category');
    assert.strictEqual(payload.is_active, true);
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data?.id, 'cat_1');
  });

  await t.test('update() handles partial updates and verifies filter', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new CategoryRepository(client);

    builder.setResponse({ id: 'cat_1', name: 'Updated Name', is_active: true });

    const result = await repo.update('cat_1', { name: 'Updated Name' });
    
    const payload = builder.lastPayload as TablesUpdate<'categories'>;
    assert.strictEqual(payload.name, 'Updated Name');
    assert.strictEqual(builder.lastFilters.id, 'cat_1');
    
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data?.name, 'Updated Name');
  });

  await t.test('delete() verifies target ID', async () => {
    const { client, builder } = createMockSupabaseClient();
    const repo = new CategoryRepository(client);

    builder.setResponse(null);

    const result = await repo.delete('cat_delete');
    
    assert.strictEqual(builder.lastFilters.id, 'cat_delete');
    assert.strictEqual(result.success, true);
  });
});
