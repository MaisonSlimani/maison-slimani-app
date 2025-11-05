'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const villesMaroc = [
  'Agadir',
  'Beni Mellal',
  'Casablanca',
  'El Jadida',
  'Fès',
  'Kenitra',
  'Khouribga',
  'Marrakech',
  'Meknès',
  'Mohammedia',
  'Nador',
  'Oujda',
  'Rabat',
  'Safi',
  'Settat',
  'Tanger',
  'Taza',
  'Tétouan',
  'Autre',
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart, isLoaded } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({
    nom_client: '',
    telephone: '',
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
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    } else {
      const meta = document.createElement('meta') as HTMLMetaElement
      meta.name = 'robots'
      meta.content = 'noindex, nofollow'
      document.head.appendChild(meta)
    }
  }, [])

  // Valider le stock côté serveur quand le panier est chargé
  useEffect(() => {
    const validateCartStock = async () => {
      if (!isLoaded || items.length === 0) return

      try {
        const supabase = createClient()
        
        // Vérifier le stock de chaque produit dans le panier
        for (const item of items) {
          const { data: produit, error } = await supabase
            .from('produits')
            .select('id, nom, stock, has_colors, couleurs')
            .eq('id', item.id)
            .single()

          if (error || !produit) {
            // Produit introuvable - le retirer du panier
            toast.error(`Le produit "${item.nom}" n'est plus disponible`)
            continue
          }

          // Vérifier le stock selon le type de produit
          let stockDisponible: number = 0
          
          if (produit.has_colors && item.couleur) {
            // Produit avec couleurs - vérifier le stock de la couleur spécifique
            if (!produit.couleurs || !Array.isArray(produit.couleurs)) {
              toast.error(`Couleur "${item.couleur}" non disponible pour "${item.nom}"`)
              continue
            }
            
            const couleurSelected = produit.couleurs.find((c: any) => c.nom === item.couleur)
            if (!couleurSelected) {
              toast.error(`Couleur "${item.couleur}" non disponible pour "${item.nom}"`)
              continue
            }
            
            stockDisponible = couleurSelected.stock || 0
          } else if (!produit.has_colors) {
            // Produit sans couleurs - vérifier le stock global
            stockDisponible = produit.stock || 0
          } else {
            toast.error(`Couleur requise pour "${item.nom}"`)
            continue
          }

          if (stockDisponible <= 0) {
            toast.error(`Le produit "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''} est en rupture de stock`)
            continue
          }

          if (stockDisponible < item.quantite) {
            toast.error(`Stock insuffisant pour "${item.nom}"${item.couleur ? ` (${item.couleur})` : ''}. Stock disponible: ${stockDisponible}`)
            continue
          }
        }
      } catch (error) {
        console.error('Erreur lors de la validation du stock:', error)
      }
    }

    validateCartStock()
  }, [isLoaded, items])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

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
        adresse: formData.adresse,
        ville: formData.ville,
        produits,
      }

      // Appeler l'Edge Function pour créer la commande
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ajouterCommande`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
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
        } else if (result.details && Array.isArray(result.details)) {
          // Si c'est une erreur de validation, afficher un message générique
          errorMessage = 'Veuillez vérifier les informations de votre commande.'
        }
        
        throw new Error(errorMessage)
      }

      const data = result

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
    return (
      <div className="min-h-screen pb-24">
        <NavigationDesktop />
        <EnteteMobile />
        <div className="container px-6 py-8 mx-auto">
          <div className="text-center py-12">Chargement...</div>
        </div>
        <MenuBasNavigation />
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

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
            <Card className="p-6 order-1 md:order-2">
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
                  <Select
                    value={formData.ville}
                    onValueChange={(value) => setFormData({ ...formData, ville: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {villesMaroc.map((ville) => (
                        <SelectItem key={ville} value={ville}>
                          {ville}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

