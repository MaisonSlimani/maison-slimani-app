import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, tailles, date_ajout, average_rating, rating_count'

export const revalidate = 300
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current product's upsell product IDs
    const { data: product, error: productError } = await supabase
      .from('produits')
      .select('upsell_products')
      .eq('id', id)
      .maybeSingle()

    if (productError) {
      throw productError
    }

    if (!product || !product.upsell_products || (product.upsell_products as string[]).length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      })
    }

    // Get upsell products
    const { data: upsellProducts, error: upsellError } = await supabase
      .from('produits')
      .select(PRODUCT_FIELDS)
      .in('id', product.upsell_products as string[])

    if (upsellError) {
      throw upsellError
    }

    const response = NextResponse.json({
      success: true,
      data: upsellProducts || [],
      count: upsellProducts?.length || 0,
    })

    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des upsells:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des upsells',
      },
      { status: 500 }
    )
  }
}

