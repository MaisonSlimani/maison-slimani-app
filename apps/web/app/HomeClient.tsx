'use client'

import { useEffect } from 'react'
import { useHomeData } from './useHomeData'
import MobileHomeView from '@/components/home/MobileHomeView'
import DesktopHomeView from '@/components/home/DesktopHomeView'

/**
 * Unified Home Page
 * 
 * Merges the immersive PWA mobile experience with the premium 
 * luxury desktop design. Share unified data fetching and logic.
 */
export default function AccueilPage() {
  const data = useHomeData()

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Structured Data Injection
    const description = 'Maison Slimani : chaussures homme haut de gamme en cuir marocain. Qualité artisanale.'
    const existingScript = document.getElementById('home-structured-data')
    if (existingScript) existingScript.remove()

    const script = document.createElement('script')
    script.id = 'home-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${window.location.origin}/#organization`,
          name: 'Maison Slimani',
          url: window.location.origin,
          logo: `${window.location.origin}/logo-search.png`,
        },
        {
          '@type': 'WebSite',
          '@id': `${window.location.origin}/#website`,
          url: window.location.origin,
          name: 'Maison Slimani',
          description: description,
        }
      ]
    })
    document.head.appendChild(script)
  }, [])

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileHomeView data={data} />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopHomeView data={data} />
      </div>
    </main>
  )
}
