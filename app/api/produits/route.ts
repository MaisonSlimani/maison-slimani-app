import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { produitQuerySchema } from '@/lib/validations'

const DEFAULT_LIMIT = 20
const FEATURED_LIMIT = 6
const FEATURED_CACHE_SECONDS = 1800  // 30 minutes (increased from 300s for better caching)
const CATEGORY_CACHE_SECONDS = 900   // 15 minutes (increased from 120s for better caching)
const PRODUIT_FIELDS =
  'id, nom, description, prix, stock, total_stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, tailles, date_ajout, slug, average_rating, rating_count'

export const dynamic = 'force-dynamic'
export const revalidate = 300  // 5 minutes (increased from 60s for better caching)

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

    const { categorie, vedette, search, limit, offset, sort, useFullText, minPrice, maxPrice, taille, inStock, couleur } = validatedParams.data

    const resolvedLimit =
      limit ??
      (vedette === true ? FEATURED_LIMIT : DEFAULT_LIMIT)
    const resolvedOffset = offset ?? 0

    let data, error, count
    let usedFullTextSearch = false

    // Use full-text search RPC if search query and useFullText is true
    if (search && useFullText === true) {
      try {
        // For full-text search, use first category if multiple are provided
        // (RPC function only accepts single category)
        const categoryFilter = Array.isArray(categorie) && categorie.length > 0 
          ? categorie[0] 
          : (typeof categorie === 'string' ? categorie : null)
        
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_products', {
          search_query: search,
          category_filter: categoryFilter,
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

        // Apply filters to full-text search results
        if (minPrice !== undefined) {
          data = data.filter((p: any) => p.prix >= minPrice)
        }
        if (maxPrice !== undefined) {
          data = data.filter((p: any) => p.prix <= maxPrice)
        }
        if (taille && Array.isArray(taille) && taille.length > 0) {
          data = data.filter((p: any) => {
            // Check if product has any of the selected tailles
            // 1. Check product.taille field (comma-separated string like "40, 41, 42")
            if (p.taille) {
              const productTailles = p.taille.split(',').map((t: string) => t.trim())
              if (taille.some((selectedTaille: string) => productTailles.includes(selectedTaille))) {
                return true
              }
            }
            // 2. Check couleurs array - each couleur can have a taille field
            if (p.has_colors && p.couleurs && Array.isArray(p.couleurs)) {
              for (const couleur of p.couleurs) {
                if (couleur.taille) {
                  const couleurTailles = couleur.taille.split(',').map((t: string) => t.trim())
                  if (taille.some((selectedTaille: string) => couleurTailles.includes(selectedTaille))) {
                    return true
                  }
                }
              }
            }
            return false
          })
        }
        // Filter by stock status (including products with colors)
        // Use total_stock which correctly handles products with colors
        // By default, show all products (in-stock and out-of-stock)
        // Only filter when explicitly requested via inStock parameter
        if (inStock === true) {
          // Show only in-stock products
          data = data.filter((p: any) => (p.total_stock || 0) > 0)
        } else if (inStock === false) {
          // Show only out-of-stock products
          data = data.filter((p: any) => (p.total_stock || 0) === 0)
        }
        // If inStock is undefined, show all products (no filtering)
        // Apply category filter if multiple categories were provided
        if (Array.isArray(categorie) && categorie.length > 0) {
          data = data.filter((p: any) => categorie.includes(p.categorie))
        }
        
        if (couleur) {
          const couleurArray = Array.isArray(couleur) ? couleur : [couleur]
          data = data.filter((product: any) => {
            if (!product.has_colors || !product.couleurs) return false
            try {
              const couleurs = typeof product.couleurs === 'string' 
                ? JSON.parse(product.couleurs) 
                : product.couleurs
              if (Array.isArray(couleurs)) {
                return couleurs.some((c: any) => 
                  couleurArray.some((selectedColor: string) =>
                    c.nom?.toLowerCase() === selectedColor.toLowerCase()
                  )
                )
              }
              return false
            } catch {
              return false
            }
          })
        }

        // Get count separately for full-text search
        const { count: fullCount } = await supabase
          .from('produits')
          .select('*', { count: 'exact', head: true })
          .or(`nom.ilike.%${search}%,description.ilike.%${search}%`)
        
        count = data.length // Use filtered count
        usedFullTextSearch = true

        // Log search query for analytics (only meaningful queries)
        const trimmedSearch = search.trim()
        // Only log queries that are at least 4 characters and contain alphanumeric characters
        if (trimmedSearch.length >= 4 && /[a-zA-Z0-9]/.test(trimmedSearch)) {
          try {
            await supabase.from('search_queries').insert({
              query: trimmedSearch,
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
        if (Array.isArray(categorie) && categorie.length > 0) {
          query = query.in('categorie', categorie)
        } else if (typeof categorie === 'string') {
          query = query.eq('categorie', categorie)
        }
      }

      if (vedette !== undefined) {
        query = query.eq('vedette', vedette)
      }

      // Search functionality - search in nom and description
      if (search) {
        query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Price range filter
      if (minPrice !== undefined) {
        query = query.gte('prix', minPrice)
      }
      if (maxPrice !== undefined) {
        query = query.lte('prix', maxPrice)
      }

      // Taille filter - will be applied after fetching since taille can be in multiple places
      // (product.taille field or in couleurs array)

      // Stock filter - by default, show all products (in-stock and out-of-stock)
      // Use total_stock which correctly handles products with colors
      // Only filter when explicitly requested via inStock parameter
      if (inStock === true) {
        // Show only in-stock products
        query = query.gt('total_stock', 0)
      } else if (inStock === false) {
        // Show only out-of-stock products
        query = query.eq('total_stock', 0)
      }
      // If inStock is undefined, show all products (no filtering)

      // Note: Color filter will be applied after fetching, as colors are stored in JSONB
      // This is handled in the post-processing step below

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

        // Apply taille filter post-query (check tailles array with stock > 0)
        if (taille && Array.isArray(taille) && taille.length > 0 && data) {
          data = data.filter((p: any) => {
            // Check if product has any of the selected tailles with stock > 0
            // 1. Check product.tailles array (new structure)
            if (p.tailles && Array.isArray(p.tailles)) {
              const hasTailleWithStock = p.tailles.some((t: any) => 
                t.nom && taille.includes(t.nom) && t.stock > 0
              )
              if (hasTailleWithStock) return true
            }
            // 2. Backward compatibility: Check product.taille field (comma-separated string)
            if (p.taille) {
              const productTailles = p.taille.split(',').map((t: string) => t.trim())
              if (taille.some((selectedTaille: string) => productTailles.includes(selectedTaille))) {
                return true
              }
            }
            // 2. Check couleurs array - each couleur can have a taille field
            if (p.has_colors && p.couleurs && Array.isArray(p.couleurs)) {
              for (const couleur of p.couleurs) {
                if (couleur.taille) {
                  const couleurTailles = couleur.taille.split(',').map((t: string) => t.trim())
                  if (taille.some((selectedTaille: string) => couleurTailles.includes(selectedTaille))) {
                    return true
                  }
                }
              }
            }
            return false
          })
          // Update count after filtering
          count = data.length
        }

        // Filter by stock status if explicitly requested
        // By default, show all products (in-stock and out-of-stock)
        if (data && inStock === true) {
          // Show only in-stock products when explicitly requested
          data = data.filter((product: any) => (product.total_stock || 0) > 0)
          // Update count after filtering
          count = data.length
        } else if (data && inStock === false) {
          // Show only out-of-stock products when explicitly requested
          data = data.filter((product: any) => (product.total_stock || 0) === 0)
          // Update count after filtering
          count = data.length
        }
        // If inStock is undefined, show all products (no filtering)

        // Apply color filter post-query (colors are in JSONB)
        if (couleur && data) {
          const couleurArray = Array.isArray(couleur) ? couleur : [couleur]
          data = data.filter((product: any) => {
            if (!product.has_colors || !product.couleurs) return false
            try {
              const couleurs = typeof product.couleurs === 'string' 
                ? JSON.parse(product.couleurs) 
                : product.couleurs
              if (Array.isArray(couleurs)) {
                return couleurs.some((c: any) => 
                  couleurArray.some((selectedColor: string) =>
                    c.nom?.toLowerCase() === selectedColor.toLowerCase()
                  )
                )
              }
              return false
            } catch {
              return false
            }
          })
          // Update count after filtering
          count = data.length
        }
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

