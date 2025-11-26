import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { produitQuerySchema } from '@/lib/validations'

const DEFAULT_LIMIT = 20
const FEATURED_LIMIT = 6
const FEATURED_CACHE_SECONDS = 300
const CATEGORY_CACHE_SECONDS = 120
const PRODUIT_FIELDS =
  'id, nom, description, prix, stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, date_ajout'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const validatedParams = produitQuerySchema.safeParse(queryParams)

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: validatedParams.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { categorie, vedette, search, limit, offset, sort } = validatedParams.data

    let query = supabase
      .from('produits')
      .select(PRODUIT_FIELDS, { count: 'exact' })

    if (categorie) {
      query = query.eq('categorie', categorie)
    }

    if (vedette !== undefined) {
      query = query.eq('vedette', vedette)
    }

    // Search functionality - search in nom and description
    if (search) {
      query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const resolvedLimit =
      limit ??
      (vedette === true ? FEATURED_LIMIT : DEFAULT_LIMIT)
    const resolvedOffset = offset ?? 0

    if (sort === 'prix-asc') {
      query = query.order('prix', { ascending: true })
    } else if (sort === 'prix-desc') {
      query = query.order('prix', { ascending: false })
    } else {
      query = query.order('date_ajout', { ascending: false })
    }

    query = query.range(resolvedOffset, resolvedOffset + resolvedLimit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const response = NextResponse.json({
      success: true,
      data: data || [],
      count: count ?? data?.length ?? 0,
    })

    const cacheSeconds =
      vedette === true ? FEATURED_CACHE_SECONDS : CATEGORY_CACHE_SECONDS

    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`
    )
    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue lors de la récupération des produits',
      },
      { status: 500 }
    )
  }
}

