'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StickyHeader from '@/components/pwa/StickyHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Heart, ShoppingBag, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'

export default function PWAFavorisPage() {
  const router = useRouter()
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState<Record<string, number>>({})

  useEffect(() => {
    window.scrollTo(0, 0)
    const initialQuantites: Record<string, number> = {}
    items.forEach(item => {
      initialQuantites[item.id] = 1
    })
    setQuantite(initialQuantites)
  }, [items])

  const getTaillesDisponibles = (item: typeof items[0]) => {
    if (!item.taille || !item.taille.trim()) return []
    return item.taille.split(',').map(t => t.trim()).filter(t => t)
  }

  const handleAddToCart = async (item: typeof items[0]) => {
    if (addingToCart) return
    
    if (item.stock === undefined || item.stock === null) {
      toast.error('Stock non disponible pour ce produit')
      return
    }
    
    if (item.stock <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }

    const taillesDisponibles = getTaillesDisponibles(item)
    
    if (taillesDisponibles.length > 0) {
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
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
      setAddingToCart(null)
    } finally {
      setAddingToCart(null)
    }
  }

  const handleConfirmAddToCart = async (item: typeof items[0]) => {
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

      setShowModal(null)
      setSelectedTaille('')
      setQuantite(prev => ({ ...prev, [item.id]: 1 }))
      toast.success('Produit ajouté au panier', { duration: 1400 })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    } finally {
      setAddingToCart(null)
    }
  }

  const isInCart = (itemId: string) => {
    return cartItems.some(item => item.id === itemId)
  }

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen pb-20">
        <StickyHeader />
        <div className="px-4 py-8 text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen pb-20">
      <StickyHeader />
      
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif flex items-center gap-2">
            <Heart className="w-6 h-6 text-dore fill-current" />
            Mes Favoris
          </h1>
          {items.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {items.length} produit{items.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center mt-8">
            <div className="mb-4">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-xl font-serif mb-2">Votre liste de favoris est vide</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ajoutez des produits à vos favoris pour les retrouver facilement
            </p>
            <Button asChild size="sm">
              <Link href="/pwa/boutique">Découvrir la collection</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const taillesDisponibles = getTaillesDisponibles(item)
              const inCart = isInCart(item.id)
              const isOutOfStock = item.stock === undefined || item.stock === null || item.stock <= 0
              
              return (
                <Card key={item.id} className={`p-3 group hover:shadow-md transition-shadow relative flex flex-col ${isOutOfStock ? 'opacity-75' : ''}`}>
                  {isOutOfStock && (
                    <div className="absolute top-1 left-1 z-20 bg-red-600/95 backdrop-blur-sm rounded px-2 py-0.5">
                      <span className="text-white text-[9px] font-semibold uppercase">Rupture</span>
                    </div>
                  )}
                  
                  <Link
                    href={`/pwa/produit/${item.id}`}
                    className="block mb-2 flex-1"
                  >
                    <div className={`relative aspect-square overflow-hidden rounded-lg mb-2 bg-muted ${isOutOfStock ? 'grayscale' : ''}`}>
                      <Image
                        src={item.image_url || item.image || '/placeholder.jpg'}
                        alt={item.nom}
                        fill
                        className={`object-cover transition-transform duration-300 ${isOutOfStock ? '' : 'group-hover:scale-105'}`}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <h3 className={`font-medium text-sm mb-1 line-clamp-2 leading-tight ${isOutOfStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {item.nom}
                    </h3>
                    <p className={`text-base font-serif font-semibold ${isOutOfStock ? 'text-muted-foreground' : 'text-dore'}`}>
                      {item.prix.toLocaleString('fr-MA')} MAD
                    </p>
                  </Link>
                  
                  <div className="flex flex-col gap-1.5 mt-auto">
                    {inCart ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push('/pwa/panier')}
                        className="w-full border-dore text-dore hover:bg-dore hover:text-charbon text-xs h-8"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Panier
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id || isOutOfStock}
                        className="w-full bg-dore text-charbon hover:bg-dore/90 disabled:opacity-50 text-xs h-8"
                      >
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        {addingToCart === item.id ? 'Ajout...' : 'Ajouter'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        removeItem(item.id)
                        toast.success('Produit retiré des favoris')
                      }}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Retirer
                    </Button>
                  </div>

                  <Dialog open={showModal === item.id} onOpenChange={(open) => {
                    if (!open) {
                      setShowModal(null)
                      setSelectedTaille('')
                      setQuantite(prev => ({ ...prev, [item.id]: 1 }))
                    }
                  }}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg">{item.nom}</DialogTitle>
                        <DialogDescription>
                          Sélectionnez une taille et la quantité
                        </DialogDescription>
                      </DialogHeader>
                      
                      {taillesDisponibles.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Taille</label>
                            <div className="grid grid-cols-4 gap-2">
                              {taillesDisponibles.map((taille) => (
                                <Button
                                  key={taille}
                                  variant={selectedTaille === taille ? 'default' : 'outline'}
                                  onClick={() => setSelectedTaille(taille)}
                                  size="sm"
                                  className={selectedTaille === taille ? 'bg-dore text-charbon hover:bg-dore/90' : ''}
                                >
                                  {taille}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {item.stock !== undefined && item.stock <= 0 && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                          <p className="font-medium">Ce produit est en rupture de stock</p>
                        </div>
                      )}

                      <div className="space-y-3">
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
                              className="h-9 w-9"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantite[item.id] || 1}</span>
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
                              className="h-9 w-9"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowModal(null)
                            setSelectedTaille('')
                            setQuantite(prev => ({ ...prev, [item.id]: 1 }))
                          }}
                          size="sm"
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
                          size="sm"
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
      </div>
    </div>
  )
}

