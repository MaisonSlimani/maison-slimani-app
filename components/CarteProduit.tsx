'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Check, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageItem {
  url: string
  couleur?: string | null
  ordre?: number
}

interface Couleur {
  nom: string
  code?: string
  stock?: number
  taille?: string
}

interface Produit {
  id: string
  nom: string
  slug?: string
  prix: number
  image: string
  matiere?: string
  image_url?: string
  images?: ImageItem[] | string[]
  stock?: number
  taille?: string
  has_colors?: boolean
  couleurs?: Couleur[]
}

interface CarteProduitProps {
  produit: Produit
  showActions?: boolean // Nouvelle prop pour afficher les boutons d'action
}

const CarteProduit = ({ produit, showActions = false }: CarteProduitProps) => {
  // Obtenir la première image (support pour images multiples)
  const getFirstImage = () => {
    if (produit.images && produit.images.length > 0) {
      const firstImg = produit.images[0]
      return typeof firstImg === 'string' ? firstImg : firstImg.url
    }
    return produit.image_url || produit.image
  }
  
  const imageUrl = getFirstImage()
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  const href = `/produits/${produit.slug || slugify(produit.nom)}`
  const { addItem: addToCart, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTaille, setSelectedTaille] = useState<string>('')
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

  // Parse les tailles disponibles
  const taillesDisponibles = produit.taille && produit.taille.trim() 
    ? produit.taille.split(',').map(t => t.trim()).filter(t => t)
    : []

  // Helper function to check if product is out of stock
  const isOutOfStock = () => {
    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs)) {
      // For products with colors, check if ANY color has stock > 0
      return !produit.couleurs.some(c => (c.stock || 0) > 0)
    } else {
      // For products without colors, check the global stock
      return produit.stock !== undefined && produit.stock <= 0
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    // Si le produit a des tailles, ouvrir le modal
    if (taillesDisponibles.length > 0) {
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
    if (taillesDisponibles.length > 0 && !selectedTaille) {
      toast.error('Veuillez sélectionner une taille')
      return
    }

    // Vérifier le stock
    // Note: For products with colors, stock validation happens in useCart hook
    if (!produit.has_colors && produit.stock !== undefined && produit.stock < quantite) {
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
        stock: produit.stock,
      })

      // Fermer le modal et afficher le succès
      setShowModal(false)
      setSelectedTaille('')
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
        addToWishlist({
          id: produit.id,
          nom: produit.nom,
          prix: produit.prix,
          image_url: imageUrl,
          image: imageUrl,
          stock: produit.stock,
          taille: produit.taille,
        })
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
          className="aspect-square overflow-hidden bg-muted relative group"
        >
          <Image
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {/* Badge favori en haut à droite */}
          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-1.5 md:p-2">
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-charbon fill-current" />
            </div>
          )}
          {/* Badge rupture de stock */}
          {isOutOfStock() && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-2 py-1 md:px-3 md:py-1.5">
              <span className="text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide">Rupture</span>
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

      {/* Modal pour sélectionner taille et quantité */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{produit.nom}</DialogTitle>
            <DialogDescription>
              Sélectionnez la taille et la quantité souhaitées
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Sélecteur de taille */}
            {taillesDisponibles.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Taille</label>
                <div className="flex flex-wrap gap-2">
                  {taillesDisponibles.map((taille) => {
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
            )}

            {/* Sélecteur de quantité */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quantité</label>
              <div className="flex items-center gap-2 border border-border rounded-lg w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  disabled={quantite <= 1}
                >
                  −
                </Button>
                <span className="w-12 text-center font-medium">{quantite}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantite(Math.min(produit.stock || 999, quantite + 1))}
                  disabled={produit.stock !== undefined && quantite >= produit.stock}
                >
                  +
                </Button>
              </div>
              {produit.stock !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Stock disponible: {produit.stock}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false)
                setSelectedTaille('')
                setQuantite(1)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAddToCart}
              disabled={isAddingToCart || (taillesDisponibles.length > 0 && !selectedTaille)}
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

