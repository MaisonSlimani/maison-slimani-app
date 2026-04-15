'use client'

import React, { useEffect } from 'react'
import { useProductDetail } from '@/hooks/product/useProductDetail'
import MobileProductDetailView from '@/components/product/MobileProductDetailView'
import DesktopProductDetailView from '@/components/product/DesktopProductDetailView'

import { Product } from '@maison/domain'

interface ProductDetailClientProps {
  initialProduct: Product
}

/**
 * Unified Product Detail Component
 * 
 * Merges high-immersion mobile PWA view with premium luxury 
 * desktop experience. Shares unified state, tracking, and stock logic.
 */
export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const data = useProductDetail(initialProduct)
  const { product } = data

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // Inject Structured Data (Product Schema)
    if (!product) return
    const existingScript = document.getElementById('product-structured-data')
    if (existingScript) existingScript.remove()

    const script = document.createElement('script')
    script.id = 'product-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image_url,
      sku: product.id,
      brand: { '@type': 'Brand', name: 'Maison Slimani' },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'MAD',
        availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: typeof window !== 'undefined' ? window.location.href : '',
      }
    })
    document.head.appendChild(script)
  }, [product])

  if (!product) return null

  return (
    <main className="min-h-screen">
      {/* Mobile View - PWA Design preserved */}
      <div className="block md:hidden">
        <MobileProductDetailView data={data} />
      </div>

      {/* Desktop View - Standard Design */}
      <div className="hidden md:block">
        <DesktopProductDetailView data={data} />
      </div>
    </main>
  )
}
