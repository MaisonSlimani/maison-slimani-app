'use client'

import { useMemo } from 'react'
import { Product } from '@maison/domain'

export function useProductGalleries(product: Product) {
  return useMemo(() => {
    const images: { url: string; color?: string | null }[] = []
    
    if (!product.image_url && (!product.images || product.images.length === 0)) {
      return images;
    }

    // Add main image
    if (product.image_url) {
      images.push({ url: product.image_url, color: null })
    }
    
    // Add gallery images
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img !== product.image_url) {
          images.push({ url: img, color: null })
        }
      })
    }
    
    // Add variation images
    if (product.colors && Array.isArray(product.colors)) {
      product.colors.forEach(v => {
        if (v.images && Array.isArray(v.images)) {
          v.images.forEach(img => {
            images.push({ url: img, color: v.name })
          })
        }
      })
    }
    
    return images;
  }, [product])
}
