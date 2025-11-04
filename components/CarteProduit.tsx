'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Check } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Produit {
  id: string
  nom: string
  slug?: string
  prix: number
  image: string
  matiere?: string
  image_url?: string
  stock?: number
  taille?: string
}

interface CarteProduitProps {
  produit: Produit
  showActions?: boolean // Nouvelle prop pour afficher les boutons d'action
}

const CarteProduit = ({ produit, showActions = false }: CarteProduitProps) => {
  const imageUrl = produit.image_url || produit.image
  const href = `/produit/${produit.id}`
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const inWishlist = isInWishlist(produit.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      // Si le produit a une taille, rediriger vers la page produit
      if (produit.taille && produit.taille.trim()) {
        toast.info('Veuillez sélectionner une taille sur la page du produit')
        window.location.href = href
        return
      }

      // Vérifier le stock
      if (produit.stock !== undefined && produit.stock <= 0) {
        toast.error('Produit en rupture de stock')
        return
      }

      addToCart({
        id: produit.id,
        nom: produit.nom,
        prix: produit.prix,
        quantite: 1,
        image_url: imageUrl,
        image: imageUrl,
      })

      // Afficher le succès dans le bouton
      setAddedToCart(true)
      
      // Revenir au texte normal après 2 secondes
      setTimeout(() => {
        setAddedToCart(false)
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      toast.error('Erreur lors de l\'ajout au panier')
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
          className="aspect-square overflow-hidden bg-muted relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={imageUrl}
            alt={produit.nom}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badge favori en haut à droite */}
          {inWishlist && (
            <div className="absolute top-2 right-2 z-20 bg-dore/90 backdrop-blur-sm rounded-full p-2">
              <Heart className="w-4 h-4 text-charbon fill-current" />
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
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart || addedToCart || (produit.stock !== undefined && produit.stock <= 0)}
            className={cn(
              "flex-1 relative overflow-hidden",
              addedToCart 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-dore text-charbon hover:bg-dore/90"
            )}
          >
            <AnimatePresence mode="wait">
              {addedToCart ? (
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
    </Card>
  )
}

export default CarteProduit

