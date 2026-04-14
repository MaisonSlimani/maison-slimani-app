'use client'

import { useEffect } from 'react'
import { trackViewContent } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'
import { Product, ProductVariation } from '@maison/domain'

export function useProductAnalytics(produit: Product, color: string, setColor: (c: string) => void) {
  useEffect(() => {
    if (!produit) return
    
    // Track GA4 and Facebook
    trackViewContent({ 
      content_name: produit.name, 
      content_ids: [produit.id], 
      content_type: 'product', 
      value: produit.price, 
      currency: 'MAD' 
    })
    
    // Track Mixpanel
    tracker.trackProductViewed({ 
      id: produit.id, 
      name: produit.name, 
      category: produit.category || '', 
      price: produit.price, 
      inStock: (produit.stock || 0) > 0 
    })
    
    // Auto-select first color with stock
    const variations = produit.colors as ProductVariation[] | null
    if (produit.hasColors && variations && variations.length > 0 && !color) {
      const first = variations.find((c) => (c.stock || 0) > 0) || variations[0]
      if (first) setColor(first.name)
    }
  }, [produit, color, setColor])
}
