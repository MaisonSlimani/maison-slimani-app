'use client'

import { useEffect } from 'react'
import { subscribeToStockUpdate } from '@maison/db'
import { Product } from '@maison/domain'

export function useProductStock(productId: string, setProduit: React.Dispatch<React.SetStateAction<Product>>) {
  useEffect(() => {
    if (!productId) return
    const unsubscribe = subscribeToStockUpdate(productId, (updated) => {
      setProduit((prev) => ({ 
        ...prev, 
        stock: updated.stock, 
        couleurs: updated.couleurs, 
        has_colors: updated.has_colors 
      }))
    })
    return () => unsubscribe()
  }, [productId, setProduit])
}
