'use client'

import React from 'react'
import { useContactData } from './useContactData'
import MobileContactView from '@/components/contact/MobileContactView'
import DesktopContactView from '@/components/contact/DesktopContactView'

import { SiteSettings } from '@maison/domain'

/**
 * Unified Contact Page
 * 
 * Merges mobile PWA contact center with premium desktop contact experience.
 * Shared data fetching and form logic.
 */
export default function ContactClient({ initialSettings }: { initialSettings?: SiteSettings | null }) {
  const data = useContactData(initialSettings)

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileContactView data={data} />
      </div>

      {/* Desktop View - Premium Design */}
      <div className="hidden md:block">
        <DesktopContactView data={data} />
      </div>
    </main>
  )
}
