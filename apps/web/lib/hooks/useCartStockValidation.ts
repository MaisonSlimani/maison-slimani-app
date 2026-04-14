'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { subscribeToBulkStockUpdates } from '@maison/db'
import { CartItem, ProductVariation } from '@maison/domain'

/**
 * Hook to validate cart stock in realtime.
 * Uses the decoupled DB utility for bulk subscriptions.
 */
export function useCartStockValidation(items: CartItem[], isOpen: boolean) {
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen || items.length === 0) return

    const productIds = Array.from(new Set(items.map(item => item.id)))

    const unsubscribe = subscribeToBulkStockUpdates(productIds, (updated: { 
      id: string; 
      stock: number | null; 
      colors: ProductVariation[] | null; 
      hasColors: boolean | null; 
    }) => {
      const cartItem = items.find(item => item.id === updated.id)
      if (!cartItem) return

      const available = updated.hasColors 
        ? updated.colors?.find((c: ProductVariation) => c.name === cartItem.color)?.stock || 0
        : updated.stock || 0

      const key = `${cartItem.id}-${cartItem.color || ''}-${cartItem.size || ''}`
      
      if (available < cartItem.quantity) {
        setStockErrors(prev => ({ ...prev, [key]: `Plus que ${available} dispos` }))
        toast.error(`Stock insuffisant pour ${cartItem.name} (${available} restants)`)
      } else {
        setStockErrors(prev => {
          const next = { ...prev }; delete next[key]; return next
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [isOpen, items])

  return stockErrors
}
