'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { trackInitiateCheckout } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'

export function useCheckout() {
  const router = useRouter()
  const { items, total, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({
    nom_client: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
  })

  // Prevent accessing checkout with empty cart
  useEffect(() => {
    if (isLoaded && items.length === 0 && !orderComplete) {
      router.push('/panier')
    }
  }, [isLoaded, items.length, router, orderComplete])

  // Analytics: Track InitiateCheckout
  useEffect(() => {
    if (isLoaded && items.length > 0) {
      const numItems = items.reduce((sum, item) => sum + item.quantite, 0)
      trackInitiateCheckout({
        value: total,
        currency: 'MAD',
        contents: items.map(item => ({ id: item.id, quantity: item.quantite, item_price: item.prix })),
        num_items: numItems,
      })
      tracker.trackCheckoutStarted(items, total)
    }
  }, [isLoaded, items, total])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    // 1. Client-side Validation (Industry Grade)
    try {
      const { commandeSchema } = await import('@maison/domain')
      
      const cleanItems = items.map(item => ({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: item.quantite,
        image_url: item.image_url || null,
        taille: item.taille || null,
        couleur: item.couleur || null
      }))

      const payload = { ...formData, produits: cleanItems, total }
      const validation = commandeSchema.safeParse(payload)
      
      if (!validation.success) {
        const firstError = validation.error.errors[0]?.message || 'Veuillez vérifier vos informations'
        toast.error(`Erreur de validation : ${firstError}`)
        return
      }

      setLoading(true)
      const idempotencyKey = crypto.randomUUID()

      // 2. Network Request with Safety Timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validation.data,
          idempotency_key: idempotencyKey
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      const result = await response.json()
      console.log('Checkout API Result:', result)
      
      if (!response.ok || !result.success) {
        setLoading(false)
        const errorMessage = result.error || 'Erreur inconnue'
        
        // Detailed error reporting for debugging while maintaining a premium feel
        if (response.status === 409) {
          toast.warning(`⚠️ Stock indisponible : ${errorMessage}`)
        } else {
          toast.error(`❌ Échec : ${errorMessage}`)
          console.error(`Checkout Failed (${response.status}):`, result)
        }
        return
      }

      // 3. Post-Order Success Orchestration
      setOrderComplete(true)
      
      if (result.data) {
        localStorage.setItem('lastOrder', JSON.stringify({ 
          id: result.data.id, 
          total: result.data.total, 
          produits: result.data.produits 
        }))
      }

      clearCart()
      toast.success('Commande reçue ! Redirection vers la confirmation...')
      
      // Delay redirect slightly to allow the user to see the success state
      setTimeout(() => {
        router.replace('/commande/confirme')
      }, 500)

    } catch (err: any) {
      setLoading(false)
      console.error('Checkout error:', err)
      
      if (err.name === 'AbortError') {
        toast.error('Le serveur met trop de temps à répondre. Vérifiez votre connexion.')
      } else {
        toast.error('Une erreur technique est survenue. Nous n\'avons pas pu envoyer votre commande.')
      }
    }
  }

  return {
    items, total, isLoaded, loading, formData, setFormData, handleSubmit
  }
}
