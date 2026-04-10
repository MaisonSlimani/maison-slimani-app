'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { subscribeToBulkStockUpdates } from '@maison/db'

/**
 * Hook to validate cart stock in realtime.
 * Uses the decoupled DB utility for bulk subscriptions.
 */
import { CartItem } from '@maison/domain'

export function useCartStockValidation(items: CartItem[], isOpen: boolean) {
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen || items.length === 0) return

    const productIds = Array.from(new Set(items.map(item => item.id)))

    const unsubscribe = subscribeToBulkStockUpdates(productIds, (updated: { id: string; has_colors: boolean | null; couleurs: { nom: string; stock?: number | null }[] | null; stock: number | null }) => {
      const cartItem = items.find(item => item.id === updated.id)
      if (!cartItem) return

      const available = updated.has_colors 
        ? updated.couleurs?.find((c: { nom: string }) => c.nom === cartItem.couleur)?.stock || 0
        : updated.stock || 0

      const key = `${cartItem.id}-${cartItem.couleur || ''}-${cartItem.taille || ''}`
      
      if (available < cartItem.quantite) {
        setStockErrors(prev => ({ ...prev, [key]: `Plus que ${available} dispos` }))
        toast.error(`Stock insuffisant pour ${cartItem.nom} (${available} restants)`)
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
