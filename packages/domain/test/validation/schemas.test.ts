import test from 'node:test'
import assert from 'node:assert/strict'
import { 
  produitQuerySchema, 
  commandeSchema, 
  commentaireSchema 
} from '../../src/validation/schemas'

test('produitQuerySchema - transforms string limit to number', () => {
  const result = produitQuerySchema.parse({ limit: '10' })
  assert.strictEqual(result.limit, 10)
})

test('produitQuerySchema - handles comma-separated tailles', () => {
  const result = produitQuerySchema.parse({ taille: '40, 41,42' })
  assert.deepStrictEqual(result.taille, ['40', '41', '42'])
})

test('produitQuerySchema - handles single categorie as array', () => {
  const result = produitQuerySchema.parse({ categorie: 'sneakers' })
  assert.deepStrictEqual(result.categorie, ['sneakers'])
})

test('commandeSchema - validates valid order', () => {
  const validOrder = {
    nom_client: 'Maison Test',
    telephone: '0600000000',
    email: 'test@maisonslimani.ma',
    adresse: 'Rue 123',
    ville: 'Casablanca',
    produits: [{
      id: 'p1',
      nom: 'Produit 1',
      prix: 1500,
      quantite: 1
    }],
    total: 1500
  }
  assert.doesNotThrow(() => commandeSchema.parse(validOrder))
})

test('commandeSchema - fails on empty products array', () => {
  const invalidOrder = {
    nom_client: 'Maison Test',
    telephone: '0600000000',
    adresse: 'Rue 123',
    ville: 'Casablanca',
    produits: [],
    total: 0
  }
  const result = commandeSchema.safeParse(invalidOrder)
  assert.strictEqual(result.success, false)
})

test('commentaireSchema - validates rating bounds', () => {
  // Valid rating
  assert.ok(commentaireSchema.safeParse({
    produit_id: '550e8400-e29b-41d4-a716-446655440000',
    nom: 'User',
    rating: 5,
    commentaire: 'Excellent'
  }).success)

  // Invalid rating (too high)
  assert.strictEqual(commentaireSchema.safeParse({
    produit_id: '550e8400-e29b-41d4-a716-446655440000',
    nom: 'User',
    rating: 6,
    commentaire: 'Bad'
  }).success, false)
})
