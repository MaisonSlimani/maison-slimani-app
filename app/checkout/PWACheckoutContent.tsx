'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { CheckoutLoading } from '@/components/CheckoutLoading'

export default function PWACheckoutContent() {
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

  useEffect(() => {
    window.scrollTo(0, 0)
    // Ne pas rediriger si la commande vient d'être complétée
    if (isLoaded && items.length === 0 && !orderComplete) {
      router.push('/panier')
    }
  }, [isLoaded, items.length, router, orderComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

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

      // Préparer les données de la commande (sans total - calculé côté serveur)
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
        headers: { 'Content-Type': 'application/json' },
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

  if (!isLoaded || items.length === 0) {
    return null
  }

  return (
    <div className="w-full min-h-screen pb-20">
      <CheckoutLoading isLoading={loading} />
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-2xl font-serif text-foreground">Commande</h1>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
        {/* Récapitulatif des produits */}
        <Card className="p-4">
          <h2 className="text-lg font-serif mb-4">Récapitulatif</h2>
          <div className="space-y-4 mb-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.couleur || ''}-${item.taille || ''}`} className="flex gap-4 items-start">
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
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
                  {item.couleur && (
                    <p className="text-xs text-muted-foreground">Couleur: {item.couleur}</p>
                  )}
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
              <span className="text-lg font-serif">Total</span>
              <span className="text-lg font-serif text-dore font-semibold">
                {total.toLocaleString('fr-MA')} DH
              </span>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 space-y-4 bg-secondary/40">
          <h2 className="text-lg font-serif mb-4">Informations de livraison</h2>
          
          <div className="space-y-2">
            <Label htmlFor="nom_client">Nom complet *</Label>
            <Input
              id="nom_client"
              required
              value={formData.nom_client}
              onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
              placeholder="Votre nom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              type="tel"
              required
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="+212 6XX-XXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse *</Label>
            <Input
              id="adresse"
              required
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="Votre adresse"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ville">Ville *</Label>
            <Input
              id="ville"
              required
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              placeholder="Votre ville"
            />
          </div>
        </Card>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-dore text-charbon hover:bg-dore/90"
          >
            {loading ? 'Traitement...' : 'Confirmer la commande'}
          </Button>
        </form>
      </div>
    </div>
  )
}

