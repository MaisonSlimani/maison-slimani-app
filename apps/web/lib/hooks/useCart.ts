'use client'

import { useState, useEffect } from 'react'
import { trackAddToCart } from '@/lib/analytics'
import { CartItem, cartItemSchema } from '@maison/domain'
import { createPersistentStore } from '@maison/shared'
import { z } from 'zod'

const cartStore = createPersistentStore<CartItem[]>({
  key: 'cart',
  version: 2,
  schema: z.array(cartItemSchema) as z.ZodType<CartItem[]>,
  fallback: [],
  migrate: (old: unknown, _fromVersion: number) => {
    if (!Array.isArray(old)) return [];
    // Migration from old French/DB names to clean English Domain names
    return old.map(item => ({
      ...item,
      name: item.name || item.nom,
      price: item.price || item.prix,
      quantity: item.quantity || item.quantite,
      size: item.size || item.taille,
      color: item.color || item.couleur
    })) as CartItem[];
  }
});

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setItems(cartStore.get());
    setIsLoaded(true);

    const unsubscribe = cartStore.subscribe((newItems) => {
      setItems(newItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addItem = async (item: CartItem, openDrawer = true) => {
    const { CartService } = await import('@maison/domain')
    const current = cartStore.get()
    const result = new CartService().addItem(current, item)
    if (!result.success || !result.data) throw new Error(result.error || "Erreur")
    
    cartStore.set(result.data)
    
    trackAddToCart({ 
      content_name: item.name, 
      content_ids: [item.id], 
      content_type: 'product', 
      value: item.price * item.quantity, 
      currency: 'MAD', 
      contents: [{ id: item.id, quantity: item.quantity, item_price: item.price }] 
    })
    
    if (openDrawer && typeof window !== 'undefined') {
      setTimeout(() => window.dispatchEvent(new CustomEvent('openCartDrawer')), 0)
    }
  }

  const removeItem = (id: string, color?: string | null, size?: string | null) => {
    const current = cartStore.get()
    const filtered = current.filter(i => !(i.id === id && (color === undefined || i.color === color) && (size === undefined || i.size === size)))
    cartStore.set(filtered)
  }

  const updateQuantity = (id: string, q: number, c?: string | null, s?: string | null) => {
    if (q <= 0) { removeItem(id, c, s); return }
    const current = cartStore.get()
    const updated = current.map(i => (i.id === id && (c === undefined || i.color === c) && (s === undefined || i.size === s)) ? { ...i, quantity: q } : i)
    cartStore.set(updated)
  }

  return { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart: () => cartStore.clear(), 
    total: items.reduce((a, i) => a + i.price * i.quantity, 0), 
    totalItems: items.length, 
    isLoaded 
  }
}
