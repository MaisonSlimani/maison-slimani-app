import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS_CACHE_TAG } from '@/lib/cache/tags'
import { RECOMMENDATIONS_CONFIG } from '@/lib/config/recommendations'

const PRODUCT_FIELDS =
  'id, nom, description, prix, stock, total_stock, categorie, vedette, image_url, images, couleurs, has_colors, taille, date_ajout, average_rating, rating_count'

// Next.js requires revalidate to be a literal value, not a computed one
export const revalidate = 300 // 5 minutes (matches RECOMMENDATIONS_CONFIG.cacheTTL)
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
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

    // Get limit from query params, default to config
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10)), 20) // Clamp between 1 and 20
      : RECOMMENDATIONS_CONFIG.defaultLimit

    const supabase = await createClient()

    // First, get the current product to determine similarity criteria
    const { data: currentProduct, error: productError } = await supabase
      .from('produits')
      .select('id, categorie, prix, vedette, stock, has_colors, couleurs')
      .eq('id', id)
      .maybeSingle()

    if (productError) {
      throw productError
    }

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Calculate price range (±20%)
    const priceMin = currentProduct.prix * (1 - RECOMMENDATIONS_CONFIG.priceRangeTolerance)
    const priceMax = currentProduct.prix * (1 + RECOMMENDATIONS_CONFIG.priceRangeTolerance)

    // Build the query for similar products
    const query = supabase
      .from('produits')
      .select(PRODUCT_FIELDS)
      .eq('categorie', currentProduct.categorie) // Same category
      .neq('id', id) // Exclude current product

    // Note: Out-of-stock filtering for products with colors will be done in post-processing
    // because stock is stored in the JSONB couleurs array

    // Execute query
    const { data: allSimilar, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    if (!allSimilar || allSimilar.length === 0) {
      const response = NextResponse.json({
        success: true,
        data: [],
        count: 0,
      })
      response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
      response.headers.set(
        'Cache-Control',
        `public, s-maxage=${RECOMMENDATIONS_CONFIG.cacheTTL}, stale-while-revalidate=${RECOMMENDATIONS_CONFIG.staleWhileRevalidate}`
      )
      return response
    }

    // Score and filter products
    const scoredProducts = allSimilar
      .map((product) => {
        let score = 0

        // Price similarity: +2 points if within ±20% price range
        if (product.prix >= priceMin && product.prix <= priceMax) {
          score += 2
        }

        // Featured products: +1 point
        if (product.vedette) {
          score += 1
        }

        // Stock availability: prioritize in-stock products
        // Use total_stock which correctly handles products with colors
        const isInStock = (product.total_stock || 0) > 0

        // Include all products (in-stock and out-of-stock)
        // Out-of-stock products will be shown with overlay on frontend
        if (isInStock) {
          score += 1
        }

        return {
          ...product,
          _score: score,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => {
        // Sort by score DESC, then by date_ajout DESC (newest first)
        if (b._score !== a._score) {
          return b._score - a._score
        }
        const dateA = new Date(a.date_ajout).getTime()
        const dateB = new Date(b.date_ajout).getTime()
        return dateB - dateA
      })
      .slice(0, limit)
      .map(({ _score, ...product }) => product) // Remove score from response

    const response = NextResponse.json({
      success: true,
      data: scoredProducts,
      count: scoredProducts.length,
    })

    response.headers.set('x-vercel-cache-tags', PRODUCTS_CACHE_TAG)
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${RECOMMENDATIONS_CONFIG.cacheTTL}, stale-while-revalidate=${RECOMMENDATIONS_CONFIG.staleWhileRevalidate}`
    )

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des produits similaires:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des produits similaires',
      },
      { status: 500 }
    )
  }
}

