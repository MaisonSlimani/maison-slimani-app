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
  
  const [selectedTaille, setSelectedTaille] = useState('')
  const [selectedCouleur, setSelectedCouleur] = useState('')
  const [quantite, setQuantite] = useState(1)

  const inWishlist = isInWishlist(produit.id)
  const isInCart = items.some(item => item.id === produit.id)

  const variations = (produit.couleurs as ProductVariation[]) || []
  
  const colorImages = variations.map((c) => ({ 
    couleur: c.nom, 
    image: Array.isArray(c.images) ? c.images[0] : (c.images || produit.image_url) 
  })).filter(ci => ci.image) as { couleur: string; image: string }[]
  
  const imageUrl = (colorImages.length > 0 && colorImages[currentColorIndex]?.image) || produit.image_url || ''

  // Auto-select first available options when modal opens
  const openModal = () => {
    if (!selectedCouleur && variations.length > 0) {
      const firstColor = variations[0].nom
      setSelectedCouleur(firstColor)
      
      const firstColorVariation = variations[0]
      if (firstColorVariation.tailles && firstColorVariation.tailles.length > 0) {
        setSelectedTaille(firstColorVariation.tailles[0].nom)
      }
    } else if (!selectedTaille && produit.tailles && produit.tailles.length > 0) {
      setSelectedTaille(produit.tailles[0].nom)
    }
    setShowModal(true)
  }

  const toggleWishlist = () => {
    hapticFeedback('light')
    if (inWishlist) { removeFromWishlist(produit.id) }
    else {
      const item: CartItem = { ...produit, quantite: 1, image_url: imageUrl, taille: null, couleur: null }
      addToWishlist(item)
      trackAddToWishlist({ content_name: produit.nom, content_ids: [produit.id], content_type: 'product', value: produit.prix, currency: 'MAD' })
      hapticFeedback('success')
    }
  }

  const addBasicToCart = async () => {
    hapticFeedback('medium')
    if (produit.has_colors || (produit.tailles && produit.tailles.length > 0)) { 
      openModal()
      return 
    }
    setIsAddingToCart(true)
    try {
      await addToCart({ ...produit, quantite: 1, image_url: imageUrl, taille: null, couleur: null }, false)
      toast.success('Ajouté'); setAddedToCart(true); hapticFeedback('success')
      setTimeout(() => setAddedToCart(false), 2000)
    } finally { setIsAddingToCart(false) }
  }

  return { currentColorIndex, setCurrentColorIndex, isAddingToCart, setIsAddingToCart, addedToCart, showModal, setShowModal, selectedTaille, setSelectedTaille, selectedCouleur, setSelectedCouleur, quantite, setQuantite, inWishlist, isInCart, colorImages, imageUrl, toggleWishlist, addBasicToCart, addToCart }
}
