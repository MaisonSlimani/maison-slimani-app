'use client'

import { useEffect, useRef } from 'react'
import { useWishlistDrawer } from '@/lib/contexts/WishlistDrawerContext'
import { useWishlist } from '@/lib/hooks/useWishlist'
import WishlistDrawer from '@/components/WishlistDrawer'

export default function WishlistDrawerWrapper() {
  const { isOpen, openDrawer, closeDrawer } = useWishlistDrawer()
  const { isLoaded } = useWishlist()
  const pendingOpenRef = useRef(false)

  // Listen for wishlist updates to ensure state is synced before opening
  useEffect(() => {
    const handleWishlistUpdate = () => {
      // If we were waiting to open the drawer, open it now that wishlist is updated
      if (pendingOpenRef.current) {
        // Small delay to ensure React has re-rendered with new state
        setTimeout(() => {
          openDrawer()
          pendingOpenRef.current = false
        }, 100)
      }
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
  }, [openDrawer])

  // Écouter l'événement pour ouvrir le drawer quand un produit est ajouté aux favoris
  useEffect(() => {
    const handleOpenWishlist = () => {
      // Wait for wishlist to be loaded
      if (isLoaded) {
        // Mark that we want to open, and wait for wishlistUpdated event
        pendingOpenRef.current = true
        // Fallback: if wishlistUpdated doesn't fire within 500ms, open anyway
        setTimeout(() => {
          if (pendingOpenRef.current) {
            openDrawer()
            pendingOpenRef.current = false
          }
        }, 500)
      } else {
        // If not loaded yet, wait for it
        const checkLoaded = setInterval(() => {
          if (isLoaded) {
            clearInterval(checkLoaded)
            pendingOpenRef.current = true
            setTimeout(() => {
              if (pendingOpenRef.current) {
                openDrawer()
                pendingOpenRef.current = false
              }
            }, 500)
          }
        }, 50)
        
        // Cleanup after 2 seconds max
        setTimeout(() => clearInterval(checkLoaded), 2000)
      }
    }

    window.addEventListener('openWishlistDrawer', handleOpenWishlist)
    return () => window.removeEventListener('openWishlistDrawer', handleOpenWishlist)
  }, [openDrawer, isLoaded])
  
  return <WishlistDrawer open={isOpen} onOpenChange={(open) => {
    if (open) {
      openDrawer()
    } else {
      closeDrawer()
    }
  }} />
}

