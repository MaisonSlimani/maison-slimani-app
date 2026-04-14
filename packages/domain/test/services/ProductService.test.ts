import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSelectedStock, validateProductSelections } from '../../src/services/ProductService';
import { Product } from '../../src/models';

test('Product Functions - getSelectedStock', async (t) => {
  const product: Product = {
    id: 'p1',
    name: 'Produit Test',
    price: 100,
    stock: 10,
    totalStock: 30,
    hasColors: true,
    category: 'test',
    image_url: 'img1',
    colors: [
      {
        name: 'Rouge',
        code: '#ff0000',
        stock: 5,
        sizes: [
          { name: 'S', stock: 2 },
          { name: 'M', stock: 3 }
        ]
      },
      {
        name: 'Bleu',
        code: '#0000ff',
        stock: 15,
        sizes: [
          { name: 'L', stock: 15 }
        ]
      }
    ],
    sizes: null,
    images: null,
    description: '',
    createdAt: new Date().toISOString(),
    featured: false,
    size: null,
    slug: 'produit-test',
  };

  await t.test('returns base stock when no colors/sizes selected', () => {
    assert.strictEqual(getSelectedStock(product), 10);
  });

  await t.test('returns color stock when only color selected', () => {
    assert.strictEqual(getSelectedStock(product, 'Bleu'), 15);
  });

  await t.test('returns size stock when both color and size selected', () => {
    assert.strictEqual(getSelectedStock(product, 'Rouge', 'S'), 2);
    assert.strictEqual(getSelectedStock(product, 'Rouge', 'M'), 3);
  });

  await t.test('returns 0 for non-existent size in color', () => {
    assert.strictEqual(getSelectedStock(product, 'Rouge', 'L'), 0);
  });
});

test('Product Functions - validateProductSelections', async (t) => {
  const product: Product = {
    id: 'p1',
    name: 'Produit Test',
    price: 100,
    stock: 10,
    totalStock: 10,
    hasColors: true,
    category: 'test',
    image_url: 'img1',
    colors: [{ name: 'Rouge', code: '#ff0000', stock: 5, sizes: [{ name: 'S', stock: 5 }] }],
    sizes: null,
    images: null,
    description: '',
    createdAt: new Date().toISOString(),
    featured: false,
    size: null,
    slug: 'produit-test',
  };

  await t.test('fails if color missing when required', () => {
    const res = validateProductSelections(product);
    assert.strictEqual(res, 'Veuillez sélectionner une couleur');
  });

  await t.test('fails if size missing when required', () => {
    const res = validateProductSelections(product, 'Rouge');
    assert.strictEqual(res, 'Veuillez sélectionner une taille');
  });

  await t.test('passes when all selections made', () => {
    const res = validateProductSelections(product, 'Rouge', 'S');
    assert.strictEqual(res, null);
  });
});
