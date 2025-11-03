'use client'

import { useState, useEffect } from 'react'

export interface CartItem {
  id: string
  nom: string
  prix: number
  quantite: number
  image_url?: string
  image?: string
  taille?: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items))
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }, [items, isLoaded])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantite: i.quantite + item.quantite } : i
        )
      }
      return [...prev, item]
    })
    
    // Son d'ajout au panier
    if ((window as any).playSuccessSound) {
      ;(window as any).playSuccessSound()
    }
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantite: number) => {
    if (quantite <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantite } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((acc, item) => acc + item.prix * item.quantite, 0)

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isLoaded,
  }
}

