'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart } from 'lucide-react'
import { Button } from '@maison/ui'
import { useCart } from '@/lib/hooks/useCart'
import { cn } from '@maison/shared'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'

const EnteteMobile = () => {
  const { cartCount, wishlistCount } = useHeaderData()
  const { openDrawer } = useCartDrawer()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b md:hidden">
      <div className="container px-6 h-16 flex items-center justify-between">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <HeaderAction href="/favoris" count={wishlistCount} icon={Heart} label="Favoris" />
          <Button variant="ghost" size="icon" onClick={openDrawer} className="relative">
            <ShoppingBag className="w-5 h-5" />
            <HeaderBadge count={cartCount} />
            <span className="sr-only">Panier</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

function useHeaderData() {
  const { items: cartItems, isLoaded: cartLoaded } = useCart()
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => { if (cartLoaded) setCartCount(cartItems.length) }, [cartItems, cartLoaded])
  useEffect(() => { if (wishlistLoaded) setWishlistCount(wishlistItems.length) }, [wishlistItems, wishlistLoaded])

  useEffect(() => {
    const sync = () => {
      const savedCart = localStorage.getItem('cart'), savedWish = localStorage.getItem('wishlist')
      if (savedCart) try { setCartCount(JSON.parse(savedCart).length) } catch { /* ignore */ }
      if (savedWish) try { setWishlistCount(JSON.parse(savedWish).length) } catch { /* ignore */ }
    }
    window.addEventListener('cartUpdated', sync)
    window.addEventListener('wishlistUpdated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('cartUpdated', sync)
      window.removeEventListener('wishlistUpdated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { cartCount, wishlistCount }
}

function HeaderAction({ href, count, icon: Icon, label }: { href: string; count: number; icon: React.ElementType; label: string }) {
  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={href}>
        <Icon className={cn("w-5 h-5", count > 0 && "fill-current")} />
        <HeaderBadge count={count} />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  )
}

function HeaderBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-dore text-charbon">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative w-8 h-8 flex-shrink-0">
        <Image src="/assets/logos/logo_nobg.png" alt="Maison Slimani" fill className="object-contain" sizes="32px" priority unoptimized />
      </div>
      <h1 className="text-2xl font-serif tracking-tight">Maison <span className="text-primary">Slimani</span></h1>
    </Link>
  )
}

export default EnteteMobile
