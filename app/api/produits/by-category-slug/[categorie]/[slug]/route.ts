import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, date_ajout, slug, average_rating, rating_count'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const revalidate = 300  // 5 minutes (matches other product routes)
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ categorie: string; slug: string }> }
) {
  try {
    const { categorie, slug } = await params
    
    if (!categorie || !slug) {
      return NextResponse.json(
        { success: false, error: 'Catégorie et slug requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First, verify the category exists and get its name
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('nom, slug')
      .eq('slug', categorie)
      .eq('active', true)
      .maybeSingle()

    if (categoryError) {
      throw categoryError
    }

    if (!categoryData) {
      return NextResponse.json(
        { success: false, error: 'Catégorie introuvable' },
        { status: 404 }
      )
    }

    // Now fetch products in this category
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select(PRODUCT_FIELDS)
      .eq('categorie', categoryData.nom)

    if (produitsError) {
      throw produitsError
    }

    // Find product by slug
    const matched = produits?.find(
      (produit) => {
        const productSlug = produit.slug || slugify(produit.nom || '')
        return productSlug === slug
      }
    )

    if (!matched) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable dans cette catégorie' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ success: true, data: matched })
    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    return response
  } catch (error) {
    console.error('Erreur lors de la récupération du produit par catégorie et slug:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération du produit',
      },
      { status: 500 }
    )
  }
}

