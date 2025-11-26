'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import EnteteMobile from '@/components/EnteteMobile'
import NavigationDesktop from '@/components/NavigationDesktop'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, ShoppingBag, Trash2, ArrowRight, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

export default function FavorisPage() {
  const router = useRouter()
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState<Record<string, number>>({})

  useEffect(() => {
    window.scrollTo(0, 0)
    // Initialiser les quantités à 1 pour chaque item
    const initialQuantites: Record<string, number> = {}
    items.forEach(item => {
      initialQuantites[item.id] = 1
    })
    setQuantite(initialQuantites)
  }, [items])

  // Parse les tailles disponibles pour un item
  const getTaillesDisponibles = (item: typeof items[0]) => {
    if (!item.taille || !item.taille.trim()) return []
    return item.taille.split(',').map(t => t.trim()).filter(t => t)
  }

  const handleAddToCart = async (item: typeof items[0]) => {
    if (addingToCart) return
    
    // Vérifier le stock avant tout - check strict
    if (item.stock === undefined || item.stock === null) {
      // Si le stock n'est pas défini, on ne peut pas ajouter (sécurité)
      toast.error('Stock non disponible pour ce produit')
      return
    }
    
    if (item.stock <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }

    const taillesDisponibles = getTaillesDisponibles(item)
    
    // Si le produit a des tailles, ouvrir le modal (seulement si en stock)
    if (taillesDisponibles.length > 0) {
      // Vérifier le stock avant d'ouvrir le modal
      if (item.stock <= 0) {
        toast.error('Produit en rupture de stock')
        return
      }
      setShowModal(item.id)
      setSelectedTaille('')
      setQuantite(prev => ({ ...prev, [item.id]: prev[item.id] || 1 }))
      return
    }

    setAddingToCart(item.id)
    
    try {
      const qty = quantite[item.id] || 1
      
      // Vérifier le stock encore une fois (strict)
      if (item.stock === undefined || item.stock === null || item.stock <= 0) {
        toast.error('Produit en rupture de stock')
        setAddingToCart(null)
        return
      }
      
      if (item.stock < qty) {
        toast.error(`Stock insuffisant. Stock disponible: ${item.stock}`)
        setAddingToCart(null)
        return
      }

      await addToCart({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: qty,
        image_url: item.image_url,
        image: item.image,
        taille: undefined,
        stock: item.stock,
      })

      toast.success('Produit ajouté au panier', { duration: 1400 })
    } catch (error) {
      // Afficher l'erreur de stock si elle existe
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
      setAddingToCart(null)
    } finally {
      setAddingToCart(null)
    }
  }

  const handleConfirmAddToCart = async (item: typeof items[0]) => {
    // Vérifier le stock avant tout - check strict
    if (item.stock === undefined || item.stock === null) {
      toast.error('Stock non disponible pour ce produit')
      return
    }
    
    if (item.stock <= 0) {
      toast.error('Produit en rupture de stock')
      setShowModal(null)
      return
    }

    const taillesDisponibles = getTaillesDisponibles(item)
    
    if (taillesDisponibles.length > 0 && !selectedTaille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    const qty = quantite[item.id] || 1

    // Vérifier le stock encore une fois (strict)
    if (item.stock === undefined || item.stock === null || item.stock <= 0) {
      toast.error('Produit en rupture de stock')
      setShowModal(null)
      return
    }

    if (item.stock < qty) {
      toast.error(`Stock insuffisant. Stock disponible: ${item.stock}`)
      return
    }

    setAddingToCart(item.id)

    try {
      await addToCart({
        id: item.id,
        nom: item.nom,
        prix: item.prix,
        quantite: qty,
        image_url: item.image_url,
        image: item.image,
        taille: selectedTaille || undefined,
        stock: item.stock,
      })

      // Fermer le modal et afficher le succès
      setShowModal(null)
      setSelectedTaille('')
      setQuantite(prev => ({ ...prev, [item.id]: 1 }))
      toast.success('Produit ajouté au panier', { duration: 1400 })
    } catch (error) {
      // Afficher l'erreur de stock si elle existe
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  // Vérifier si un produit est dans le panier
  const isInCart = (itemId: string) => {
    return cartItems.some(item => item.id === itemId)
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {items.map((item) => {
                const taillesDisponibles = getTaillesDisponibles(item)
                const inCart = isInCart(item.id)
                const isOutOfStock = item.stock === undefined || item.stock === null || item.stock <= 0
                
                return (
                  <Card key={item.id} className={`p-4 md:p-6 group hover:shadow-lg transition-shadow relative flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}>
                    {/* Badge rupture de stock */}
                    {isOutOfStock && (
                      <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-3 py-1.5">
                        <span className="text-white text-xs font-semibold uppercase tracking-wide">Rupture de stock</span>
                      </div>
                    )}
                    
                    <Link
                      href={`/produits/${item.nom
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/\p{Diacritic}/gu, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')}`}
                      className="block mb-4"
                    >
                      <div className={`relative aspect-square overflow-hidden rounded-lg mb-4 bg-muted ${isOutOfStock ? 'grayscale' : ''}`}>
                        <Image
                          src={item.image_url || item.image || '/placeholder.jpg'}
                          alt={item.nom}
                          fill
                          className={`object-cover transition-transform duration-300 ${isOutOfStock ? '' : 'group-hover:scale-105'}`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <h3 className={`font-medium mb-2 transition-colors ${isOutOfStock ? 'text-muted-foreground' : 'hover:text-dore'}`}>
                        {item.nom}
                      </h3>
                      <p className={`text-xl font-serif mb-4 ${isOutOfStock ? 'text-muted-foreground' : 'text-dore'}`}>
                        {item.prix.toLocaleString('fr-MA')} DH
                      </p>
                    </Link>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                      {inCart ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push('/panier')}
                          className="flex-1 border-charbon text-charbon hover:bg-charbon hover:text-background text-xs sm:text-sm"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Aller au panier</span>
                          <span className="sm:hidden">Panier</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart === item.id || isOutOfStock}
                          className="flex-1 bg-dore text-charbon hover:bg-dore/90 disabled:opacity-50 text-xs sm:text-sm"
                        >
                          <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{addingToCart === item.id ? 'Ajout...' : 'Ajouter au panier'}</span>
                          <span className="sm:hidden">{addingToCart === item.id ? 'Ajout...' : 'Ajouter'}</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          removeItem(item.id)
                          toast.success('Produit retiré des favoris')
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 w-auto sm:w-auto"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="sr-only">Retirer</span>
                      </Button>
                    </div>

                    {/* Modal pour sélectionner la taille */}
                    <Dialog open={showModal === item.id} onOpenChange={(open) => {
                      if (!open) {
                        setShowModal(null)
                        setSelectedTaille('')
                        setQuantite(prev => ({ ...prev, [item.id]: 1 }))
                      }
                    }}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{item.nom}</DialogTitle>
                          <DialogDescription>
                            Sélectionnez une taille et la quantité
                          </DialogDescription>
                        </DialogHeader>
                        
                        {taillesDisponibles.length > 0 && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Taille</label>
                              <div className="grid grid-cols-3 gap-2">
                                {taillesDisponibles.map((taille) => (
                                  <Button
                                    key={taille}
                                    variant={selectedTaille === taille ? 'default' : 'outline'}
                                    onClick={() => setSelectedTaille(taille)}
                                    className={selectedTaille === taille ? 'bg-dore text-charbon hover:bg-dore/90' : ''}
                                  >
                                    {taille}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Afficher un avertissement si le produit est en rupture de stock */}
                        {item.stock !== undefined && item.stock <= 0 && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            <p className="text-sm font-medium">Ce produit est en rupture de stock</p>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Quantité</label>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const currentQty = quantite[item.id] || 1
                                  if (currentQty > 1) {
                                    setQuantite(prev => ({ ...prev, [item.id]: currentQty - 1 }))
                                  }
                                }}
                                className="h-8 w-8"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center">{quantite[item.id] || 1}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const currentQty = quantite[item.id] || 1
                                  const maxQty = item.stock !== undefined ? item.stock : 999
                                  if (currentQty < maxQty) {
                                    setQuantite(prev => ({ ...prev, [item.id]: currentQty + 1 }))
                                  } else {
                                    toast.error(`Stock disponible: ${maxQty}`)
                                  }
                                }}
                                className="h-8 w-8"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowModal(null)
                              setSelectedTaille('')
                              setQuantite(prev => ({ ...prev, [item.id]: 1 }))
                            }}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={() => handleConfirmAddToCart(item)}
                            disabled={
                              addingToCart === item.id || 
                              (taillesDisponibles.length > 0 && !selectedTaille) ||
                              (item.stock !== undefined && item.stock <= 0)
                            }
                            className="bg-dore text-charbon hover:bg-dore/90 disabled:opacity-50"
                          >
                            {addingToCart === item.id ? 'Ajout...' : 'Ajouter au panier'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </Card>
                )
              })}
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

