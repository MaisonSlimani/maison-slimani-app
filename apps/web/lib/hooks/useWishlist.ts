'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem, wishlistItemSchema } from '@maison/domain'
import { createPersistentStore } from '@maison/shared'
import { z } from 'zod'

export type WishlistItem = CartItem

const wishlistStore = createPersistentStore<WishlistItem[]>({
  key: 'wishlist',
  version: 2,
  schema: z.array(wishlistItemSchema) as unknown as z.ZodType<WishlistItem[]>,
  fallback: [],
  migrate: (old: unknown, _fromVersion: number) => {
    if (!Array.isArray(old)) return [];
    return old.map(item => ({
      ...item,
      name: item.name || item.nom,
      price: item.price || item.prix,
      quantity: item.quantity || item.quantite || 1,
      size: item.size || item.taille,
      color: item.color || item.couleur
    })) as WishlistItem[];
  }
});

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setItems(wishlistStore.get());
    setIsLoaded(true);

    const unsubscribe = wishlistStore.subscribe((newItems) => {
      setItems(newItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isInWishlist = useCallback((id: string) => items.some(i => i.id === id), [items])
  
  const toggleItem = useCallback((item: WishlistItem) => {
    const current = wishlistStore.get()
    const exists = current.some(i => i.id === item.id)
    const updated = exists 
      ? current.filter(i => i.id !== item.id) 
      : [...current, item]
    wishlistStore.set(updated)
  }, [])

  const addItem = (item: WishlistItem) => {
    const current = wishlistStore.get()
    if (!current.some(i => i.id === item.id)) {
      wishlistStore.set([...current, item])
    }
  }

  const removeItem = (id: string) => {
    const current = wishlistStore.get()
    wishlistStore.set(current.filter(i => i.id !== id))
  }

  const clearWishlist = () => {
    wishlistStore.clear()
  }

  return { 
    items, 
    addItem, 
    removeItem, 
    toggleItem, 
    isInWishlist, 
    clearWishlist, 
    isLoaded, 
    count: items.length 
  }
}
