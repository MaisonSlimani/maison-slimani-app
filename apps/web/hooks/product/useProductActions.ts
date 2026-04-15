'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { Product, validateProductSelections, getSelectedStock } from '@maison/domain'

interface ProductActionProps {
  product: Product;
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
export function useProductActions({ product, quantity, color, size, setAddedToCart, params }: ProductActionProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return
    
    const error = validateProductSelections(product, color, size)
    if (error) return toast.error(error)

    try {
      const item = prepareCartItem(product, quantity, color, size, params)

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
    if (!product) return
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Retiré des favoris')
    } else {
      addToWishlist({ ...product, quantity: 1, image_url: product.image_url, size: null, color: null })
      toast.success('Ajouté aux favoris')
    }
  }

  return { handleAddToCart, handleToggleWishlist, isInWishlist: isInWishlist(product.id) }
}

function prepareCartItem(product: Product, quantity: number, color: string, size: string, params: Record<string, string>) {
  return {
    ...product, 
    quantity, 
    size: size || null, 
    color: color || null,
    stock: getSelectedStock(product, color, size),
    image_url: product.image_url, 
    slug: product.slug || params.slug,
    categorySlug: params.category || params.categorie // Support both while transitioning
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
