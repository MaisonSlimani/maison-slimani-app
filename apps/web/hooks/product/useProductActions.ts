'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { Product, ProductVariation } from '@maison/domain'

interface ProductActionProps {
  produit: Product;
  quantite: number;
  couleur: string;
  taille: string;
  setAddedToCart: (added: boolean) => void;
  params: Record<string, string>;
}

export function useProductActions({ produit, quantite, couleur, taille, setAddedToCart, params }: ProductActionProps) {
  const router = useRouter()
  const { addItem, clearCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = async (buyNow = false) => {
    if (!produit) return
    if (produit.has_colors && !couleur) return toast.error('Sélectionnez une couleur')
    
    // Get the correct stock for the selected variation
    const variations = produit.couleurs as ProductVariation[] | null
    let selectedStock = produit.stock
    if (produit.has_colors && variations) {
      const variation = variations.find((v: ProductVariation) => v.nom === couleur)
      if (variation) {
        if (taille && variation.tailles) {
          selectedStock = variation.tailles.find((t: { nom: string; stock: number }) => t.nom === taille)?.stock ?? 0
        } else if (variation.stock !== undefined) {
          selectedStock = variation.stock
        }
      }
    }

    try {
      if (buyNow) {
        clearCart()
      } else {
        setAddedToCart(true)
      }

      await addItem({
        ...produit, 
        quantite, 
        taille: taille || null, 
        couleur: couleur || null,
        stock: selectedStock,
        image_url: produit.image_url, 
        slug: produit.slug || params.slug,
        categorySlug: params.categorie
      }, !buyNow)
      
      if (buyNow) {
        router.push('/checkout')
      } else {
        setTimeout(() => setAddedToCart(false), 2000)
      }
    } catch (err) { 
      setAddedToCart(false)
      toast.error((err as Error).message) 
    }
  }

  const handleToggleWishlist = () => {
    if (!produit) return
    if (isInWishlist(produit.id)) {
      removeFromWishlist(produit.id)
      toast.success('Retiré des favoris')
    } else {
      addToWishlist({ ...produit, quantite: 1, image_url: produit.image_url, taille: null, couleur: null })
      toast.success('Ajouté aux favoris')
    }
  }

  return { handleAddToCart, handleToggleWishlist, isInWishlist: isInWishlist(produit.id) }
}
