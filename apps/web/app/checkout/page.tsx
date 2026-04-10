'use client'

import { useEffect } from 'react'
import MobileCheckoutView from '@/components/checkout/MobileCheckoutView'
import DesktopCheckoutView from '@/components/checkout/DesktopCheckoutView'

/**
 * Unified Checkout Page
 * 
 * This page merges the high-conversion PWA mobile checkout with the
 * luxury desktop experience, sharing the same robust validation and logic.
 */
export default function CheckoutPage() {
  
  // SEO: Noindex (transactional page)
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
        <MobileCheckoutView />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopCheckoutView />
      </div>
    </main>
  )
}
