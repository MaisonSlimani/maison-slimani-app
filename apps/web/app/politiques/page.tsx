'use client'

import React from 'react'
import { usePolitiquesData } from './usePolitiquesData'
import MobilePolitiquesView from '@/components/politiques/MobilePolitiquesView'
import DesktopPolitiquesView from '@/components/politiques/DesktopPolitiquesView'

/**
 * Unified Politiques Page
 * 
 * Merges mobile PWA return policy with premium desktop layout.
 */
export default function PolitiquesPage() {
  const data = usePolitiquesData()

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobilePolitiquesView data={data} />
      </div>

      {/* Desktop View - Premium Design */}
      <div className="hidden md:block">
        <DesktopPolitiquesView data={data} />
      </div>
    </main>
  )
}
