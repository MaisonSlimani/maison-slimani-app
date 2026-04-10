import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { Product } from '@maison/domain'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, tailles, date_ajout, average_rating, rating_count'

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requis' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('produits')
      .select(PRODUCT_FIELDS)

    if (error) throw error

    const productList = data as unknown as Product[]
    const matched = productList?.find(p => slugify(p.nom || '') === slug)

    if (!matched) {
      return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 })
    }

    const response = NextResponse.json({ success: true, data: matched })
    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    return response
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
