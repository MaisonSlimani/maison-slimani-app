'use client'

import React from 'react'
import { useFavorisData } from './useFavorisData'
import MobileFavorisView from '@/components/favoris/MobileFavorisView'
import DesktopFavorisView from '@/components/favoris/DesktopFavorisView'

/**
 * Unified Favorites (Wishlist) Page
 * 
 * Replaces useIsPWA with responsive views.
 * Merges sophisticated PWA variant selection with premium desktop layout.
 */
export default function FavorisPage() {
  const data = useFavorisData()
  const { isLoaded } = data

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ecru/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dore"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileFavorisView data={data} />
      </div>

      {/* Desktop View - Premium Design */}
      <div className="hidden md:block">
        <DesktopFavorisView data={data} />
      </div>
    </main>
  )
}
