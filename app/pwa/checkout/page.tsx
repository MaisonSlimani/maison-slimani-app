'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

export default function PWACheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom_client: '',
    telephone: '',
    adresse: '',
    ville: '',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isLoaded && items.length === 0) {
      router.push('/pwa/panier')
    }
  }, [isLoaded, items.length, router])

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

      // Succès - Vider le panier et rediriger
      clearCart()
      router.push(`/pwa/commande/${result.data.id}`)
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
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-2xl font-serif text-foreground">Commande</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 max-w-md mx-auto">
        <Card className="p-4 space-y-4">
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

        <Card className="p-4 bg-muted/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total</span>
            <span className="text-xl font-serif text-dore font-semibold">
              {total.toLocaleString('fr-MA')} MAD
            </span>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-dore text-charbon hover:bg-dore/90"
          >
            {loading ? 'Traitement...' : 'Confirmer la commande'}
          </Button>
        </Card>
      </form>
    </div>
  )
}

