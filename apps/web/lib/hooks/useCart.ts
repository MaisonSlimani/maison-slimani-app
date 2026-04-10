'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { trackAddToCart } from '@/lib/analytics'
import { CartItem } from '@maison/domain'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const prevItemsRef = useRef<string>('')
  const itemsRef = useRef<CartItem[]>([])

  const load = useCallback(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('cart')
    if (saved) {
      try { setItems(JSON.parse(saved)); prevItemsRef.current = saved } catch (e) { console.error(e) }
    } else { setItems([]); prevItemsRef.current = '[]' }
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') { load(); setIsLoaded(true) } }, [load])

  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return
    window.addEventListener('cartUpdated', load)
    return () => window.removeEventListener('cartUpdated', load)
  }, [isLoaded, load])

  useEffect(() => {
    itemsRef.current = items
    if (isLoaded && typeof window !== 'undefined') {
      const json = JSON.stringify(items)
      localStorage.setItem('cart', json)
      if (prevItemsRef.current !== json) window.dispatchEvent(new Event('cartUpdated'))
      prevItemsRef.current = json
    }
  }, [items, isLoaded])

  const addItem = async (item: CartItem, openDrawer = true) => {
    const { CartService } = await import('@maison/domain')
    const result = new CartService().addItem(itemsRef.current, item)
    if (!result.success || !result.data) throw new Error(result.error || "Erreur")
    setItems(result.data)
    trackAddToCart({ content_name: item.nom, content_ids: [item.id], content_type: 'product', value: item.prix * item.quantite, currency: 'MAD', contents: [{ id: item.id, quantity: item.quantite, item_price: item.prix }] })
    if (openDrawer && typeof window !== 'undefined') setTimeout(() => window.dispatchEvent(new CustomEvent('openCartDrawer')), 0)
  }

  const removeItem = (id: string, color?: string | null, size?: string | null) => {
    setItems(prev => prev.filter(i => !(i.id === id && (color === undefined || i.couleur === color) && (size === undefined || i.taille === size))))
  }

  const updateQuantity = (id: string, q: number, c?: string | null, s?: string | null) => {
    if (q <= 0) { removeItem(id, c, s); return }
    setItems(prev => prev.map(i => (i.id === id && (c === undefined || i.couleur === c) && (s === undefined || i.taille === s)) ? { ...i, quantite: q } : i))
  }

  return { items, addItem, removeItem, updateQuantity, clearCart: () => setItems([]), total: items.reduce((a, i) => a + i.prix * i.quantite, 0), totalItems: items.length, isLoaded }
}
