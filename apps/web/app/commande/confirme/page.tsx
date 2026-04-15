'use client'

import React from 'react'
import { useOrderConfirmation } from './useOrderConfirmation'
import MobileOrderSuccessView from '@/components/order/MobileOrderSuccessView'
import DesktopOrderSuccessView from '@/components/order/DesktopOrderSuccessView'

/**
 * Unified Order Confirmation Page
 * 
 * Replaces useIsPWA with responsive views.
 * Preserves PWA tracking logic and design.
 */
export default function CommandeConfirmePage() {
  useOrderConfirmation()

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileOrderSuccessView />
      </div>

      {/* Desktop View - Premium Design */}
      <div className="hidden md:block">
        <DesktopOrderSuccessView />
      </div>
    </main>
  )
}
