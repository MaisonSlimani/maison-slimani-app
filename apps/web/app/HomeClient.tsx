'use client'

import React, { useEffect } from 'react'
import { HomeData } from '@maison/domain'
import { useHomeData } from './useHomeData'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeCategories } from '@/components/home/HomeCategories'
import { HomeMaisonTeaser } from '@/components/home/HomeMaisonTeaser'
import { HomeFeatured } from '@/components/home/HomeFeatured'
import { HomeInspiration } from '@/components/home/HomeInspiration'
import { HomeProcess } from '@/components/home/HomeProcess'
import { HomeContact } from '@/components/home/HomeContact'
import { HomeTrustBar } from '@/components/home/HomeTrustBar'
import { GoldDivider } from '@maison/ui'
import StickyHeader from '@/components/pwa/StickyHeader'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

/**
 * Unified Home Client Page
 * 
 * Single responsive layout that replaces the dual-rendering architecture.
 * Mobile sections use GoldDividers and PWA feel.
 * Desktop sections use larger typography and luxury spacing.
 */
export default function AccueilPage({ initialData }: { initialData?: HomeData }) {
  const data = useHomeData(initialData)
  const { categories, loadingCategories, featuredProducts, loadingFeatured, whatsappNumber } = data

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-ecru md:bg-white overflow-x-hidden">
      {/* Mobile Sticky Header (PWA Feel) */}
      <div className="md:hidden">
        <StickyHeader />
      </div>

      {/* Hero */}
      <HomeHero />

      {/* Mobile Trust Ribbon */}
      <div className="md:hidden bg-charbon text-ecru py-3 text-[11px] tracking-[0.15em] text-center uppercase font-light">
        Livraison Gratuite <span className="text-dore">•</span> Fait Main <span className="text-dore">•</span> Retours 7J
      </div>

      {/* Categories */}
      <HomeCategories categories={categories} loading={loadingCategories} />

      {/* Mobile Divider */}
      <div className="md:hidden">
        <GoldDivider variant="centered" spacing="sm" />
      </div>

      {/* La Maison Cinematic Teaser */}
      <HomeMaisonTeaser />

      {/* Mobile Divider */}
      <div className="md:hidden">
        <GoldDivider variant="centered" withIcon="sparkles" spacing="lg" />
      </div>

      {/* Featured Products */}
      <HomeFeatured products={featuredProducts} loading={loadingFeatured} />

      {/* Mobile Divider */}
      <div className="md:hidden">
        <GoldDivider variant="centered" spacing="sm" />
      </div>

      {/* Inspiration Carousel */}
      <HomeInspiration />

      {/* Mobile Divider */}
      <div className="md:hidden">
        <GoldDivider variant="centered" withIcon="crown" spacing="lg" />
      </div>

      {/* Craftsmanship Process */}
      <HomeProcess />

      {/* Mobile Divider */}
      <div className="md:hidden">
        <GoldDivider variant="centered" withIcon="sparkles" spacing="lg" />
      </div>

      {/* Contact */}
      {whatsappNumber && <HomeContact whatsappNumber={whatsappNumber} />}

      {/* Desktop Trust Bar */}
      <div className="hidden md:block">
        <HomeTrustBar />
      </div>

      {/* Mobile Floating WhatsApp */}
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}`}
          className="md:hidden fixed bottom-24 right-4 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center animate-in fade-in slide-in-from-bottom-5 duration-500"
          aria-label="Contact WhatsApp"
        >
          <WhatsAppIcon className="text-white w-7 h-7" />
        </a>
      )}
    </main>
  )
}
