import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Product } from '@maison/domain'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { trackAddToWishlist } from '@/lib/analytics'

interface UseProductCardActionsProps {
  produit: Product
  imageUrl: string
  isOutOfStock: boolean
}

/**
 * Hook to manage product card actions (add to cart, wishlist, selection dialog)
 */
export function useProductCardActions({ produit, imageUrl, isOutOfStock }: UseProductCardActionsProps) {
  const router = useRouter()
  const { items, addItem: addToCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)

  const onAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isAddingToCart || isOutOfStock) return
    if (produit.hasColors || (produit.sizes && produit.sizes.length > 0)) {
      return setShowModal(true)
    }
    setIsAddingToCart(true)
    try {
      await addToCart({ ...produit, quantity: 1, image_url: imageUrl, size: null, color: null }, false)
      toast.success('Ajouté au panier')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally { setIsAddingToCart(false) }
  }

  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (inWishlist) return removeFromWishlist(produit.id)
    addToWishlist({ ...produit, quantity: 1, image_url: imageUrl, size: null, color: null })
    trackAddToWishlist({ content_name: produit.name, content_ids: [produit.id], content_type: 'product', value: produit.price, currency: 'MAD' })
  }

  const onConfirmPurchase = async (buyNow: boolean) => {
    setIsAddingToCart(true)
    try {
      await addToCart({ ...produit, quantity, size: selectedSize, color: selectedColor, image_url: imageUrl }, !buyNow)
      setShowModal(false)
      if (buyNow) { router.push('/checkout') } else { toast.success('Ajouté au panier') }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally { setIsAddingToCart(false) }
  }

  return {
    isInCart, inWishlist, isAddingToCart, showModal, setShowModal,
    selectedSize, setSelectedSize, selectedColor, setSelectedColor,
    quantity, setQuantity, onAddToCart, onToggleWishlist, onConfirmPurchase
  }
}
