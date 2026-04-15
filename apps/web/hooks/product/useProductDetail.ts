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
export function useProductDetail(initialProduct: Product) {
  const params = useParams()
  const [product, setProduct] = useState<Product>(initialProduct)
  const [quantity, setQuantity] = useState(1)
  const [color, setColor] = useState<string>('')
  const [size, setSize] = useState<string>('')
  const [addedToCart, setAddedToCart] = useState(false)

  const { items } = useCart()
  const isInCart = items.some(item => 
    item.id === product.id && 
    (product.hasColors ? item.color === color : true) &&
    ((product.sizes?.length || 0) > 0 ? item.size === size : true)
  )

  // Side Effects: Stock & Analytics
  useProductStock(product.id, setProduct)
  useProductAnalytics(product, color, setColor)

  // Actions: Cart & Wishlist
  const { handleAddToCart, handleToggleWishlist, isInWishlist } = useProductActions({
    product, 
    quantity, 
    color, 
    size, 
    setAddedToCart, 
    params: params as Record<string, string>
  })

  // Derived Data: Gallery & Sizes
  const allImages = useProductGalleries(product)
  const variations = product.colors as ProductVariation[] | null
  const sizesData = (product?.hasColors && color && variations) 
    ? (variations.find((cl) => cl.name === color)?.sizes || []) 
    : (product?.sizes || [])

  return { 
    product, 
    setProduct,
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
