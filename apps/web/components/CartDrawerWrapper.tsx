'use client'

import { useEffect } from 'react'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import CartDrawer from '@/components/CartDrawer'

export default function CartDrawerWrapper() {
  const { isOpen, openDrawer, closeDrawer } = useCartDrawer()

  // Écouter l'événement pour ouvrir le drawer quand un produit est ajouté
  useEffect(() => {
    const handleOpenCart = () => {
      // Defer the state update to avoid updating during render
      setTimeout(() => {
        openDrawer()
      }, 0)
    }

    window.addEventListener('openCartDrawer', handleOpenCart)
    return () => window.removeEventListener('openCartDrawer', handleOpenCart)
  }, [openDrawer])
  
  return <CartDrawer open={isOpen} onOpenChange={(open) => {
    if (open) {
      openDrawer()
    } else {
      closeDrawer()
    }
  }} />
}

