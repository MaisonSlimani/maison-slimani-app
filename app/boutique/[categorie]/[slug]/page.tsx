import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProduitDetailClient from '@/components/ProduitDetailClient'

// Helper to slugify (replicated from API logic to ensure consistency)
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

async function getProduct(categorie: string, slug: string) {
  const supabase = await createClient()

  // 1. Verify category and get its ID/name
  const { data: categoryData } = await supabase
    .from('categories')
    .select('nom, slug')
    .eq('slug', categorie)
    .eq('active', true)
    .maybeSingle()

  if (!categoryData) return null

  // 2. Fetch products in this category
  // We select all fields to ensure the client component has everything it needs.
  // The original API selected a subset, but for a direct DB call, selecting * is safer unless there are huge columns.
  const { data: produits } = await supabase
    .from('produits')
    .select('*')
    .eq('categorie', categoryData.nom)

  if (!produits) return null

  // 3. Find product by slug
  // The API logic did this in memory because slugs might be generated from names if missing.
  const matched = produits.find(
    (produit) => {
      const productSlug = produit.slug || slugify(produit.nom || '')
      return productSlug === slug
    }
  )

  return matched || null
}

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
): Promise<Metadata> {
  const { categorie, slug } = await params
  const product = await getProduct(categorie, slug)

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: "Ce produit n'existe pas."
    }
  }

  const title = `${product.nom} | Maison Slimani`
  const description = product.description || `Découvrez ${product.nom}, une pièce unique de l'artisanat marocain chez Maison Slimani.`

  // Construct image URLs
  const mainImage = product.image_url || (product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : null)

  const images = mainImage ? [mainImage] : []

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    }
  }
}

export default async function ProductPage(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
) {
  const { categorie, slug } = await params
  const product = await getProduct(categorie, slug)

  if (!product) {
    notFound()
  }

  // Pass the data to the Client Component
  return <ProduitDetailClient produitInitial={product} />
}
