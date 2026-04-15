'use client'

import React from 'react'
import { useFAQData } from './useFAQData'
import MobileFAQView from '@/components/faq/MobileFAQView'
import DesktopFAQView from '@/components/faq/DesktopFAQView'

import { SiteSettings } from '@maison/domain'

/**
 * Unified FAQ Page
 * 
 * Merges mobile PWA help center with premium desktop FAQ.
 * Fixed security vulnerability by moving settings fetching to secure hook.
 */
export default function FAQClient({ initialSettings }: { initialSettings?: SiteSettings | null }) {
  const data = useFAQData(initialSettings)

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
