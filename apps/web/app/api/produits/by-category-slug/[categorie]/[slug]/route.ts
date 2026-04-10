import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { Product, Category } from '@maison/domain'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, tailles, date_ajout, slug, average_rating, rating_count'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ categorie: string; slug: string }> }
) {
  try {
    const { categorie, slug } = await params
    
    if (!categorie || !slug) {
      return NextResponse.json({ success: false, error: 'Catégorie et slug requis' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Get Category
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('nom, slug')
      .eq('slug', categorie)
      .eq('active', true)
      .maybeSingle()

    if (categoryError) throw categoryError
    if (!categoryData) {
      return NextResponse.json({ success: false, error: 'Catégorie introuvable' }, { status: 404 })
    }

    const cat = categoryData as unknown as Category

    // 2. Fetch products in this category
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select(PRODUCT_FIELDS)
      .eq('categorie', cat.nom)

    if (produitsError) throw produitsError

    // 3. Find product by slug
    const productList = produits as unknown as Product[]
    const matched = productList?.find(p => (p.slug || slugify(p.nom || '')) === slug)

    if (!matched) {
      return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 })
    }

    const response = NextResponse.json({ success: true, data: matched })
    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    return response
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
