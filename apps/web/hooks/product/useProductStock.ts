'use client'

import { useEffect } from 'react'
import { subscribeToStockUpdate } from '@maison/db'
import { Product, ProductVariation } from '@maison/domain'

export function useProductStock(productId: string, setProduct: React.Dispatch<React.SetStateAction<Product>>) {
  useEffect(() => {
    if (!productId) return
    const unsubscribe = subscribeToStockUpdate(productId, (updated: { 
      id: string; 
      stock: number | null; 
      colors: ProductVariation[] | null; 
      hasColors: boolean | null; 
    }) => {
      setProduct((prev) => ({ 
        ...prev, 
        stock: updated.stock, 
        colors: updated.colors, 
        hasColors: updated.hasColors 
      }))
    })
    return () => unsubscribe()
  }, [productId, setProduct])
}
