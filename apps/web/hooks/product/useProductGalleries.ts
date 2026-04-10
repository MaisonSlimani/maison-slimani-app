'use client'

import { useMemo } from 'react'
import { Product } from '@maison/domain'

export function useProductGalleries(produit: Product) {
  return useMemo(() => {
    const images: { url: string; couleur?: string | null }[] = []
    
    if (!produit.image_url && (!produit.images || produit.images.length === 0)) {
      return images;
    }

    // Add main image
    if (produit.image_url) {
      images.push({ url: produit.image_url, couleur: null })
    }
    
    // Add gallery images
    if (produit.images && Array.isArray(produit.images)) {
      produit.images.forEach(img => {
        if (img && img !== produit.image_url) {
          images.push({ url: img, couleur: null })
        }
      })
    }
    
    // Add variation images
    if (produit.couleurs && Array.isArray(produit.couleurs)) {
      produit.couleurs.forEach(v => {
        if (v.images && Array.isArray(v.images)) {
          v.images.forEach(img => {
            images.push({ url: img, couleur: v.nom })
          })
        }
      })
    }
    
    return images;
  }, [produit])
}
