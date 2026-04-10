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
        if (orderData.id && orderData.produits) {
          const total = orderData.total || 0
          const numItems = orderData.produits.reduce((sum: number, p: CommandeProduit) => sum + (p.quantite || 0), 0)

          trackPurchase({
            value: total,
            currency: 'MAD',
            contents: orderData.produits.map((p: CommandeProduit) => ({
              id: p.id,
              quantity: p.quantite || 1,
              item_price: p.prix || 0,
            })),
            order_id: orderData.id,
            num_items: numItems,
          })

          tracker.trackOrderCompleted({
            id: orderData.id,
            total,
            numItems,
            items: orderData.produits.map((p: CommandeProduit) => ({
              id: p.id,
              name: p.nom,
              quantity: p.quantite || 1,
              price: p.prix || 0,
            })),
            paymentMethod: 'COD',
          })

          if (orderData.nom_client) {
            tracker.setUserProfile({
              $name: orderData.nom_client,
              $email: orderData.email || undefined,
              $phone: orderData.telephone || undefined,
              city: orderData.ville,
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
