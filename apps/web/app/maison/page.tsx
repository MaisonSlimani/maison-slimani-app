'use client'

import React, { useEffect } from 'react'
import MobileMaisonView from '@/components/maison/MobileMaisonView'
import DesktopMaisonView from '@/components/maison/DesktopMaisonView'

/**
 * Unified Maison Page
 * 
 * Responsive storytelling for the brand.
 * Replaces mixed component pattern with unified responsive architecture.
 */
export default function MaisonPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
    
    // SEO setup
    document.title = "Notre Maison - Maison Slimani"
    const description = "Découvrez l'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme."
    
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
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
