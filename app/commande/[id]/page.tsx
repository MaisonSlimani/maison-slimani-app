'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Package, Truck, CreditCard, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CommandePage() {
  const params = useParams()
  const router = useRouter()
  const [commande, setCommande] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerCommande()
  }, [])

  const chargerCommande = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setCommande(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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

  if (!commande) {
    return (
      <div className="min-h-screen pb-24">
        <NavigationDesktop />
        <EnteteMobile />
        <div className="container px-6 py-8 mx-auto">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-serif mb-4">Commande introuvable</h2>
            <Button asChild>
              <Link href="/boutique">Retour à la boutique</Link>
            </Button>
          </Card>
        </div>
        <MenuBasNavigation />
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0 pt-0 md:pt-20 min-h-screen bg-gradient-to-b from-ecru to-background">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Confirmation - Message de remerciement élégant */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative overflow-hidden"
          >
            <Card className="p-16 md:p-20 text-center bg-gradient-to-br from-ecru via-green-50/30 to-ecru border-2 border-dore/20 shadow-2xl relative">
              {/* Décoration de fond élégante */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 border-2 border-dore rounded-full" />
                <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-dore rounded-full" />
              </div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                  className="mb-8"
                >
                  <div className="relative inline-block">
                    <CheckCircle className="w-24 h-24 md:w-28 md:h-28 mx-auto text-green-600 drop-shadow-lg" />
                    <div className="absolute inset-0 animate-ping">
                      <CheckCircle className="w-24 h-24 md:w-28 md:h-28 mx-auto text-green-400 opacity-30" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-6 text-charbon leading-tight">
                    Merci pour votre
                    <span className="block text-dore mt-2">confiance</span>
                  </h1>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                  Votre commande a été confirmée avec succès. Nous sommes ravis de vous compter parmi nos clients et nous vous remercions de nous faire confiance pour votre élégance.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-dore/10 to-dore/5 border border-dore/30 rounded-full backdrop-blur-sm mb-6"
                >
                  <Package className="w-5 h-5 text-dore" />
                  <p className="text-sm font-medium text-charbon">
                    Commande n° <span className="font-mono font-bold text-dore">{commande.id.substring(0, 8).toUpperCase()}</span>
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-2"
                >
                  <p className="text-sm text-muted-foreground">
                    ✉️ Un email de confirmation a été envoyé avec tous les détails de votre commande.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    📞 Nous vous contacterons sous peu pour finaliser les détails de livraison.
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Informations importantes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <Card className="p-4 text-center bg-card border-border">
              <Truck className="w-8 h-8 mx-auto mb-2 text-dore" />
              <p className="text-sm font-medium mb-1">Livraison gratuite</p>
              <p className="text-xs text-muted-foreground">Partout au Maroc</p>
            </Card>
            <Card className="p-4 text-center bg-card border-border">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-dore" />
              <p className="text-sm font-medium mb-1">Paiement à la livraison</p>
              <p className="text-xs text-muted-foreground">Espèces ou carte</p>
            </Card>
            <Card className="p-4 text-center bg-card border-border">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-dore" />
              <p className="text-sm font-medium mb-1">Retours 7 jours</p>
              <p className="text-xs text-muted-foreground">Satisfait ou remboursé</p>
            </Card>
          </motion.div>

          {/* Détails de la commande */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h2 className="text-2xl font-serif mb-6">Détails de votre commande</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Informations de livraison</p>
                  <div className="space-y-1">
                    <p className="font-medium">{commande.nom_client}</p>
                    <p className="text-sm text-muted-foreground">{commande.adresse}</p>
                    <p className="text-sm text-muted-foreground">{commande.ville}</p>
                    <p className="text-sm text-muted-foreground mt-2">📞 {commande.telephone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Informations de commande</p>
                  <div className="space-y-1">
                    <p className="font-medium">Statut : <span className="text-dore">{commande.statut}</span></p>
                    <p className="text-sm text-muted-foreground">
                      Date : {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h3 className="font-medium mb-4 text-lg">Produits commandés</h3>
                <div className="space-y-4">
                  {(commande.produits || []).map((produit: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex gap-4 items-center p-3 bg-muted/30 rounded-lg"
                    >
                      {produit.image_url && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <Image
                            src={produit.image_url}
                            alt={produit.nom}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{produit.nom}</p>
                        {produit.taille && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Taille : {produit.taille}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantité : {produit.quantite} × {produit.prix.toLocaleString('fr-MA')} DH
                        </p>
                      </div>
                      <p className="font-medium text-dore text-lg">
                        {(produit.prix * produit.quantite).toLocaleString('fr-MA')} DH
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-serif">Total</span>
                  <span className="text-2xl font-serif text-dore">
                    {commande.total.toLocaleString('fr-MA')} DH
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild variant="outline" className="flex-1 text-lg py-6">
              <Link href="/boutique">Continuer mes achats</Link>
            </Button>
            <Button asChild className="flex-1 text-lg py-6 bg-dore text-charbon hover:bg-dore/90">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

