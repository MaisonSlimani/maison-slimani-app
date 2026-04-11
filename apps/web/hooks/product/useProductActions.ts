'use client'


import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { Product, ProductService } from '@maison/domain'

interface ProductActionProps {
  produit: Product;
  quantite: number;
  couleur: string;
  taille: string;
  setAddedToCart: (added: boolean) => void;
  params: Record<string, string>;
}

/**
 * Hook to manage product-level actions (Cart, Wishlist)
 * Orchestrates domain services and UI state.
 */
export function useProductActions({ produit, quantite, couleur, taille, setAddedToCart, params }: ProductActionProps) {
  const { addItem, clearCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const productService = new ProductService()

  const handleAddToCart = async (buyNow = false) => {
    if (!produit) return
    
    const error = productService.validateSelections(produit, couleur, taille)
    if (error) return toast.error(error)

    try {
      if (buyNow) clearCart()
      else setAddedToCart(true)

      const item = prepareCartItem(produit, quantite, couleur, taille, params, productService)
      await addItem(item, !buyNow)
      
      handlePostAddActions(buyNow)
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

function prepareCartItem(produit: Product, quantite: number, couleur: string, taille: string, params: Record<string, string>, service: ProductService) {
  return {
    ...produit, 
    quantite, 
    taille: taille || null, 
    couleur: couleur || null,
    stock: service.getSelectedStock(produit, couleur, taille),
    image_url: produit.image_url, 
    slug: produit.slug || params.slug,
    categorySlug: params.categorie
  }
}

function handlePostAddActions(buyNow: boolean) {
  if (buyNow) {
    window.location.href = '/checkout'
  }
}
