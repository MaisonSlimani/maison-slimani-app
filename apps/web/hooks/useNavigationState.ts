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
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { 
    pathname, 
    scrolled, 
    isSearchOpen, 
    setIsSearchOpen: (val: boolean) => setIsSearchOpen(val), 
    cartCount: cartLoaded ? cartItems.length : 0, 
    wishlistCount: wishlistLoaded ? wishlistItems.length : 0, 
    isHomePage: pathname === '/' 
  }
}
