'use client'

import React from 'react'
import type { HomeViewData } from '@/types/views'
import { HomeHero } from './HomeHero'
import { HomeCategories } from './HomeCategories'
import { HomeFeatured } from './HomeFeatured'
import { HomeSavoirFaire } from './HomeSavoirFaire'
import { HomeContact } from './HomeContact'
import { HomeTrustBar } from './HomeTrustBar'

export default function DesktopHomeView({ data }: { data: HomeViewData }) {
  const { categories, loadingCategories, featuredProducts, loadingFeatured, whatsappNumber } = data

  return (
    <div className="overflow-x-hidden">
      <HomeHero />
      <HomeCategories categories={categories} loading={loadingCategories} />
      <HomeFeatured products={featuredProducts} loading={loadingFeatured} />
      <HomeSavoirFaire />
      {whatsappNumber && <HomeContact whatsappNumber={whatsappNumber} />}
      <HomeTrustBar />
    </div>
  )
}
