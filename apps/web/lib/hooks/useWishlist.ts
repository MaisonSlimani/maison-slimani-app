'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CartItem } from '@maison/domain'

export type WishlistItem = CartItem
const STORAGE_KEY = 'wishlist'

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const isUpdating = useRef(false)

  const load = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) { isUpdating.current = true; setItems(parsed); setTimeout(() => { isUpdating.current = false }, 100) }
      }
    } catch (e) { console.error(e); localStorage.removeItem(STORAGE_KEY) }
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') { load(); setIsLoaded(true) } }, [load])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && !isUpdating.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event('wishlistUpdated'))
    }
  }, [items, isLoaded])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = (e?: StorageEvent) => { if (!e || (e.key === STORAGE_KEY && e.newValue)) load() }
    window.addEventListener('storage', sync)
    window.addEventListener('wishlistUpdated', load)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('wishlistUpdated', load) }
  }, [load])

  const isInWishlist = useCallback((id: string) => items.some(i => i.id === id), [items])
  const toggleItem = useCallback((item: WishlistItem) => {
    setItems(prev => prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item])
  }, [])

  return { items, addItem: (item: WishlistItem) => setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]), removeItem: (id: string) => setItems(prev => prev.filter(i => i.id !== id)), toggleItem, isInWishlist, clearWishlist: () => setItems([]), isLoaded, count: items.length }
}
