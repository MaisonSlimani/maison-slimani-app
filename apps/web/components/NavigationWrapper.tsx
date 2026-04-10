'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import BottomNav from '@/components/pwa/BottomNav'
import { cn } from '@maison/shared'

interface NavigationWrapperProps {
  children: React.ReactNode
}

/**
 * Unified Navigation Wrapper
 * 
 * Replaces useIsPWA with responsive CSS classes.
 * Ensures critical PWA components like BottomNav are rendered on mobile
 * while Desktop components are hidden.
 */
export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Routes that provide their own custom mobile header (Legacy PWA Views)
  const isHome = pathname === '/'
  const isBoutiqueRoot = pathname === '/boutique'
  const isCategoryPage = pathname.startsWith('/boutique/') && pathname.split('/').length === 3
  const isMenu = pathname === '/menu'
  const isPanier = pathname === '/panier'
  const isFavoris = pathname === '/favoris'
  const isContact = pathname === '/contact'
  const isFAQ = pathname === '/faq'
  const isMaison = pathname === '/maison'
  const isPolitiques = pathname === '/politiques'
  const isCheckout = pathname === '/checkout'
  const isOrderSuccess = pathname.startsWith('/commande/')

  const hideMobileHeader = isHome || isBoutiqueRoot || isCategoryPage || isMenu || isPanier || isFavoris || isContact || isFAQ || isMaison || isPolitiques || isCheckout || isOrderSuccess
  const isProductDetail = pathname.startsWith('/boutique/') && pathname.split('/').length > 3

  useEffect(() => {
    setIsMounted(false)
    const handleLoad = () => setIsMounted(true)
    
    if (document.readyState === 'complete') {
      const timer = setTimeout(() => setIsMounted(true), 100)
      return () => clearTimeout(timer)
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [pathname])

  if (!isMounted) return <>{children}</>

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <NavigationDesktop />
      </div>

      {/* Mobile Header (Standard) - Only shown on specific pages like Product Detail or Blog */}
      {!hideMobileHeader && (
        <div className="md:hidden">
          <EnteteMobile />
        </div>
      )}

      <main>{children}</main>

      {/* Mobile Bottom Nav (PWA Experience) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* Desktop Footer and Bottom Links */}
      <div className="hidden md:block">
        <Footer />
        <MenuBasNavigation />
      </div>
    </>
  )
}
