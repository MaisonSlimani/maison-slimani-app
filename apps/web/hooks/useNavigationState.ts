'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { NavigationState } from '@/types/views'

export function useNavigationState(): NavigationState {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { items: cartItems, isLoaded: cartLoaded } = useCart()
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { if (cartLoaded) setCartCount(cartItems.length) }, [cartItems, cartLoaded])
  useEffect(() => { if (wishlistLoaded) setWishlistCount(wishlistItems.length) }, [wishlistItems, wishlistLoaded])

  useEffect(() => {
    const update = () => {
      const c = JSON.parse(localStorage.getItem('cart') || '[]')
      const w = JSON.parse(localStorage.getItem('wishlist') || '[]')
      setCartCount(c.length); setWishlistCount(w.length)
    }
    window.addEventListener('cartUpdated', update)
    window.addEventListener('wishlistUpdated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('cartUpdated', update)
      window.removeEventListener('wishlistUpdated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return { 
    pathname, 
    scrolled, 
    isSearchOpen, 
    setIsSearchOpen: (val: boolean) => setIsSearchOpen(val), 
    cartCount, 
    wishlistCount, 
    isHomePage: pathname === '/' 
  }
}
