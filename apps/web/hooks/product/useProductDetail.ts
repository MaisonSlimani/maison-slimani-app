'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { Product, ProductVariation } from '@maison/domain'
import { useProductStock } from './useProductStock'
import { useProductAnalytics } from './useProductAnalytics'
import { useProductActions } from './useProductActions'
import { useProductGalleries } from './useProductGalleries'

/**
 * Orchestrator Hook for product detail page logic.
 * Composes specialized hooks for stock, analytics, actions, and galleries.
 */
export function useProductDetail(produitInitial: Product) {
  const params = useParams()
  const [produit, setProduit] = useState<Product>(produitInitial)
  const [quantite, setQuantite] = useState(1)
  const [couleur, setCouleur] = useState<string>('')
  const [taille, setTaille] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { items } = useCart()
  const isInCart = items.some(item => item.id === produit.id)

  // Side Effects: Stock & Analytics
  useProductStock(produit.id, setProduit)
  useProductAnalytics(produit, couleur, setCouleur)

  // Actions: Cart & Wishlist
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions({
    produit, 
    quantite, 
    couleur, 
    taille, 
    setAddedToCart, 
    params: params as Record<string, string>
  })

  // Derived Data: Gallerie & Tailles
  const allImages = useProductGalleries(produit)
  const variations = produit.couleurs as ProductVariation[] | null
  const taillesData = (produit?.has_colors && couleur && variations) 
    ? (variations.find((cl) => cl.nom === couleur)?.tailles || []) 
    : (produit?.tailles || [])

  return { 
    produit, 
    quantite, setQuantite, 
    couleur, setCouleur, 
    taille, setTaille, 
    addedToCart, 
    isInCart, 
    inWishlist: isInWishlist, 
    handleAddToCart, 
    handleToggleWishlist,
    taillesData, 
    allImages
  }
}
