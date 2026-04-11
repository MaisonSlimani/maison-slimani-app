'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import NavigationDesktop from '@/components/NavigationDesktop'
import EnteteMobile from '@/components/EnteteMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import BottomNav from '@/components/pwa/BottomNav'
interface NavigationWrapperProps {
  children: React.ReactNode
}

function isSpecialRoute(pathname: string) {
  const matches = [
    '/', '/boutique', '/menu', '/panier', '/favoris', 
    '/contact', '/faq', '/maison', '/politiques', '/checkout'
  ]
  if (matches.includes(pathname)) return true
  if (pathname.startsWith('/commande/')) return true
  // Category page check: /boutique/[slug]
  if (pathname.startsWith('/boutique/') && pathname.split('/').length === 3) return true
  return false
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
  const hideMobileHeader = isSpecialRoute(pathname)

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
