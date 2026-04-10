'use client'

import React from 'react'
import { useFAQData } from './useFAQData'
import MobileFAQView from '@/components/faq/MobileFAQView'
import DesktopFAQView from '@/components/faq/DesktopFAQView'

/**
 * Unified FAQ Page
 * 
 * Merges mobile PWA help center with premium desktop FAQ.
 * Fixed security vulnerability by moving settings fetching to secure hook.
 */
export default function FAQPage() {
  const data = useFAQData()

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileFAQView data={data} />
      </div>

      {/* Desktop View - Premium Design */}
      <div className="hidden md:block">
        <DesktopFAQView data={data} />
      </div>
    </main>
  )
}
