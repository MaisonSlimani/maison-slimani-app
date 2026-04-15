'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeToStockUpdate } from '@maison/db'

/**
 * Hook to trigger router refresh when a product's stock changes.
 * Consumes the decoupled Realtime utility from @maison/db.
 */
export function useRealtimeStock(productId: string | undefined) {
  const router = useRouter()

  useEffect(() => {
    if (!productId) return

    const unsubscribe = subscribeToStockUpdate(productId, () => {
      router.refresh()
    })

    return () => {
      unsubscribe()
    }
  }, [productId, router])
}
