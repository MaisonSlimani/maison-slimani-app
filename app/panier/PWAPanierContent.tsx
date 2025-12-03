'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingBag, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { toast } from 'sonner'

export default function PWAPanierContent() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()
  const { openDrawer } = useCartDrawer()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen pb-20 px-4 py-8">
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen pb-20">
      {/* Header with Centered Title and Icon */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="h-14 px-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            <h1 className="text-xl font-serif text-foreground">Mon Panier</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-xl font-serif mb-3">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Découvrez notre collection
            </p>
            <Button asChild size="lg" className="bg-dore text-charbon hover:bg-dore/90">
              <Link href="/boutique">Voir la collection</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            {items.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="flex gap-4">
                  <Link
                    href={`/boutique/${article.categorySlug || article.categorie || 'tous'}/${article.slug || article.id}`}
                    className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={article.image_url || article.image || '/placeholder.jpg'}
                      alt={article.nom}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/boutique/${article.categorySlug || article.categorie || 'tous'}/${article.slug || article.id}`}
                      className="font-medium text-sm mb-1 block line-clamp-2"
                    >
                      {article.nom}
                    </Link>
                    <div className="text-xs text-muted-foreground mb-2 space-y-0.5">
                      {article.couleur && (
                        <p>Couleur: <span className="font-medium">{article.couleur}</span></p>
                      )}
                      {article.taille && (
                        <p>Taille: <span className="font-medium">{article.taille}</span></p>
                      )}
                    </div>
                    <p className="font-serif text-dore font-semibold text-sm mb-3">
                      {article.prix.toLocaleString('fr-MA')} MAD
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          try {
                            updateQuantity(article.id, article.quantite - 1)
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : 'Erreur')
                          }
                        }}
                        className="h-8 w-8"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{article.quantite}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          try {
                            updateQuantity(article.id, article.quantite + 1)
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : 'Erreur')
                          }
                        }}
                        className="h-8 w-8"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(article.id)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <Card className="p-4 bg-muted/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-serif text-dore font-semibold">
                  {total.toLocaleString('fr-MA')} MAD
                </span>
              </div>
              <Button
                size="lg"
                className="w-full bg-dore text-charbon hover:bg-dore/90"
                onClick={() => router.push('/checkout')}
              >
                Passer la commande
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
