'use client'

import { useEffect } from 'react'
import { trackViewContent } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'
import { Product, ProductVariation } from '@maison/domain'

export function useProductAnalytics(produit: Product, couleur: string, setCouleur: (c: string) => void) {
  useEffect(() => {
    if (!produit) return
    
    // Track GA4 and Facebook
    trackViewContent({ 
      content_name: produit.nom, 
      content_ids: [produit.id], 
      content_type: 'product', 
      value: produit.prix, 
      currency: 'MAD' 
    })
    
    // Track Mixpanel
    tracker.trackProductViewed({ 
      id: produit.id, 
      name: produit.nom, 
      category: produit.categorie || '', 
      price: produit.prix, 
      inStock: (produit.stock || 0) > 0 
    })
    
    // Auto-select first color with stock
    const variations = produit.couleurs as ProductVariation[] | null
    if (produit.has_colors && variations && variations.length > 0 && !couleur) {
      const first = variations.find((c) => (c.stock || 0) > 0) || variations[0]
      if (first) setCouleur(first.nom)
    }
  }, [produit, couleur, setCouleur])
}
