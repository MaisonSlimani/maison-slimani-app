import test from 'node:test'
import assert from 'node:assert/strict'
import { 
  produitQuerySchema, 
  commandeSchema, 
  commentaireSchema,
  contactSchema,
  searchSuggestionsQuerySchema,
  categoryQuerySchema
} from '../../src/validation/schemas'

test('produitQuerySchema - transforms string limit to number', () => {
  const result = produitQuerySchema.parse({ limit: '10' })
  assert.strictEqual(result.limit, 10)
})

test('produitQuerySchema - handles comma-separated sizes', () => {
  const result = produitQuerySchema.parse({ size: '40, 41,42' })
  assert.deepStrictEqual(result.size, ['40', '41', '42'])
})

test('produitQuerySchema - handles single category as array', () => {
  const result = produitQuerySchema.parse({ category: 'sneakers' })
  assert.deepStrictEqual(result.category, ['sneakers'])
})

test('commandeSchema - validates valid order', () => {
  const validOrder = {
    customerName: 'Maison Test',
    phone: '0600000000',
    email: 'test@maisonslimani.ma',
    address: 'Rue 123',
    city: 'Casablanca',
    items: [{
      id: 'p1',
      name: 'Produit 1',
      price: 1500,
      quantity: 1
    }],
    total: 1500
  }
  assert.doesNotThrow(() => commandeSchema.parse(validOrder))
})

test('commandeSchema - fails on empty items array', () => {
  const invalidOrder = {
    customerName: 'Maison Test',
    phone: '0600000000',
    address: 'Rue 123',
    city: 'Casablanca',
    items: [],
    total: 0
  }
  const result = commandeSchema.safeParse(invalidOrder)
  assert.strictEqual(result.success, false)
})

test('commentaireSchema - validates rating bounds', () => {
  // Valid rating
  assert.ok(commentaireSchema.safeParse({
    productId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'User',
    rating: 5,
    content: 'Excellent'
  }).success)

  // Invalid rating (too high)
  assert.strictEqual(commentaireSchema.safeParse({
    productId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'User',
    rating: 6,
    content: 'Bad'
  }).success, false)
})

test('contactSchema - validates required fields', () => {
  const validContact = {
    name: 'Sheikh Hassan',
    email: 'hassan@maison.ma',
    message: 'Bonjour'
  }
  assert.ok(contactSchema.safeParse(validContact).success)

  const invalidContact = {
    name: '',
    email: 'not-an-email',
    message: ''
  }
  const result = contactSchema.safeParse(invalidContact)
  assert.strictEqual(result.success, false)
})

test('searchSuggestionsQuerySchema - transforms limit', () => {
  const result = searchSuggestionsQuerySchema.parse({ q: 'shoe', limit: '5' })
  assert.strictEqual(result.limit, 5)
  assert.strictEqual(result.type, 'all') // Default value
})

test('categoryQuerySchema - transforms isActive boolean', () => {
  assert.strictEqual(categoryQuerySchema.parse({ isActive: 'true' }).isActive, true)
  assert.strictEqual(categoryQuerySchema.parse({ isActive: 'false' }).isActive, false)
  assert.strictEqual(categoryQuerySchema.parse({}).isActive, undefined)
})
