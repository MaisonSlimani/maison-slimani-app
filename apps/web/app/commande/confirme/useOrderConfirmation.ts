'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'
import { Order, CommandeProduit } from '@maison/domain'

export function useOrderConfirmation() {
  useEffect(() => {
    window.scrollTo(0, 0)

    try {
      const orderDataStr = localStorage.getItem('lastOrder')
      if (orderDataStr) {
        const orderData = JSON.parse(orderDataStr) as Order
        if (orderData.id && orderData.items) {
          const total = orderData.total || 0
          const numItems = orderData.items.reduce((sum: number, p: CommandeProduit) => sum + (p.quantity || 0), 0)

          trackPurchase({
            value: total,
            currency: 'MAD',
            contents: orderData.items.map((p: CommandeProduit) => ({
              id: p.id,
              quantity: p.quantity || 1,
              item_price: p.price || 0,
            })),
            order_id: orderData.id,
            num_items: numItems,
          })

          tracker.trackOrderCompleted({
            id: orderData.id,
            total,
            numItems,
            items: orderData.items.map((p: CommandeProduit) => ({
              id: p.id,
              name: p.name,
              quantity: p.quantity || 1,
              price: p.price || 0,
            })),
            paymentMethod: 'COD',
          })

          if (orderData.customerName) {
            tracker.setUserProfile({
              $name: orderData.customerName,
              $email: orderData.email || undefined,
              $phone: orderData.phone || undefined,
              city: orderData.city,
            })
          }

          localStorage.removeItem('lastOrder')
        }
      }
    } catch (error) {
      console.error('Error tracking purchase:', error)
    }
  }, [])

  return {}
}
