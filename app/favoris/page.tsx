'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

export default function FavorisPage() {
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleAddToCart = async (item: typeof items[0]) => {
    if (addingToCart) return
    
    setAddingToCart(item.id)
    
    try {
      // Si le produit a une taille, rediriger vers la page produit
      if (item.taille && item.taille.trim()) {
        toast.info('Veuillez sélectionner une taille sur la page du produit')
        window.location.href = `/produit/${item.id}`
        return
      }

      addToCart({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: 1,
        image_url: item.image_url,
        image: item.image,
        taille: item.taille,
      })

      toast.success('Produit ajouté au panier')
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      toast.error('Erreur lors de l\'ajout au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  if (!isLoaded) {
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

      <div className="container px-6 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif mb-8 flex items-center gap-3">
              <Heart className="w-8 h-8 text-dore fill-current" />
              Mes Favoris
            </h1>
            {items.length > 0 && (
              <p className="text-muted-foreground">
                {items.length} produit{items.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mb-6">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif mb-4">Votre liste de favoris est vide</h2>
              <p className="text-muted-foreground mb-8">
                Ajoutez des produits à vos favoris pour les retrouver facilement
              </p>
              <Button asChild size="lg">
                <Link href="/boutique">Découvrir la collection</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="p-6 group hover:shadow-lg transition-shadow">
                  <Link href={`/produit/${item.id}`} className="block mb-4">
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-4 bg-muted">
                      <Image
                        src={item.image_url || item.image || '/placeholder.jpg'}
                        alt={item.nom}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h3 className="font-medium mb-2 hover:text-dore transition-colors">
                      {item.nom}
                    </h3>
                    <p className="text-xl font-serif text-dore mb-4">
                      {item.prix.toLocaleString('fr-MA')} DH
                    </p>
                  </Link>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart === item.id}
                      className="flex-1 bg-dore text-charbon hover:bg-dore/90"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {addingToCart === item.id ? 'Ajout...' : 'Ajouter au panier'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeItem(item.id)
                        toast.success('Produit retiré des favoris')
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-8 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/boutique">
                  Continuer mes achats
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

