'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/hooks/useCart'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'

const EnteteMobile = () => {
  const { items, isLoaded } = useCart()
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()
  const { openDrawer } = useCartDrawer()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Calculer le nombre d'éléments différents dans le panier (pas la quantité totale)
  useEffect(() => {
    if (isLoaded) {
      setCartCount(items.length)
    }
  }, [items, isLoaded])

  // Calculer le nombre d'éléments dans la wishlist
  useEffect(() => {
    if (wishlistLoaded) {
      setWishlistCount(wishlistItems.length)
    }
  }, [wishlistItems, wishlistLoaded])

  // Écouter les changements du panier depuis localStorage
  useEffect(() => {
    const handleCartUpdate = () => {
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            const cartItems = JSON.parse(savedCart)
            // Compter le nombre d'éléments différents, pas la quantité totale
            setCartCount(cartItems.length)
          } catch (error) {
            console.error('Erreur lors de la lecture du panier:', error)
          }
        } else {
          setCartCount(0)
        }
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  // Écouter les changements de la wishlist
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          try {
            const wishlistItems = JSON.parse(savedWishlist)
            setWishlistCount(wishlistItems.length)
          } catch (error) {
            console.error('Erreur lors de la lecture de la wishlist:', error)
          }
        } else {
          setWishlistCount(0)
        }
      }
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    window.addEventListener('storage', handleWishlistUpdate)
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
      window.removeEventListener('storage', handleWishlistUpdate)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b md:hidden">
      <div className="container px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/assets/logos/logo_nobg.png"
              alt="Maison Slimani"
              fill
              className="object-contain"
              sizes="32px"
              priority
              unoptimized
              onError={(e) => {
                // Fallback silencieux si le logo n'existe pas encore
                const target = e.target as HTMLImageElement
                if (target.parentElement) {
                  target.parentElement.style.display = 'none'
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-serif tracking-tight">
            Maison <span className="text-primary">Slimani</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/favoris">
              <Heart className={cn("w-5 h-5", wishlistCount > 0 && "fill-current")} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-dore text-charbon">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
              <span className="sr-only">Favoris</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={openDrawer} className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-dore text-charbon">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="sr-only">Panier</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default EnteteMobile
