import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetailClient from '@/components/ProductDetailClient'

import { fetchProductByPath } from '../../../data/fetchProduct'

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
): Promise<Metadata> {
  const { categorie, slug } = await params
  const product = await fetchProductByPath(categorie, slug)

  if (!product) return { title: 'Produit introuvable', description: "Ce produit n'existe pas." }

  const title = `${product.name} | Maison Slimani`
  const description = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Découvrez ${product.name}.`
  const mainImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null)
  const images = mainImage ? [mainImage] : []
  
  const canonicalPath = `/boutique/${categorie}/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: { 
      title, 
      description, 
      images, 
      type: 'website',
      url: canonicalPath,
    },
    twitter: { card: 'summary_large_image', title, description, images }
  }
}

export default async function ProductPage(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
) {
  const { categorie, slug } = await params
  const product = await fetchProductByPath(categorie, slug)
  if (!product) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.maison-slimani.com'
  const imageUrl = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : '')
  const pageUrl = `${siteUrl}/boutique/${categorie}/${slug}`
  
  // Enhanced Product JSON-LD
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageUrl,
    description: product.description?.replace(/<[^>]*>/g, ''), // Strip HTML for JSON-LD
    sku: product.id,
    mpn: product.id,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Maison Slimani'
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'MAD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock !== null && product.stock > 0) 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Maison Slimani'
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient initialProduct={product} />
    </>
  )
}
