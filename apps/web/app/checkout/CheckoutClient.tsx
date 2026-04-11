'use client'

import MobileCheckoutView from '@/components/checkout/MobileCheckoutView'
import DesktopCheckoutView from '@/components/checkout/DesktopCheckoutView'

/**
 * Client-side part of the Checkout page.
 * Merges the PWA mobile checkout with the desktop experience.
 */
export default function CheckoutClient() {
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
