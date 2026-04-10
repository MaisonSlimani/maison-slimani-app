import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProduitDetailClient from '@/components/ProduitDetailClient'
import { Category, Product } from '@maison/domain'

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

  const { data: categoryData } = await supabase
    .from('categories')
    .select('nom, slug')
    .eq('slug', categorie)
    .eq('active', true)
    .maybeSingle()

  if (!categoryData) return null
  const cat = categoryData as unknown as Category

  const { data: produits } = await supabase
    .from('produits')
    .select('*')
    .eq('categorie', cat.nom)

  if (!produits) return null
  const productList = produits as unknown as Product[]
  const matched = productList.find(p => (p.slug || slugify(p.nom || '')) === slug)

  return matched || null
}

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string; slug: string }> }
): Promise<Metadata> {
  const { categorie, slug } = await params
  const product = await getProduct(categorie, slug)

  if (!product) return { title: 'Produit introuvable', description: "Ce produit n'existe pas." }

  const title = `${product.nom} | Maison Slimani`
  const description = product.description || `Découvrez ${product.nom}.`
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
  const product = await getProduct(categorie, slug)
  if (!product) notFound()
  return <ProduitDetailClient produitInitial={product} />
}
