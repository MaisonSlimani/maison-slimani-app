'use client'

import React, { useEffect } from 'react'
import MobileMaisonView from '@/components/maison/MobileMaisonView'
import DesktopMaisonView from '@/components/maison/DesktopMaisonView'

/**
 * Client-side part of the Maison page.
 * Handles scroll reset and any future client-side logic.
 */
export default function MaisonClient() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen">
      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileMaisonView />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopMaisonView />
      </div>
    </main>
  )
}
