'use client'

import React from 'react'
import { useMenuData } from './useMenuData'
import MobileMenuView from '@/components/menu/MobileMenuView'
import DesktopMenuView from '@/components/menu/DesktopMenuView'

/**
 * Unified Menu Page
 * 
 * Specifically designed for mobile PWA navigation.
 * On desktop, users are redirected back to the boutique experience.
 */
export default function MenuPage() {
  const data = useMenuData()

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileMenuView data={data} />
      </div>

      {/* Desktop View - Premium Placeholder */}
      <div className="hidden md:block">
        <DesktopMenuView />
      </div>
    </main>
  )
}
