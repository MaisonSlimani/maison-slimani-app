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
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { items } = useCart()
  const isInCart = items.some(item => 
    item.id === produit.id && 
    (produit.hasColors ? item.color === color : true) &&
    ((produit.sizes?.length || 0) > 0 ? item.size === size : true)
  )

  // Side Effects: Stock & Analytics
  useProductStock(produit.id, setProduit)
  useProductAnalytics(produit, color, setColor)

  // Actions: Cart & Wishlist
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions({
    produit, 
    quantity, 
    color, 
    size, 
    setAddedToCart, 
    params: params as Record<string, string>
  })

  // Derived Data: Gallery & Sizes
  const allImages = useProductGalleries(produit)
  const variations = produit.colors as ProductVariation[] | null
  const sizesData = (produit?.hasColors && color && variations) 
    ? (variations.find((cl) => cl.name === color)?.sizes || []) 
    : (produit?.sizes || [])

  return { 
    produit, 
    quantity, setQuantity, 
    color, setColor, 
    size, setSize, 
    addedToCart, 
    isInCart, 
    inWishlist: isInWishlist, 
    handleAddToCart, 
    handleToggleWishlist,
    sizesData, 
    allImages
  }
}
