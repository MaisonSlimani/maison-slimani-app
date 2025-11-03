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
import { CheckCircle } from 'lucide-react'
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
    <div className="min-h-screen pb-24 pt-0 md:pt-20">
      <NavigationDesktop />
      <EnteteMobile />

      <div className="container px-6 py-8 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Confirmation */}
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-3xl font-serif mb-4">Commande confirmée !</h1>
            <p className="text-muted-foreground mb-4">
              Merci pour votre commande. Nous vous avons envoyé un email de confirmation.
            </p>
            <p className="text-sm text-muted-foreground">
              Numéro de commande : <span className="font-mono">{commande.id.substring(0, 8)}</span>
            </p>
          </Card>

          {/* Détails de la commande */}
          <Card className="p-6">
            <h2 className="text-2xl font-serif mb-6">Détails de la commande</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-medium">{commande.statut}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Livraison à</p>
                <p className="font-medium">
                  {commande.nom_client}
                  <br />
                  {commande.adresse}
                  <br />
                  {commande.ville}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{commande.telephone}</p>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-medium mb-4">Produits commandés</h3>
              <div className="space-y-4">
                {(commande.produits || []).map((produit: any, index: number) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <p className="font-medium">{produit.nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité : {produit.quantite}
                      </p>
                    </div>
                    <p className="font-medium">
                      {(produit.prix * produit.quantite).toLocaleString('fr-MA')} DH
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-serif">Total</span>
                <span className="text-xl font-serif text-primary">
                  {commande.total.toLocaleString('fr-MA')} DH
                </span>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/boutique">Continuer mes achats</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

