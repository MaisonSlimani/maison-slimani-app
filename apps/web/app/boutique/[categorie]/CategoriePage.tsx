'use client'

import React from 'react'
import { useCategoryData } from './useCategoryData'
import MobileCategoryView from '@/components/category/MobileCategoryView'
import DesktopCategoryView from '@/components/category/DesktopCategoryView'

/**
 * Unified Category Page
 * 
 * Merges high-conversion mobile PWA category view with premium
 * luxury desktop experience. Shares unified data fetching and filtering.
 */
export default function CategoriePage() {
  const data = useCategoryData()

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileCategoryView data={data} />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopCategoryView data={data} />
      </div>
    </main>
  )
}
