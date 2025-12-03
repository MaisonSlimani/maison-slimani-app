import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, date_ajout'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const revalidate = 300  // 5 minutes (increased from 60s for better caching)
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('produits')
      .select(PRODUCT_FIELDS)

    if (error) {
      throw error
    }

    const matched = data?.find(
      (produit) => slugify(produit.nom || '') === slug
    )

    if (!matched) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ success: true, data: matched })
    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    return response
  } catch (error) {
    console.error('Erreur lors de la récupération du produit par slug:', error)
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

