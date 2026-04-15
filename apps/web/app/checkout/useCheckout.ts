'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { trackInitiateCheckout } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'

import { CartItem } from '@maison/domain'

import { cleanCartItems, sendOrder } from '@/lib/api/order-client'

export function useCheckout() {
  const router = useRouter()
  const { items, total, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({ 
    customerName: '', 
    phone: '', 
    email: '', 
    address: '', 
    city: '' 
  })

  useCheckoutAnalytics(isLoaded, items, total)

  useEffect(() => {
    if (isLoaded && items.length === 0 && !orderComplete) {
      router.push('/panier')
    }
  }, [isLoaded, items.length, router, orderComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    try {
      const { commandeSchema } = await import('@maison/domain')
      const payload = { ...formData, items: cleanCartItems(items), total }
      const validation = commandeSchema.safeParse(payload)
      
      if (!validation.success) {
        return toast.error(`Erreur : ${validation.error.errors[0]?.message || 'Vérifiez vos infos'}`)
      }

      setLoading(true)
      const res = await sendOrder({
        ...validation.data,
        email: validation.data.email ?? null
      })
      
      if (!res.success) {
        setLoading(false)
        return res.status === 409 ? toast.warning(`⚠️ Stock : ${res.error}`) : toast.error(`❌ Échec : ${res.error}`)
      }

      setOrderComplete(true)
      if (res.data) localStorage.setItem('lastOrder', JSON.stringify(res.data))

      clearCart()
      toast.success('Commande reçue ! Redirection...')
      setTimeout(() => router.replace('/commande/confirme'), 500)
    } catch (err) {
      setLoading(false)
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      toast.error(isTimeout ? 'Le serveur met trop de temps à répondre.' : 'Une erreur technique est survenue.')
    }
  }

  return { items, total, isLoaded, loading, formData, setFormData, handleSubmit }
}

function useCheckoutAnalytics(isLoaded: boolean, items: CartItem[], total: number) {
  useEffect(() => {
    if (isLoaded && items.length > 0) {
      const numItems = items.reduce((sum, item) => sum + item.quantity, 0)
      trackInitiateCheckout({
        value: total, 
        currency: 'MAD', 
        num_items: numItems,
        contents: items.map(i => ({ id: i.id, quantity: i.quantity, name: i.name, item_price: i.price })),
      })
      tracker.trackCheckoutStarted(items, total)
    }
  }, [isLoaded, items, total])
}
