'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface CartItem {
  id: string
  nom: string
  prix: number
  quantite: number
  image_url?: string
  image?: string
  taille?: string
  couleur?: string
  stock?: number
  categorie?: string // Category name for generating URLs
  slug?: string // Product slug for generating URLs
  categorySlug?: string // Category slug for generating URLs (preferred)
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const prevItemsRef = useRef<string>('')
  const itemsRef = useRef<CartItem[]>([])

  // Fonction pour charger le panier depuis localStorage
  const loadCartFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          setItems(parsed)
          // Mettre à jour prevItemsRef pour éviter de dispatcher l'événement
          prevItemsRef.current = savedCart
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error)
        }
      } else {
        setItems([])
        prevItemsRef.current = '[]'
      }
    }
  }, [])

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadCartFromStorage()
      setIsLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Écouter les mises à jour du panier depuis d'autres composants
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) {
      return
    }
    
    const handleCartUpdate = () => {
      // Recharger le panier depuis localStorage quand un autre composant le met à jour
      loadCartFromStorage()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [isLoaded, loadCartFromStorage])

  // Mettre à jour le ref quand items change
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      const itemsJson = JSON.stringify(items)
      const prevItemsJson = prevItemsRef.current
      
      // Sauvegarder dans localStorage
      localStorage.setItem('cart', itemsJson)
      
      // Déclencher un événement seulement si les items ont vraiment changé
      // (pas juste lors du rechargement depuis localStorage)
      if (prevItemsJson && prevItemsJson !== itemsJson) {
        window.dispatchEvent(new Event('cartUpdated'))
      }
      
      prevItemsRef.current = itemsJson
    }
  }, [items, isLoaded])

  const addItem = async (item: CartItem, openDrawer: boolean = true) => {
    // Vérification client-side (immédiate)
    if (item.stock === undefined || item.stock === null) {
      throw new Error(`Stock non disponible pour "${item.nom}"`)
    }
    
    if (item.stock <= 0) {
      throw new Error(`Produit "${item.nom}" en rupture de stock`)
    }
    
    if (item.stock < item.quantite) {
      throw new Error(`Stock insuffisant pour "${item.nom}". Stock disponible: ${item.stock}`)
    }

    // Vérification serveur-side (source de vérité)
    try {
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: produit, error } = await supabase
          .from('produits')
          .select('id, stock, total_stock, has_colors, couleurs')
          .eq('id', item.id)
          .single()

        if (error || !produit) {
          throw new Error(`Produit "${item.nom}" introuvable`)
        }

        // Vérifier le stock selon le type de produit
        let stockDisponible: number = 0
        
        if (produit.has_colors && item.couleur) {
          // Produit avec couleurs - vérifier le stock de la couleur spécifique
          if (!produit.couleurs || !Array.isArray(produit.couleurs)) {
            throw new Error(`Couleur "${item.couleur}" non disponible pour "${item.nom}"`)
          }
          
          const couleurSelected = produit.couleurs.find((c: any) => c.nom === item.couleur)
          if (!couleurSelected) {
            throw new Error(`Couleur "${item.couleur}" non disponible pour "${item.nom}"`)
          }
          
          stockDisponible = couleurSelected.stock || 0
        } else if (!produit.has_colors) {
          // Produit sans couleurs - vérifier le stock global
          stockDisponible = produit.stock || 0
        } else {
          throw new Error(`Couleur requise pour "${item.nom}"`)
        }

        if (stockDisponible <= 0) {
          throw new Error(`Produit "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''} en rupture de stock`)
        }

        // Récupérer les items actuels pour calculer la quantité totale
        const currentItems = itemsRef.current
        // Pour les produits avec couleurs, vérifier la même couleur
        const existing = produit.has_colors && item.couleur
          ? currentItems.find((i) => i.id === item.id && i.couleur === item.couleur)
          : currentItems.find((i) => i.id === item.id && !i.couleur)
        
        const quantiteTotale = existing ? existing.quantite + item.quantite : item.quantite

        if (stockDisponible < quantiteTotale) {
          throw new Error(`Stock insuffisant pour "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''}. Stock disponible: ${stockDisponible}, quantité demandée: ${quantiteTotale}`)
        }

        // Mettre à jour le stock dans l'item avec la valeur réelle de la DB
        item.stock = stockDisponible
      }
    } catch (error) {
      // Si l'erreur est déjà un Error avec un message, la relancer
      if (error instanceof Error) {
        throw error
      }
      // Sinon, lancer une erreur générique
      throw new Error(`Erreur lors de la vérification du stock pour "${item.nom}"`)
    }
    
    // Si tout est OK, ajouter au panier
    setItems((prev) => {
      // Pour les produits avec couleurs, vérifier la même couleur
      const existing = item.couleur
        ? prev.find((i) => i.id === item.id && i.couleur === item.couleur && i.taille === item.taille)
        : prev.find((i) => i.id === item.id && !i.couleur && i.taille === item.taille)
      
      if (existing) {
        const nouvelleQuantite = existing.quantite + item.quantite
        return prev.map((i) =>
          i.id === item.id && i.couleur === item.couleur && i.taille === item.taille
            ? { ...i, quantite: nouvelleQuantite, stock: item.stock }
            : i
        )
      }
      return [...prev, item]
    })
    
    // Son d'ajout au panier
    if ((window as any).playSuccessSound) {
      ;(window as any).playSuccessSound()
    }

    // Ouvrir le drawer du panier après ajout (sauf si openDrawer est false)
    // Use setTimeout to defer the drawer opening until after the current render cycle
    if (openDrawer && typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('openCartDrawer'))
      }, 0)
    }
  }

  // Helper pour créer une clé unique pour un item (id + couleur + taille)
  const getItemKey = (item: CartItem): string => {
    return `${item.id}-${item.couleur || ''}-${item.taille || ''}`
  }

  const removeItem = (id: string, couleur?: string, taille?: string) => {
    setItems((prev) => {
      if (couleur !== undefined || taille !== undefined) {
        // Supprimer un item spécifique avec couleur/taille
        return prev.filter((item) => 
          !(item.id === id && 
            (couleur === undefined || item.couleur === couleur) &&
            (taille === undefined || item.taille === taille))
        )
      }
      // Si pas de couleur/taille spécifiée, supprimer le premier match (pour compatibilité)
      const itemToRemove = prev.find((item) => item.id === id && !item.couleur && !item.taille)
      if (itemToRemove) {
        return prev.filter((item) => item !== itemToRemove)
      }
      // Fallback: supprimer tous les items avec cet id (ancien comportement)
      return prev.filter((item) => item.id !== id)
    })
  }

  const updateQuantity = (id: string, quantite: number, couleur?: string, taille?: string) => {
    if (quantite <= 0) {
      removeItem(id, couleur, taille)
      return
    }
    setItems((prev) => {
      // Trouver l'item spécifique
      const item = couleur !== undefined || taille !== undefined
        ? prev.find((i) => 
            i.id === id && 
            (couleur === undefined || i.couleur === couleur) &&
            (taille === undefined || i.taille === taille)
          )
        : prev.find((i) => i.id === id && !i.couleur && !i.taille)
      
      if (item && item.stock !== undefined && item.stock < quantite) {
        throw new Error(`Stock insuffisant pour "${item.nom}". Stock disponible: ${item.stock}`)
      }
      
      return prev.map((item) => {
        const matches = item.id === id && 
          (couleur === undefined || item.couleur === couleur) &&
          (taille === undefined || item.taille === taille)
        return matches ? { ...item, quantite } : item
      })
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((acc, item) => acc + item.prix * item.quantite, 0)
  // totalItems now represents the number of unique products, not total quantity
  const totalItems = items.length

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    totalItems,
    isLoaded,
  }
}

