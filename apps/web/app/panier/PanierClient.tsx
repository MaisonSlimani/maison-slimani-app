'use client'

import MobilePanierView from '@/components/panier/MobilePanierView'
import DesktopPanierView from '@/components/panier/DesktopPanierView'

/**
 * Client-side part of the Panier page.
 * Houses the cart logic and responsive views.
 */
export default function PanierClient() {
  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobilePanierView />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopPanierView />
      </div>
    </main>
  )
}
