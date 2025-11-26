'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface WishlistItem {
  id: string
  nom: string
  prix: number
  image_url?: string
  image?: string
  taille?: string
  stock?: number
}

const STORAGE_KEY = 'wishlist'

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const isUpdating = useRef(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedWishlist = localStorage.getItem(STORAGE_KEY)
        if (savedWishlist) {
          const parsed = JSON.parse(savedWishlist)
          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading wishlist:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save wishlist to localStorage on changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined' && !isUpdating.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new Event('wishlistUpdated'))
    }
  }, [items, isLoaded])

  // Listen for wishlist updates from other tabs/components
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) {
            isUpdating.current = true
            setItems(parsed)
            setTimeout(() => {
              isUpdating.current = false
            }, 100)
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      // Check if item already exists
      if (prev.some((i) => i.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      }
      return [...prev, item]
    })
  }, [])

  const isInWishlist = useCallback((id: string) => {
    return items.some((item) => item.id === id)
  }, [items])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    clearWishlist,
    isLoaded,
    count: items.length,
  }
}
