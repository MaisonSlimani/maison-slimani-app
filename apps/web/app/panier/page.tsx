'use client'

import { useEffect } from 'react'
import MobilePanierView from '@/components/panier/MobilePanierView'
import DesktopPanierView from '@/components/panier/DesktopPanierView'

/**
 * Unified Panier Page
 * 
 * Merges PWA mobile design and luxury desktop design into one responsive file.
 * Preserves all tracking, SEO (noindex), and animations.
 */
export default function PanierPage() {
  
  // SEO: Noindex (user-specific page)
  useEffect(() => {
    const robotsMeta = document.querySelector('meta[name="robots"]')
    if (robotsMeta) {
      robotsMeta.setAttribute('content', 'noindex, nofollow')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'robots'
      meta.content = 'noindex, nofollow'
      document.head.appendChild(meta)
    }
  }, [])

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
