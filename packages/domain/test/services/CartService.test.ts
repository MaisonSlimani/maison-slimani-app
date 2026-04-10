import test from 'node:test'
import assert from 'node:assert/strict'
import { CartService } from '../../src/services/CartService'
import { CartItem } from '../../src/models'

test('CartService - addItem adds new item', () => {
  const service = new CartService()
  const items: CartItem[] = []
  const newItem: CartItem = { id: '1', nom: 'Produit 1', prix: 100, quantite: 1, stock: 10 }

  const result = service.addItem(items, newItem)
  
  assert.strictEqual(result.success, true)
  assert.strictEqual(result.data?.length, 1)
  assert.strictEqual(result.data?.[0].id, '1')
})

test('CartService - addItem updates quantity for existing item', () => {
  const service = new CartService()
  const items: CartItem[] = [
    { id: '1', nom: 'Produit 1', prix: 100, quantite: 1, stock: 10 }
  ]
  const newItem: CartItem = { id: '1', nom: 'Produit 1', prix: 100, quantite: 2, stock: 10 }

  const result = service.addItem(items, newItem)
  
  assert.strictEqual(result.success, true)
  assert.strictEqual(result.data?.length, 1)
  assert.strictEqual(result.data?.[0].quantite, 3)
})

test('CartService - addItem fails if stock is insufficient', () => {
  const service = new CartService()
  const items: CartItem[] = []
  const newItem: CartItem = { id: '1', nom: 'Produit 1', prix: 100, quantite: 5, stock: 2 }

  const result = service.addItem(items, newItem)
  
  assert.strictEqual(result.success, false)
  assert.match(result.error || '', /Stock insuffisant/)
})
