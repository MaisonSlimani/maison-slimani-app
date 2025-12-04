'use client'

import { useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ShoppingBag, Heart, Check, Sparkles } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { trackAddToWishlist } from '@/lib/meta-pixel'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { hapticFeedback } from '@/lib/haptics'
import { slugify } from '@/lib/utils/product-urls'

interface ProductCardProps {
  produit: {
    id: string
    nom: string
    slug?: string
    categorie?: string
    prix: number
    image_url?: string
    images?: any[]
    stock?: number
    taille?: string
    has_colors?: boolean
    couleurs?: any[]
    vedette?: boolean
    created_at?: string
  }
  priority?: boolean
}

export default function ProductCard({ produit, priority = false }: ProductCardProps) {
  const getFirstImage = () => {
    if (produit.images && produit.images.length > 0) {
      const firstImg = produit.images[0]
      return typeof firstImg === 'string' ? firstImg : firstImg.url
    }
    return produit.image_url || '/assets/placeholder.jpg'
  }

  const imageUrl = getFirstImage()
  const productSlug = produit.slug || slugify(produit.nom || '')
  const categorySlug = produit.categorie ? slugify(produit.categorie) : null
  const href = categorySlug
    ? `/pwa/boutique/${categorySlug}/${productSlug}`
    : `/pwa/produit/${produit.id}` // Fallback to ID route if no category

  const { addItem, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedCouleur, setSelectedCouleur] = useState<string>('')
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState(1)
  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)

  // Parse available sizes
  const taillesDisponibles = produit.taille && produit.taille.trim()
    ? produit.taille.split(',').map(t => t.trim()).filter(t => t)
    : []

  // Check if product is new (created within last 30 days)
  const isNew = produit.created_at && 
    new Date().getTime() - new Date(produit.created_at).getTime() < 30 * 24 * 60 * 60 * 1000

  const isOutOfStock = () => {
    // For products with colors, check if any color has stock
    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
      return !produit.couleurs.some(c => (c.stock || 0) > 0)
    }
    // For products without colors, check main stock field
    // Only consider out of stock if stock is explicitly 0 or less
    // If stock is undefined, assume it's available (for backward compatibility)
    if (produit.stock !== undefined) {
      return produit.stock <= 0
    }
    // If stock is undefined and no colors, assume available
    return false
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAddingToCart || isOutOfStock()) return

    // If product has colors or sizes, open modal
    if ((produit.has_colors && produit.couleurs && produit.couleurs.length > 0) || taillesDisponibles.length > 0) {
      hapticFeedback('medium')
      // Reset selections when opening modal
      if (produit.has_colors && produit.couleurs && produit.couleurs.length > 0) {
        const firstAvailable = produit.couleurs.find(c => (c.stock || 0) > 0)
        setSelectedCouleur(firstAvailable?.nom || '')
      } else {
        setSelectedCouleur('')
      }
      setSelectedTaille('')
      setQuantite(1)
      setShowModal(true)
      return
    }

    hapticFeedback('medium')
    setIsAddingToCart(true)
    try {
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: 1,
        image_url: imageUrl,
        image: imageUrl,
        stock: produit.stock,
      })
      setAddedToCart(true)
      hapticFeedback('success')
      toast.success('Ajouté au panier', { duration: 1000 })
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      hapticFeedback('error')
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleConfirmAddToCart = async () => {
    // Validate color selection
    if (produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && !selectedCouleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }

    // Get available sizes based on selected color
    let availableSizes: string[] = []
    if (produit.has_colors && selectedCouleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
      if (couleurSelected?.taille) {
        availableSizes = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
      } else if (produit.taille) {
        availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
      }
    } else if (produit.taille) {
      availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
    }

    if (availableSizes.length > 0 && !selectedTaille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    // Check stock
    let stockDisponible = produit.stock || 0
    if (produit.has_colors && selectedCouleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
      stockDisponible = couleurSelected?.stock || 0
    }

    if (stockDisponible < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    hapticFeedback('medium')
    setIsAddingToCart(true)

    try {
      const productSlug = produit.slug || slugify(produit.nom || '')
      const categorySlug = produit.categorie ? slugify(produit.categorie) : null
      await addItem({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: imageUrl,
        image: imageUrl,
        taille: selectedTaille || undefined,
        couleur: selectedCouleur || undefined,
        stock: stockDisponible,
        categorie: produit.categorie,
        slug: productSlug,
        categorySlug: categorySlug || undefined,
      })

      // Close modal and show success
      setShowModal(false)
      setSelectedTaille('')
      setSelectedCouleur('')
      setQuantite(1)
      setAddedToCart(true)
      hapticFeedback('success')
      toast.success('Ajouté au panier', { duration: 1000 })
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      hapticFeedback('error')
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isTogglingWishlist) return

    hapticFeedback('light')
    setIsTogglingWishlist(true)
    try {
      if (inWishlist) {
        removeFromWishlist(produit.id)
        toast.success('Retiré des favoris', { duration: 1000 })
      } else {
        // Calculate stock for wishlist item
        // For products with colors, use total stock from all colors
        // For products without colors, use main stock field
        let stockForWishlist = produit.stock
        if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
          stockForWishlist = produit.couleurs.reduce((sum, c) => sum + (c.stock || 0), 0)
        }
        
        addToWishlist({
          id: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          image_url: imageUrl,
          image: imageUrl,
          stock: stockForWishlist,
          categorie: produit.categorie,
          slug: productSlug,
          categorySlug: categorySlug || undefined,
        })
        // Track AddToWishlist event for Meta Pixel
        trackAddToWishlist({
          content_name: produit.nom,
          content_ids: [produit.id],
          content_type: 'product',
          value: produit.prix,
          currency: 'MAD',
        })
        // Open wishlist drawer after state has time to update
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('openWishlistDrawer'))
          }, 150)
        }
        hapticFeedback('success')
        toast.success('Ajouté aux favoris', { duration: 1000 })
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la wishlist:', error)
      hapticFeedback('error')
      toast.error('Erreur lors de la modification')
    } finally {
      setTimeout(() => setIsTogglingWishlist(false), 300)
    }
  }

  return (
    <Card className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col h-full bg-card">
      <Link href={href} className="block flex-1 flex flex-col">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <OptimizedImage
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
            sizes="(max-width: 768px) 50vw, 33vw"
            objectFit="cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
            {isNew && (
              <div className="bg-dore/95 backdrop-blur-sm rounded-md px-2 py-1 border border-dore/50">
                <span className="text-charbon text-[10px] font-bold uppercase tracking-wide">Nouveau</span>
              </div>
            )}
          </div>

          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-1.5 border border-dore/50">
              <Heart className="w-3 h-3 text-charbon fill-current" />
            </div>
          )}
          {isOutOfStock() && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-2 py-1 border border-red-700/50">
              <span className="text-white text-[10px] font-semibold uppercase">Rupture</span>
            </div>
          )}

          {/* Gold accent on hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-dore/30 transition-all duration-300 rounded-t-lg" />
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-serif font-medium text-sm mb-1 line-clamp-2 leading-tight text-foreground">
            {produit.nom}
          </h3>
          <p className="text-base font-serif text-dore font-semibold">
            {produit.prix.toLocaleString('fr-MA')} MAD
          </p>
        </div>
      </Link>

      <div className="px-3 pb-3 flex gap-2">
        {isInCart ? (
          <Button
            size="sm"
            variant="outline"
            asChild
            className="flex-1 border-dore text-dore hover:bg-dore hover:text-charbon text-xs h-9"
          >
            <Link href="/pwa/panier" className="flex items-center justify-center">
              <Check className="w-3 h-3 mr-1" />
              Panier
            </Link>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock()}
            className={cn(
              "flex-1 text-xs h-9",
              addedToCart
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-dore text-charbon hover:bg-dore/90"
            )}
          >
            {addedToCart ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center"
              >
                <Check className="w-3 h-3 mr-1" />
                OK
              </motion.div>
            ) : (
              <div className="flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 mr-1" />
                {isAddingToCart ? 'Ajout...' : 'Ajouter'}
              </div>
            )}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={cn(
            "px-3 h-9",
            inWishlist && "bg-dore/20 border-dore text-dore",
            isTogglingWishlist && "opacity-50"
          )}
        >
          <Heart className={cn("w-3 h-3", inWishlist && "fill-current")} />
        </Button>
      </div>

      {/* Modal pour sélectionner couleur, taille et quantité */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{produit.nom}</DialogTitle>
            <DialogDescription>
              {produit.has_colors && produit.couleurs && produit.couleurs.length > 0
                ? 'Sélectionnez la couleur, la taille et la quantité souhaitées'
                : 'Sélectionnez la taille et la quantité souhaitées'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Sélecteur de couleur */}
            {produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Couleur *</label>
                <div className="flex flex-wrap gap-3">
                  {produit.couleurs.map((c: any) => {
                    const isSelected = selectedCouleur === c.nom
                    const stockCouleur = c.stock || 0
                    const isOutOfStock = stockCouleur === 0
                    const colorCode = c.code || '#000000'
                    
                    return (
                      <button
                        key={c.nom}
                        type="button"
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedCouleur(c.nom)
                            setSelectedTaille('') // Reset size when color changes
                            if (quantite > stockCouleur) {
                              setQuantite(stockCouleur)
                            }
                          }
                        }}
                        disabled={isOutOfStock}
                        className={cn(
                          'relative flex flex-col items-center gap-2 transition-all',
                          isOutOfStock && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div
                          className={cn(
                            'w-12 h-12 rounded-lg border-2 transition-all shadow-md',
                            isSelected
                              ? 'border-charbon shadow-lg scale-110 ring-2 ring-charbon ring-offset-2'
                              : 'border-gray-300',
                            isOutOfStock && 'border-gray-200 opacity-50'
                          )}
                          style={{
                            backgroundColor: isOutOfStock ? '#e5e5e5' : colorCode,
                          }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white drop-shadow-lg"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          'text-xs font-medium text-center',
                          isSelected ? 'text-charbon font-semibold' : 'text-foreground',
                          isOutOfStock && 'text-muted-foreground'
                        )}>
                          {c.nom}
                        </span>
                        {isOutOfStock && (
                          <span className="text-xs text-red-600">Rupture</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {!selectedCouleur && (
                  <p className="text-xs text-red-600">Veuillez sélectionner une couleur</p>
                )}
              </div>
            )}

            {/* Sélecteur de taille - basé sur la couleur sélectionnée */}
            {(() => {
              // Get available sizes based on selected color
              let availableSizes: string[] = []
              if (produit.has_colors && selectedCouleur && produit.couleurs) {
                const couleurSelected = produit.couleurs.find((c: any) => c.nom === selectedCouleur)
                if (couleurSelected?.taille) {
                  availableSizes = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                } else if (produit.taille) {
                  availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                }
              } else if (produit.taille) {
                availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
              }

              if (availableSizes.length > 0 && (!produit.has_colors || selectedCouleur)) {
                return (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Taille</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((taille) => {
                        const isSelected = selectedTaille === taille
                        return (
                          <button
                            key={taille}
                            type="button"
                            onClick={() => setSelectedTaille(taille)}
                            className={cn(
                              'w-12 h-12 rounded-lg border-2 font-medium transition-all hover:scale-105',
                              isSelected
                                ? 'bg-dore text-charbon border-dore shadow-lg scale-105'
                                : 'bg-background text-foreground border-border hover:border-dore'
                            )}
                          >
                            {taille}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Sélecteur de quantité */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quantité</label>
              <div className="flex items-center gap-2 border border-border rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    const maxQty = produit.has_colors && selectedCouleur && produit.couleurs
                      ? (produit.couleurs.find((c: any) => c.nom === selectedCouleur)?.stock || 0)
                      : (produit.stock || 999)
                    setQuantite(Math.max(1, quantite - 1))
                  }}
                  disabled={quantite <= 1}
                >
                  −
                </Button>
                <span className="w-12 text-center font-medium">{quantite}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => {
                    const maxQty = produit.has_colors && selectedCouleur && produit.couleurs
                      ? (produit.couleurs.find((c: any) => c.nom === selectedCouleur)?.stock || 0)
                      : (produit.stock || 999)
                    setQuantite(Math.min(maxQty, quantite + 1))
                  }}
                  disabled={(() => {
                    const maxQty = produit.has_colors && selectedCouleur && produit.couleurs
                      ? (produit.couleurs.find((c: any) => c.nom === selectedCouleur)?.stock || 0)
                      : (produit.stock || 999)
                    return quantite >= maxQty
                  })()}
                >
                  +
                </Button>
              </div>
              {(() => {
                const stockDisponible = produit.has_colors && selectedCouleur && produit.couleurs
                  ? (produit.couleurs.find((c: any) => c.nom === selectedCouleur)?.stock || 0)
                  : (produit.stock || 0)
                return stockDisponible > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Stock disponible: {stockDisponible}
                  </p>
                )
              })()}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setSelectedTaille('')
                setSelectedCouleur('')
                setQuantite(1)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAddToCart}
              disabled={isAddingToCart || 
                (produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && !selectedCouleur) ||
                (() => {
                  let availableSizes: string[] = []
                  if (produit.has_colors && selectedCouleur && produit.couleurs) {
                    const couleurSelected = produit.couleurs.find((c: any) => c.nom === selectedCouleur)
                    if (couleurSelected?.taille) {
                      availableSizes = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                    } else if (produit.taille) {
                      availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                    }
                  } else if (produit.taille) {
                    availableSizes = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                  }
                  return availableSizes.length > 0 && !selectedTaille
                })()}
              className="bg-dore text-charbon hover:bg-dore/90"
            >
              {isAddingToCart ? 'Ajout...' : 'Ajouter au panier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
