import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProduitDetailClient from '@/components/ProduitDetailClient'

import { fetchProductByPath } from '../../../data/fetchProduct'

import { slugify } from '@/lib/utils/product-urls'

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
): Promise<Metadata> {
  const { categorie, slug } = await params
  const product = await fetchProductByPath(categorie, slug)

  if (!product) return { title: 'Produit introuvable', description: "Ce produit n'existe pas." }

  const title = `${product.nom} | Maison Slimani`
  const description = product.description?.substring(0, 160) || `Découvrez ${product.nom}.`
  const mainImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null)
  const images = mainImage ? [mainImage] : []

  return {
    title,
    description,
    openGraph: { title, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images }
  }
}

export default async function ProductPage(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
) {
  const { categorie, slug } = await params
  const product = await fetchProductByPath(categorie, slug)
  if (!product) notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maison-slimani.com'
  const imageUrl = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : '')
  
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nom,
    image: imageUrl,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Maison Slimani'
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/boutique/${slugify(product.categorie || '')}/${product.slug}`,
      priceCurrency: 'MAD',
      price: product.prix,
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
      <ProduitDetailClient produitInitial={product} />
    </>
  )
}
