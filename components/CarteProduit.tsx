'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import OptimizedImage from '@/components/OptimizedImage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Check, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { trackAddToWishlist } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import RatingDisplay from '@/components/RatingDisplay'
import { Product, Taille } from '@/types'

interface CarteProduitProps {
  produit: Product
  showActions?: boolean // Nouvelle prop pour afficher les boutons d'action
}

const CarteProduit = ({ produit, showActions = false }: CarteProduitProps) => {
  const router = useRouter()
  // Get all color images (first image from each color)
  const getColorImages = () => {
    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 1) {
      return produit.couleurs
        .filter(c => {
          // Check if color has images (array or single image)
          if (c.images) {
            if (Array.isArray(c.images)) {
              return c.images.length > 0
            }
            // Single image string
            return typeof c.images === 'string' && c.images.length > 0
          }
          return false
        })
        .map(c => {
          // Extract first image from array or use single image
          let imageUrl = ''
          if (Array.isArray(c.images)) {
            imageUrl = c.images[0]
          } else if (typeof c.images === 'string') {
            imageUrl = c.images
          }
          return {
            couleur: c.nom,
            image: imageUrl,
          }
        })
    }
    return []
  }

  const colorImages = getColorImages()
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const hasMultipleColors = colorImages.length > 1

  // Get current image based on color navigation
  const getCurrentImage = () => {
    // If product has multiple colors and we're navigating, use color image
    if (hasMultipleColors && colorImages[currentColorIndex]) {
      return colorImages[currentColorIndex].image
    }
    // Otherwise, use first image from images array or image_url
    if (produit.images && produit.images.length > 0) {
      const firstImg = produit.images[0]
      return typeof firstImg === 'string' ? firstImg : firstImg.url
    }
    return produit.image_url || produit.image
  }

  const imageUrl = getCurrentImage() || ''

  // Navigate to previous color
  const handlePreviousColor = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasMultipleColors) {
      setCurrentColorIndex((prev) => (prev === 0 ? colorImages.length - 1 : prev - 1))
    }
  }

  // Navigate to next color
  const handleNextColor = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasMultipleColors) {
      setCurrentColorIndex((prev) => (prev === colorImages.length - 1 ? 0 : prev + 1))
    }
  }
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

  // Generate hierarchical URL: /boutique/[categorie]/[slug]
  const productSlug = produit.slug || slugify(produit.nom)
  let categorySlug: string | null = null
  if (produit.categorySlug) {
    categorySlug = produit.categorySlug
  } else if (produit.categorie && produit.categorie.trim()) {
    const slugified = slugify(produit.categorie.trim())
    categorySlug = slugified && slugified.length > 0 ? slugified : null
  }
  const href = categorySlug && categorySlug.length > 0
    ? `/boutique/${categorySlug}/${productSlug}`
    : `/boutique/${productSlug}` // Fallback to boutique root if no category
  const { addItem: addToCart, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [selectedCouleur, setSelectedCouleur] = useState<string>('')
  const [quantite, setQuantite] = useState(1)
  const inWishlist = isInWishlist(produit.id)

  // Vérifier si le produit est dans le panier
  const isInCart = items.some(item => item.id === produit.id)

  // Réinitialiser addedToCart si le produit est déjà dans le panier
  useEffect(() => {
    if (isInCart && addedToCart) {
      setAddedToCart(false)
    }
  }, [isInCart, addedToCart, items])

  // Realtime subscription for stock updates
  useEffect(() => {
    if (!produit?.id) return

    const supabase = createClient()
    const channel = supabase
      .channel(`carte-produit-stock-${produit.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'produits', filter: `id=eq.${produit.id}` },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [produit?.id, router])

  // Parse les tailles disponibles (check new tailles array first, then fallback to old taille string)
  const taillesDisponibles: string[] = (() => {
    // Check new tailles array structure (array of objects with nom and stock)
    if (produit.tailles && Array.isArray(produit.tailles) && produit.tailles.length > 0) {
      // Filter out empty names and return array of size names
      const result: string[] = []
      for (const t of produit.tailles) {
        if (typeof t === 'string') {
          const trimmed = (t as string).trim()
          if (trimmed) result.push(trimmed)
        } else if (t && typeof t === 'object' && 'nom' in t) {
          const nomValue = (t as Taille).nom
          if (nomValue) {
            const nom = String(nomValue).trim()
            if (nom) result.push(nom)
          }
        }
      }
      return result
    }
    // Fallback to old taille string
    if (produit.taille && typeof produit.taille === 'string' && produit.taille.trim()) {
      const tailleParts = produit.taille.split(',')
      return tailleParts.map((t: string) => t.trim()).filter((t: string) => t !== '')
    }
    return []
  })()

  // Helper function to check if product is out of stock
  const isOutOfStock = () => {
    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
      // For products with colors, check if ANY color has stock > 0
      return !produit.couleurs.some(c => (c.stock || 0) > 0)
    } else {
      // For products without colors, check the global stock
      // Only consider out of stock if stock is explicitly 0 or less
      // If stock is undefined, assume it's available (for backward compatibility)
      if (produit.stock !== undefined) {
        return produit.stock <= 0
      }
      // If stock is undefined and no colors, assume available
      return false
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAddingToCart) return

    // Si le produit a des couleurs ou des tailles, ouvrir le modal
    if ((produit.has_colors && produit.couleurs && produit.couleurs.length > 0) || taillesDisponibles.length > 0) {
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

    // Vérifier le stock
    if (isOutOfStock()) {
      toast.error('Produit en rupture de stock')
      return
    }

    // Ajouter directement au panier
    setIsAddingToCart(true)
    try {
      await addToCart({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: 1,
        image_url: imageUrl,
        image: imageUrl,
        stock: produit.stock,
      })
      // Afficher le succès
      toast.success('Produit ajouté au panier', { duration: 1400 })
    } catch (error) {
      // Afficher l'erreur de stock si elle existe
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    } finally {
      setIsAddingToCart(false)
    }

    // Ne pas afficher "Ajouté!" si le produit est déjà dans le panier
    // Le bouton changera immédiatement en "Go to cart" car isInCart sera true
    // après que le panier soit mis à jour (via useCart re-render)
  }

  const handleConfirmAddToCart = async () => {
    // Validate color selection
    if (produit.has_colors && produit.couleurs && produit.couleurs.length > 0 && !selectedCouleur) {
      toast.error('Veuillez sélectionner une couleur')
      return
    }

    // Get tailles and check stock per size
    let taillesData: Taille[] = []
    if (produit.has_colors && selectedCouleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
      if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
        taillesData = couleurSelected.tailles
      } else if (couleurSelected?.taille) {
        const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      } else if (produit.tailles && Array.isArray(produit.tailles)) {
        taillesData = produit.tailles
      } else if (produit.taille) {
        const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
        const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
        taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
      }
    } else if (produit.tailles && Array.isArray(produit.tailles)) {
      taillesData = produit.tailles
    } else if (produit.taille) {
      const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
      const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
      taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
    }

    if (taillesData.length > 0 && !selectedTaille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    // Check stock per size
    let stockDisponible = produit.stock || 0
    if (taillesData.length > 0 && selectedTaille) {
      const selectedTailleData = taillesData.find(t => t.nom === selectedTaille)
      if (!selectedTailleData) {
        toast.error('Taille invalide')
        return
      }
      if (selectedTailleData.stock < quantite) {
        toast.error(`Stock insuffisant pour la taille ${selectedTaille}. Stock disponible: ${selectedTailleData.stock}`)
        return
      }
      stockDisponible = selectedTailleData.stock
    } else if (produit.has_colors && selectedCouleur && produit.couleurs) {
      const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
      stockDisponible = couleurSelected?.stock || 0
      if (stockDisponible < quantite) {
        toast.error('Stock insuffisant')
        return
      }
    } else if (stockDisponible < quantite) {
      toast.error('Stock insuffisant')
      return
    }

    setIsAddingToCart(true)

    try {
      await addToCart({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite,
        image_url: imageUrl,
        image: imageUrl,
        taille: selectedTaille || undefined,
        couleur: selectedCouleur || undefined,
        stock: stockDisponible,
      })

      // Fermer le modal et afficher le succès
      setShowModal(false)
      setSelectedTaille('')
      setSelectedCouleur('')
      setQuantite(1)
      toast.success('Produit ajouté au panier', { duration: 1400 })
    } catch (error) {
      // Afficher l'erreur de stock si elle existe
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout au panier')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent double clicks
    if (isAddingToWishlist) return

    setIsAddingToWishlist(true)

    // Store current state before action
    const wasInWishlist = inWishlist

    try {
      if (wasInWishlist) {
        removeFromWishlist(produit.id)
        toast.success('Produit retiré des favoris', { duration: 1500 })
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
          taille: produit.taille,
          categorie: produit.categorie,
          slug: produit.slug || slugify(produit.nom),
          categorySlug: produit.categorySlug || (produit.categorie ? slugify(produit.categorie) : undefined),
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
        toast.success('Produit ajouté aux favoris', { duration: 1500 })
      }
    } catch (error) {
      console.error('Erreur wishlist:', error)
      toast.error('Une erreur est survenue')
    } finally {
      // Delay to prevent rapid clicks
      setTimeout(() => {
        setIsAddingToWishlist(false)
      }, 400)
    }
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 relative flex flex-col h-full">
      <Link href={href} className="block flex-1 flex flex-col">
        <motion.div
          className="aspect-square overflow-hidden bg-muted relative group group/image"
        >
          <OptimizedImage
            key={imageUrl}
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            objectFit="cover"
          />

          {/* Color Navigation Arrows - Only show if product has multiple colors */}
          {hasMultipleColors && (
            <>
              {/* Left Arrow */}
              <button
                onClick={handlePreviousColor}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 active:bg-black/80 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all duration-200 opacity-0 group-hover/image:opacity-100 touch-manipulation"
                aria-label="Couleur précédente"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNextColor}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 active:bg-black/80 backdrop-blur-sm rounded-full p-1.5 md:p-2 transition-all duration-200 opacity-0 group-hover/image:opacity-100 touch-manipulation"
                aria-label="Couleur suivante"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </button>

              {/* Color Indicator Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200">
                {colorImages.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-200",
                      index === currentColorIndex
                        ? "bg-dore w-4"
                        : "bg-white/60"
                    )}
                  />
                ))}
              </div>
            </>
          )}


          {/* Badge favori en haut à droite */}
          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-1.5 md:p-2">
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-charbon fill-current" />
            </div>
          )}

          {/* Badge rupture de stock en haut à gauche */}
          {isOutOfStock() && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-2 py-1 md:px-3 md:py-1.5 border border-red-700/50">
              <span className="text-white text-[10px] md:text-xs font-semibold uppercase">Rupture</span>
            </div>
          )}
        </motion.div>

        <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-sm md:text-lg mb-0.5 md:mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {produit.nom}
            </h3>
            {produit.matiere && (
              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-1">{produit.matiere}</p>
            )}
            {/* Rating Display - COMMENTED OUT AS REQUESTED */}
            {/*
            {produit.rating_count !== undefined && produit.rating_count !== null && produit.rating_count > 0 && produit.average_rating !== null && produit.average_rating !== undefined && produit.average_rating > 0 && (
              <div className="mb-2 md:mb-3">
                <RatingDisplay
                  rating={produit.average_rating}
                  count={produit.rating_count}
                  size="sm"
                  className="justify-start"
                />
              </div>
            )}
            */}
          </div>
          <p className="text-base md:text-xl font-serif text-primary mt-auto">
            {produit.prix.toLocaleString('fr-MA')} DH
          </p>
        </div>
      </Link>

      {/* Boutons d'action toujours visibles */}
      {showActions && (
        <div className="px-3 md:px-5 pb-3 md:pb-5 flex gap-1.5 md:gap-2">
          {isInCart ? (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 border-charbon text-charbon hover:bg-charbon hover:text-background text-xs md:text-sm h-8 md:h-9"
            >
              <Link href="/panier" className="flex items-center justify-center">
                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Aller au panier</span>
                <span className="sm:hidden">Panier</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isOutOfStock()}
              className={cn(
                "flex-1 relative overflow-hidden text-xs md:text-sm h-8 md:h-9",
                addedToCart && !isInCart
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-dore text-charbon hover:bg-dore/90"
              )}
            >
              <AnimatePresence mode="wait">
                {addedToCart && !isInCart ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Ajouté !</span>
                    <span className="sm:hidden">OK</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <ShoppingBag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 flex-shrink-0" />
                    {isAddingToCart ? (
                      <span className="hidden sm:inline">Ajout...</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Ajouter</span>
                        <span className="sm:hidden">Ajouter</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleWishlist}
            disabled={isAddingToWishlist}
            className={cn(
              "px-2 md:px-3 h-8 md:h-9 flex-shrink-0",
              inWishlist && "bg-dore/20 border-dore text-dore"
            )}
          >
            <Heart className={cn("w-3 h-3 md:w-4 md:h-4", inWishlist && "fill-current")} />
          </Button>
        </div>
      )}

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
                  {produit.couleurs.map((c) => {
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
              // Get available sizes with stock information
              let taillesData: Taille[] = []
              if (produit.has_colors && selectedCouleur && produit.couleurs) {
                const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
                if (couleurSelected?.tailles && Array.isArray(couleurSelected.tailles)) {
                  taillesData = couleurSelected.tailles
                } else if (couleurSelected?.taille) {
                  // Backward compatibility
                  const tailleList = couleurSelected.taille.split(',').map(t => t.trim()).filter(t => t)
                  const stockPerSize = tailleList.length > 0 ? Math.floor((couleurSelected.stock || 0) / tailleList.length) : 0
                  taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                } else if (produit.tailles && Array.isArray(produit.tailles)) {
                  taillesData = produit.tailles
                } else if (produit.taille) {
                  const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                  const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
                  taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
                }
              } else if (produit.tailles && Array.isArray(produit.tailles)) {
                taillesData = produit.tailles
              } else if (produit.taille) {
                const tailleList = produit.taille.split(',').map(t => t.trim()).filter(t => t)
                const stockPerSize = tailleList.length > 0 ? Math.floor((produit.stock || 0) / tailleList.length) : 0
                taillesData = tailleList.map(t => ({ nom: t, stock: stockPerSize }))
              }

              if (taillesData.length > 0 && (!produit.has_colors || selectedCouleur)) {
                return (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Taille</label>
                    <div className="flex flex-wrap gap-2">
                      {taillesData.map((t) => {
                        const isSelected = selectedTaille === t.nom
                        const isOutOfStock = t.stock <= 0
                        return (
                          <button
                            key={t.nom}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && setSelectedTaille(t.nom)}
                            className={cn(
                              'w-12 h-12 rounded-lg border-2 font-medium transition-all relative',
                              isOutOfStock
                                ? 'opacity-30 cursor-not-allowed bg-muted text-muted-foreground border-muted'
                                : isSelected
                                  ? 'bg-dore text-charbon border-dore shadow-lg scale-105 hover:scale-105'
                                  : 'bg-background text-foreground border-border hover:border-dore hover:scale-105'
                            )}
                          >
                            {t.nom}
                            {isOutOfStock && (
                              <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 text-white px-1 rounded">Rupture</span>
                            )}
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
                      ? (produit.couleurs.find(c => c.nom === selectedCouleur)?.stock || 0)
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
                      ? (produit.couleurs.find(c => c.nom === selectedCouleur)?.stock || 0)
                      : (produit.stock || 999)
                    setQuantite(Math.min(maxQty, quantite + 1))
                  }}
                  disabled={(() => {
                    const maxQty = produit.has_colors && selectedCouleur && produit.couleurs
                      ? (produit.couleurs.find(c => c.nom === selectedCouleur)?.stock || 0)
                      : (produit.stock || 999)
                    return quantite >= maxQty
                  })()}
                >
                  +
                </Button>
              </div>
              {(() => {
                const stockDisponible = produit.has_colors && selectedCouleur && produit.couleurs
                  ? (produit.couleurs.find(c => c.nom === selectedCouleur)?.stock || 0)
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
                    const couleurSelected = produit.couleurs.find(c => c.nom === selectedCouleur)
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

export default CarteProduit

