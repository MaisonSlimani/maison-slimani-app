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
    // Create Supabase client with error handling
    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      console.error('Erreur lors de la création du client Supabase:', clientError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de configuration Supabase. Vérifiez les variables d\'environnement.',
          details: clientError instanceof Error ? clientError.message : 'Erreur inconnue',
        },
        { status: 500 }
      )
    }

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

    // Execute query with better error handling
    let data, error, count
    try {
      const result = await query
      data = result.data
      error = result.error
      count = result.count
    } catch (fetchError) {
      console.error('Erreur lors de l\'exécution de la requête Supabase:', fetchError)
      
      // Check if it's a network/fetch error
      if (fetchError instanceof Error && fetchError.message.includes('fetch failed')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Erreur de connexion à la base de données. Vérifiez votre connexion réseau et les variables d\'environnement Supabase.',
            details: fetchError.message,
          },
          { status: 503 }
        )
      }
      
      throw fetchError
    }

    if (error) {
      console.error('Erreur Supabase:', error)
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
    console.error('Erreur lors de la récupération des produits:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : String(error),
      error,
    })

    // Provide more specific error messages
    let errorMessage = 'Erreur inconnue lors de la récupération des produits'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('network')) {
        errorMessage = 'Erreur de connexion réseau. Impossible de se connecter à la base de données.'
        statusCode = 503
      } else if (error.message.includes('Supabase') || error.message.includes('environment')) {
        errorMessage = 'Erreur de configuration. Vérifiez les variables d\'environnement Supabase.'
        statusCode = 500
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined,
      },
      { status: statusCode }
    )
  }
}

