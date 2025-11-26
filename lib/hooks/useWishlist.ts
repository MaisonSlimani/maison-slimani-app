'use client'

import { useState, useEffect } from 'react'

export interface WishlistItem {
  id: string
  nom: string
  prix: number
  image_url?: string
  image?: string
  taille?: string
  stock?: number
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger la wishlist depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        try {
          setItems(JSON.parse(savedWishlist))
        } catch (error) {
          console.error('Erreur lors du chargement de la wishlist:', error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Sauvegarder la wishlist dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(items))
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event('wishlistUpdated'))
    }
  }, [items, isLoaded])

  const addItem = (item: WishlistItem) => {
    setItems((prev) => {
      // Vérifier si l'item existe déjà
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev // Ne pas ajouter en double
      }
      // Utiliser une fonction de mise à jour pour éviter les race conditions
      return [...prev, item]
    })
    
    // Son d'ajout aux favoris
    if (typeof window !== 'undefined' && (window as any).playSuccessSound) {
      ;(window as any).playSuccessSound()
    }
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
  }

  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    isLoaded,
  }
}

