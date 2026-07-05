'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import NavigationDesktop from '@/components/NavigationDesktop'
import HeaderMobile from '@/components/HeaderMobile'
import Footer from '@/components/Footer'
import MenuBasNavigation from '@/components/MenuBasNavigation'
import BottomNav from '@/components/pwa/BottomNav'

interface NavigationWrapperProps {
  children: React.ReactNode
}

/**
 * Returns true if the page provides its own specialized UX (e.g. Checkout).
 * Most standard pages now use the unified NavigationWrapper.
 */
function isMinimalLayout(pathname: string) {
  const minimalRoutes = ['/checkout', '/login', '/register']
  return minimalRoutes.includes(pathname)
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <>{children}</>

  const isMinimal = isMinimalLayout(pathname)

  return (
    <>
      {!isMinimal && (
        <>
          {/* Desktop Header */}
          <div className="hidden md:block">
            <NavigationDesktop />
          </div>

          {/* Unified Mobile Header (Always Above Main Content) */}
          <div className="md:hidden">
            <HeaderMobile />
          </div>
        </>
      )}
      {pathname === '/checkout' && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-serif text-lg md:text-xl tracking-wide">
              Maison <span className="text-dore">Slimani</span>
            </Link>
            
            <Link 
              href="/boutique" 
              className="text-[11px] md:text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1"
            >
              <span>←</span> <span className="hidden sm:inline">Retour à la </span>boutique
            </Link>
          </div>
        </header>
      )}

      <main>{children}</main>

      {!isMinimal && (
        <>
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
      )}
    </>
  )
}
