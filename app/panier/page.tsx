'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

export default function PanierPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // SEO: Noindex (user-specific page)
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
          <h1 className="text-3xl font-serif mb-8 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" />
            Mon Panier
          </h1>

          {items.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mb-6">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif mb-4">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-8">
                Découvrez notre collection de chaussures haut de gamme
              </p>
              <Button asChild size="lg">
                <Link href="/boutique">Voir la collection</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {items.map((article) => (
                <Card key={article.id} className="p-6">
                  <div className="flex gap-6">
                    <Link
                      href={`/produits/${(article as any).slug || article.nom
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')}`}
                      className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={article.image_url || article.image || '/placeholder.jpg'}
                        alt={article.nom}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        href={`/produits/${(article as any).slug || article.nom
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/\p{Diacritic}/gu, '')
                          .replace(/[^a-z0-9\s-]/g, '')
                          .trim()
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')}`}
                        className="font-medium mb-2 hover:text-dore transition-colors block"
                      >
                        <h3>{article.nom}</h3>
                      </Link>
                      <div className="text-sm text-muted-foreground mb-2 space-y-1">
                        {article.couleur && (
                          <p>
                            Couleur: <span className="font-medium">{article.couleur}</span>
                          </p>
                        )}
                        {article.taille && (
                          <p>
                            Taille: <span className="font-medium">{article.taille}</span>
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-primary mb-4">
                        {article.prix.toLocaleString('fr-MA')} DH
                      </p>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            try {
                              updateQuantity(article.id, article.quantite - 1)
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
                            }
                          }}
                          className="h-8 w-8"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center">{article.quantite}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            try {
                              updateQuantity(article.id, article.quantite + 1)
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
                            }
                          }}
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(article.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Card className="p-6 bg-muted/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-medium">Total</span>
                  <span className="text-2xl font-serif text-primary">
                    {total.toLocaleString('fr-MA')} DH
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/checkout')}
                >
                  Passer la commande
                </Button>
              </Card>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
      <MenuBasNavigation />
    </div>
  )
}

