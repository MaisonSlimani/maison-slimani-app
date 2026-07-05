'use client'

import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { useState } from 'react'
import { Product, CartItem, getSelectedStock } from '@maison/domain'
import { useRouter } from 'next/navigation'
import { apiFetch, ENDPOINTS } from '@/lib/api/client'

async function fetchProductById(id: string): Promise<Product | null> {
  const result = await apiFetch<Product>(`${ENDPOINTS.PRODUITS}/${id}`)
  return result.success && result.data ? result.data : null
}

function getInitialVariations(product: Product) {
  const firstColor = product.colors?.find(c => (c.stock || 0) > 0) || product.colors?.[0]
  const colorName = firstColor ? firstColor.name : ''
  
  let sizeName = ''
  if (firstColor && firstColor.sizes) {
    const availableSize = firstColor.sizes.find(s => (s.stock || 0) > 0) || firstColor.sizes[0]
    if (availableSize) sizeName = availableSize.name
  } else if (product.sizes) {
    const availableSize = product.sizes.find(s => (s.stock || 0) > 0) || product.sizes[0]
    if (availableSize) sizeName = availableSize.name
  }
  
  return { colorName, sizeName }
}

const hasProductVariations = (product: Product) => 
  !!(product.hasColors || (product.sizes && product.sizes.length > 0))

export function useFavorisData() {
  const router = useRouter()
  const { items, removeItem, isLoaded } = useWishlist()
  const { addItem: addToCart, items: cartItems } = useCart()
  const [productData, setProductData] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

  const fetchProductData = async (item: CartItem) => {
    setLoadingProduct(true)
    try {
      const data = await fetchProductById(item.id)
      if (!data) return
      setProductData(data)
      const { colorName, sizeName } = getInitialVariations(data)
      setSelectedColor(colorName); setSelectedSize(sizeName); setQuantity(1)
      if (hasProductVariations(data)) {
        setShowModal(item.id)
      } else {
        setAddingToCart(item.id)
        await addToCart({ ...data, quantity: 1, size: null, color: null, image_url: data.image_url, stock: data.stock }, true)
        toast.success('Ajouté au panier')
        setAddingToCart(null)
      }
    } catch { toast.error('Erreur chargement') }
    finally { setLoadingProduct(false) }
  }

  const handleAddToCart = async (item: CartItem) => {
    if (!productData || productData.id !== item.id) { 
      await fetchProductData(item)
    } else if (hasProductVariations(productData)) {
      setShowModal(item.id)
    } else {
      await onConfirm(false)
    }
  }

  const onConfirm = async (buyNow: boolean) => {
    if (!productData) return
    setAddingToCart(productData.id)
    try {
      await addToCart({ 
        ...productData, 
        quantity, 
        size: selectedSize || null, 
        color: selectedColor || null, 
        image_url: productData.image_url,
        stock: getSelectedStock(productData, selectedColor, selectedSize)
      }, !buyNow)
      setShowModal(null)
      if (buyNow) router.push('/checkout')
      else toast.success('Ajouté au panier')
    } catch (err) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    } finally { setAddingToCart(null) }
  }

  return { 
    items, removeItem, isLoaded, 
    isInCart: (id: string) => cartItems.some(i => i.id === id), 
    addingToCart, showModal, setShowModal, productData, loadingProduct, 
    selectedColor, setSelectedColor, selectedSize, setSelectedSize, quantity, setQuantity, 
    handleAddToCart, fetchProductData, onConfirm
  }
}
