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

    const { categorie, vedette, search, limit, offset, sort, useFullText } = validatedParams.data

    const resolvedLimit =
      limit ??
      (vedette === true ? FEATURED_LIMIT : DEFAULT_LIMIT)
    const resolvedOffset = offset ?? 0

    let data, error, count
    let usedFullTextSearch = false

    // Use full-text search RPC if search query and useFullText is true
    if (search && useFullText === true) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_products', {
          search_query: search,
          category_filter: categorie || null,
          limit_count: resolvedLimit,
          offset_count: resolvedOffset,
        })

        if (rpcError) {
          console.error('Erreur RPC search_products:', rpcError)
          throw rpcError
        }

        // Transform RPC results to match expected format (remove rank field)
        data = rpcData?.map((item: any) => {
          const { rank, ...product } = item
          return product
        }) || []

        // Get count separately for full-text search
        const { count: fullCount } = await supabase
          .from('produits')
          .select('*', { count: 'exact', head: true })
          .or(`nom.ilike.%${search}%,description.ilike.%${search}%`)
        
        count = fullCount ?? data.length
        usedFullTextSearch = true

        // Log search query for analytics
        if (search.trim()) {
          try {
            await supabase.from('search_queries').insert({
              query: search.trim(),
              results_count: data.length,
            })
          } catch (analyticsError) {
            // Don't fail the request if analytics logging fails
            console.warn('Failed to log search query:', analyticsError)
          }
        }
      } catch (rpcError) {
        console.error('Erreur lors de l\'exécution de search_products RPC:', rpcError)
        // Will fall through to regular search below
      }
    }

    // Regular query path (fallback or when useFullText is false)
    if (!usedFullTextSearch) {
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

      if (sort === 'prix-asc') {
        query = query.order('prix', { ascending: true })
      } else if (sort === 'prix-desc') {
        query = query.order('prix', { ascending: false })
      } else {
        query = query.order('date_ajout', { ascending: false })
      }

      query = query.range(resolvedOffset, resolvedOffset + resolvedLimit - 1)

      // Execute query with better error handling
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

