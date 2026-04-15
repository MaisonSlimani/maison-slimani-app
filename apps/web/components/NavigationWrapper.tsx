'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
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
