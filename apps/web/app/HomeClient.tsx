'use client'

import { useEffect } from 'react'
import { HomeData } from '@maison/domain'
import { useHomeData } from './useHomeData'
import MobileHomeView from '@/components/home/MobileHomeView'
import DesktopHomeView from '@/components/home/DesktopHomeView'

/**
 * Unified Home Page
 * 
 * Merges the immersive PWA mobile experience with the premium 
 * luxury desktop design. Share unified data fetching and logic.
 */
export default function AccueilPage({ initialData }: { initialData?: HomeData }) {
  const data = useHomeData(initialData)

  useEffect(() => {
    window.scrollTo(0, 0)
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
