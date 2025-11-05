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
  const href = `/produit/${produit.id}`
  const { addItem: addToCart, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedTaille, setSelectedTaille] = useState<string>('')
  const [quantite, setQuantite] = useState(1)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [isHovering, setIsHovering] = useState(false)
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
    if (produit.stock !== undefined && produit.stock <= 0) {
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
    if (produit.stock !== undefined && produit.stock < quantite) {
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
    
    if (isAddingToWishlist) return
    
    setIsAddingToWishlist(true)
    
    try {
      if (inWishlist) {
        removeFromWishlist(produit.id)
        toast.success('Produit retiré des favoris')
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
        toast.success('Produit ajouté aux favoris')
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la wishlist:', error)
      toast.error('Erreur lors de la modification de la wishlist')
    } finally {
      setIsAddingToWishlist(false)
    }
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 relative flex flex-col">
      <Link href={href} className="block">
        <motion.div
          className="aspect-square overflow-hidden bg-muted relative group cursor-zoom-in"
          onMouseMove={(e) => {
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              setHoverPosition({ x, y })
              setIsHovering(true)
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false)
            setHoverPosition(null)
          }}
        >
          <Image
            src={imageUrl}
            alt={produit.nom}
            fill
            className={cn(
              'object-cover transition-transform duration-300',
              isHovering && typeof window !== 'undefined' && window.innerWidth >= 768 && 'scale-150'
            )}
            style={{
              transformOrigin: hoverPosition
                ? `${hoverPosition.x}% ${hoverPosition.y}%`
                : 'center',
            }}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badge favori en haut à droite */}
          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-2">
              <Heart className="w-4 h-4 text-charbon fill-current" />
            </div>
          )}
          {/* Badge rupture de stock */}
          {produit.stock !== undefined && produit.stock <= 0 && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/95 backdrop-blur-sm rounded-md px-3 py-1.5">
              <span className="text-white text-xs font-semibold uppercase tracking-wide">Rupture de stock</span>
            </div>
          )}
        </motion.div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
            {produit.nom}
          </h3>
          {produit.matiere && (
            <p className="text-sm text-muted-foreground mb-3">{produit.matiere}</p>
          )}
          <p className="text-xl font-serif text-primary mb-4">
            {produit.prix.toLocaleString('fr-MA')} DH
          </p>
        </div>
      </Link>
      
      {/* Boutons d'action toujours visibles */}
      {showActions && (
        <div className="px-5 pb-5 flex gap-2">
          {isInCart ? (
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 border-charbon text-charbon hover:bg-charbon hover:text-background"
            >
              <Link href="/panier">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Aller au panier
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAddingToCart || (produit.stock !== undefined && produit.stock <= 0)}
              className={cn(
                "flex-1 relative overflow-hidden",
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
                    <Check className="w-4 h-4 mr-2" />
                    Ajouté !
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
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {isAddingToCart ? 'Ajout...' : 'Ajouter'}
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
              "px-3",
              inWishlist && "bg-dore/20 border-dore text-dore"
            )}
          >
            <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
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

