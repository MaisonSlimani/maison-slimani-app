'use client'


import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { Product, validateProductSelections, getSelectedStock } from '@maison/domain'

interface ProductActionProps {
  produit: Product;
  quantity: number;
  color: string;
  size: string;
  setAddedToCart: (added: boolean) => void;
  params: Record<string, string>;
}

/**
 * Hook to manage product-level actions (Cart, Wishlist)
 * Orchestrates domain services and UI state.
 */
export function useProductActions({ produit, quantity, color, size, setAddedToCart, params }: ProductActionProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = async (buyNow = false) => {
    if (!produit) return
    
    const error = validateProductSelections(produit, color, size)
    if (error) return toast.error(error)

    try {
      const item = prepareCartItem(produit, quantity, color, size, params)

      if (buyNow) {
        persistBuyNowItem(item)
        router.push('/checkout')
        return
      }

      setAddedToCart(true)
      await addItem(item, true)
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
      addToWishlist({ ...produit, quantity: 1, image_url: produit.image_url, size: null, color: null })
      toast.success('Ajouté aux favoris')
    }
  }

  return { handleAddToCart, handleToggleWishlist, isInWishlist: isInWishlist(produit.id) }
}

function prepareCartItem(produit: Product, quantity: number, color: string, size: string, params: Record<string, string>) {
  return {
    ...produit, 
    quantity, 
    size: size || null, 
    color: color || null,
    stock: getSelectedStock(produit, color, size),
    image_url: produit.image_url, 
    slug: produit.slug || params.slug,
    categorySlug: params.categorie
  }
}

/**
 * Writes a single item to localStorage synchronously for Buy Now flow.
 * Bypasses React state to prevent race conditions with hard navigation.
 */
function persistBuyNowItem(item: ReturnType<typeof prepareCartItem>) {
  const cartItems = JSON.stringify([{ ...item, quantity: item.quantity || 1 }])
  localStorage.setItem('cart', cartItems)
  window.dispatchEvent(new Event('cartUpdated'))
}

