'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { CheckoutLoading } from '@/components/CheckoutLoading'
import { useIsPWA } from '@/lib/hooks/useIsPWA'
import PWACheckoutContent from './PWACheckoutContent'
import { trackInitiateCheckout } from '@/lib/analytics'
import { tracker } from '@/lib/mixpanel-tracker'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart, isLoaded } = useCart()
  const { isPWA, isLoading: isDetecting } = useIsPWA()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({
    nom_client: '',
    telephone: '',
    email: '',
    adresse: '',
    ville: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    // Ne pas rediriger si la commande vient d'être complétée
    if (isLoaded && items.length === 0 && !orderComplete) {
      router.push('/panier')
    }
  }, [isLoaded, items.length, router, orderComplete])

  // SEO: Noindex (transactional page)
  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    } else {
      const meta = document.createElement('meta') as HTMLMetaElement
      meta.name = 'robots'
      meta.content = 'noindex, nofollow'
      document.head.appendChild(meta)
    }
  }, [])

  // Track InitiateCheckout when checkout page loads with items
  useEffect(() => {
    if (isLoaded && items.length > 0) {
      const total = items.reduce((sum, item) => sum + (item.prix * item.quantite), 0)
      const numItems = items.reduce((sum, item) => sum + item.quantite, 0)

      trackInitiateCheckout({
        value: total,
        currency: 'MAD',
        contents: items.map(item => ({
          id: item.id,
          quantity: item.quantite,
          item_price: item.prix,
        })),
        num_items: numItems,
      })

      // Track Checkout Started in Mixpanel
      tracker.trackCheckoutStarted(items, total)
    }
  }, [isLoaded, items])

  // Realtime stock validation - continuously monitor stock changes
  useEffect(() => {
    if (!isLoaded || items.length === 0) return

    let cleanup: (() => void) | null = null

    const setupRealtime = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const productIds = items.map(item => item.id)

      // Subscribe to realtime stock updates
      const channel = supabase
        .channel(`checkout-stock-validation-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'produits',
            filter: `id=in.(${productIds.join(',')})`,
          },
          async (payload) => {
            const updated = payload.new as any
            const cartItem = items.find(item => item.id === updated.id)

            if (!cartItem) return

            // Validate stock for this item
            let stockDisponible = 0
            if (updated.has_colors && cartItem.couleur) {
              const couleurSelected = updated.couleurs?.find((c: any) => c.nom === cartItem.couleur)
              stockDisponible = couleurSelected?.stock || 0
            } else if (!updated.has_colors) {
              stockDisponible = updated.stock || 0
            }

            if (stockDisponible < cartItem.quantite) {
              setTimeout(() => {
                toast.error(
                  `Stock insuffisant pour "${cartItem.nom}"${cartItem.couleur ? ` (${cartItem.couleur})` : ''}. Disponible: ${stockDisponible}`,
                  { duration: 5000 }
                )
              }, 0)
            } else if (stockDisponible === 0) {
              setTimeout(() => {
                toast.error(
                  `Le produit "${cartItem.nom}"${cartItem.couleur ? ` (${cartItem.couleur})` : ''} est maintenant en rupture de stock`,
                  { duration: 5000 }
                )
              }, 0)
            }
          }
        )
        .subscribe()

      cleanup = () => {
        supabase.removeChannel(channel)
      }
    }

    setupRealtime()

    // Initial stock validation
    const validateCartStock = async () => {
      try {
        const responses = await Promise.all(
          items.map((item) =>
            fetch(`/api/produits/${item.id}`)
              .then(async (res) => ({
                item,
                ok: res.ok,
                data: res.ok ? (await res.json())?.data : null,
              }))
              .catch(() => ({ item, ok: false, data: null }))
          )
        )

        for (const { item, ok, data } of responses) {
          if (!ok || !data) {
            toast.error(`Le produit "${item.nom}" n'est plus disponible`)
            continue
          }

          let stockDisponible = 0

          if (data.has_colors && item.couleur) {
            if (!data.couleurs || !Array.isArray(data.couleurs)) {
              toast.error(
                `Couleur "${item.couleur}" non disponible pour "${item.nom}"`
              )
              continue
            }

            const couleurSelected = data.couleurs.find(
              (c: any) => c.nom === item.couleur
            )

            if (!couleurSelected) {
              toast.error(
                `Couleur "${item.couleur}" non disponible pour "${item.nom}"`
              )
              continue
            }

            stockDisponible = couleurSelected.stock || 0
          } else if (!data.has_colors) {
            stockDisponible = data.stock || 0
          } else {
            toast.error(`Couleur requise pour "${item.nom}"`)
            continue
          }

          if (stockDisponible <= 0) {
            toast.error(
              `Le produit "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''
              } est en rupture de stock`
            )
            continue
          }

          if (stockDisponible < item.quantite) {
            toast.error(
              `Stock insuffisant pour "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''
              }. Stock disponible: ${stockDisponible}`
            )
          }
        }
      } catch (error) {
        console.error('Erreur lors de la validation du stock:', error)
      }
    }

    validateCartStock()

    return () => {
      if (cleanup) cleanup()
    }
  }, [isLoaded, items])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Préparer les produits pour la commande (inclure l'image, la taille et la couleur)
      const produits = items.map((item) => ({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: item.quantite,
        image_url: item.image_url || item.image || null,
        taille: item.taille || null,
        couleur: item.couleur || null,
      }))

      // Préparer les données de la commande
      const commandeData = {
        nom_client: formData.nom_client,
        telephone: formData.telephone,
        email: formData.email || undefined,
        adresse: formData.adresse,
        ville: formData.ville,
        produits,
      }

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandeData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Formater le message d'erreur pour l'utilisateur
        let errorMessage = result.error || 'Erreur lors de la création de la commande'

        // Messages d'erreur plus clairs pour l'utilisateur
        if (errorMessage.includes('Stock insuffisant') || errorMessage.includes('stock insuffisant')) {
          errorMessage = 'Stock insuffisant pour certains produits. Veuillez vérifier votre panier.'
        } else if (errorMessage.includes('introuvable')) {
          errorMessage = 'Certains produits ne sont plus disponibles. Veuillez vérifier votre panier.'
        } else if (result.details?.fieldErrors || result.details?.formErrors) {
          // Si c'est une erreur de validation, afficher un message générique
          errorMessage = 'Veuillez vérifier les informations de votre commande.'
        }

        throw new Error(errorMessage)
      }

      const data = result

      // Store order data for Meta Pixel Purchase tracking
      if (data?.data) {
        localStorage.setItem('lastOrder', JSON.stringify({
          id: data.data.id,
          total: data.data.total,
          produits: data.data.produits || items.map(item => ({
            id: item.id,
            quantite: item.quantite,
            prix: item.prix,
          })),
        }))
      }

      // Store first product ID for upsells before clearing cart
      if (items.length > 0) {
        localStorage.setItem('lastOrderProductId', items[0].id)
      }

      // Succès - Marquer la commande comme complétée et rediriger
      setOrderComplete(true)
      // Vider le panier immédiatement
      clearCart()
      // Rediriger vers la page de confirmation simple (sans exposer l'ID)
      router.replace('/commande/confirme')
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la commande')
    } finally {
      setLoading(false)
    }
  }

  // Render PWA version
  if (!isDetecting && isPWA) {
    return <PWACheckoutContent />
  }

  if (!isLoaded || items.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container px-6 py-8 mx-auto">
          <div className="text-center py-12">Chargement...</div>
        </div>
      </div>
    )
  }

  // Render desktop version
  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <CheckoutLoading isLoading={loading} />

      <div className="container px-6 py-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-3xl font-serif mb-8">Finaliser votre commande</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Récapitulatif */}
            <Card className="p-6 order-2 md:order-1">
              <h2 className="text-2xl font-serif mb-6">Récapitulatif</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image_url || item.image || '/placeholder.jpg'}
                        alt={item.nom}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.nom}</p>
                      {item.taille && (
                        <p className="text-xs text-muted-foreground">Taille: {item.taille}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {item.quantite} × {item.prix.toLocaleString('fr-MA')} DH
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {(item.prix * item.quantite).toLocaleString('fr-MA')} DH
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Sous-total</span>
                  <span className="font-medium">{total.toLocaleString('fr-MA')} DH</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Livraison</span>
                  <span className="text-sm text-muted-foreground">Gratuite</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xl font-serif">Total</span>
                  <span className="text-xl font-serif text-primary">
                    {total.toLocaleString('fr-MA')} DH
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Livraison gratuite dans tout le Maroc
              </p>
              <p className="text-xs text-muted-foreground">
                * Retours sous 7 jours
              </p>
            </Card>

            {/* Formulaire */}
            <Card className="p-6 order-1 md:order-2 bg-secondary/40">
              <h2 className="text-2xl font-serif mb-6">Informations de livraison</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="nom_client">Nom complet *</Label>
                  <Input
                    id="nom_client"
                    required
                    className="mt-2"
                    value={formData.nom_client}
                    onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    required
                    className="mt-2"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+212 6XX-XXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    className="mt-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="adresse">Adresse complète *</Label>
                  <Input
                    id="adresse"
                    required
                    className="mt-2"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    required
                    className="mt-2"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    placeholder="Entrez le nom de votre ville"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading || !formData.nom_client || !formData.telephone || !formData.adresse || !formData.ville}
                >
                  {loading ? 'Traitement...' : 'Confirmer la commande'}
                </Button>
              </form>
            </Card>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

