'use client'

import { useState } from 'react'
import { Product, CartItem, ProductVariation } from '@maison/domain'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { toast } from 'sonner'
import { trackAddToWishlist } from '@/lib/analytics'
import { hapticFeedback } from '@/lib/haptics'

export function useProductCardState(produit: Product) {
  const { addItem: addToCart, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)

  const variations = (produit.colors as ProductVariation[]) || []
  
  const colorImages = variations.map((c) => ({ 
    color: c.name, 
    image: Array.isArray(c.images) ? c.images[0] : (c.images || produit.image_url) 
  })).filter(ci => ci.image) as { color: string; image: string }[]
  
  const imageUrl = (colorImages.length > 0 && colorImages[currentColorIndex]?.image) || produit.image_url || ''

  // Auto-select first available options when modal opens
  const openModal = () => {
    if (!selectedColor && variations.length > 0) {
      const firstColor = variations[0].name
      setSelectedColor(firstColor)
      
      const firstColorVariation = variations[0]
      if (firstColorVariation.sizes && firstColorVariation.sizes.length > 0) {
        setSelectedSize(firstColorVariation.sizes[0].name)
      }
    } else if (!selectedSize && produit.sizes && produit.sizes.length > 0) {
      setSelectedSize(produit.sizes[0].name)
    }
    setShowModal(true)
  }

  const toggleWishlist = () => {
    hapticFeedback('light')
    if (inWishlist) { removeFromWishlist(produit.id) }
    else {
      const item: CartItem = { ...produit, quantity: 1, image_url: imageUrl, size: null, color: null }
      addToWishlist(item)
      trackAddToWishlist({ content_name: produit.name, content_ids: [produit.id], content_type: 'product', value: produit.price, currency: 'MAD' })
      hapticFeedback('success')
    }
  }

  const addBasicToCart = async () => {
    hapticFeedback('medium')
    if (produit.hasColors || (produit.sizes && produit.sizes.length > 0)) { 
      openModal()
      return 
    }
    setIsAddingToCart(true)
    try {
      await addToCart({ ...produit, quantity: 1, image_url: imageUrl, size: null, color: null }, false)
      toast.success('Ajouté'); setAddedToCart(true); hapticFeedback('success')
      setTimeout(() => setAddedToCart(false), 2000)
    } finally { setIsAddingToCart(false) }
  }

  return { currentColorIndex, setCurrentColorIndex, isAddingToCart, setIsAddingToCart, addedToCart, showModal, setShowModal, selectedSize, setSelectedSize, selectedColor, setSelectedColor, quantity, setQuantity, inWishlist, isInCart, colorImages, imageUrl, toggleWishlist, addBasicToCart, addToCart }
}
