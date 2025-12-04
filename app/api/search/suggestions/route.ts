import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  type: z.enum(['all', 'products', 'categories', 'trending']).optional(),
  limit: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive().max(20))
    .optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      console.error('Erreur Supabase client:', clientError)
      return NextResponse.json(
        { success: false, error: 'Erreur de configuration' },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const validated = querySchema.safeParse(queryParams)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { q: query, type = 'all', limit = 5 } = validated.data

    const suggestions: {
      products: Array<{ id: string; nom: string; prix: number; image_url?: string }>
      categories: Array<{ nom: string; slug: string; count: number }>
      trending: Array<{ query: string; count: number }>
    } = {
      products: [],
      categories: [],
      trending: [],
    }

    // Get trending searches (always show if type is 'all' or 'trending')
    if (type === 'all' || type === 'trending') {
      try {
        // Try RPC function first
        const { data: trendingData, error: trendingError } = await supabase.rpc(
          'get_trending_searches',
          { limit_count: limit }
        )

        if (!trendingError && trendingData) {
          suggestions.trending = trendingData.map((t: any) => ({
            query: t.query,
            count: Number(t.search_count),
          }))
        }
      } catch {
        // RPC not available, use direct query with same filters
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: fallbackTrending } = await supabase
          .from('search_queries')
          .select('query')
          .gt('results_count', 0)
          .gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: false })
          .limit(100) // Get more to filter properly

        if (fallbackTrending) {
          // Count occurrences and apply filters
          const counts: Record<string, number> = {}
          fallbackTrending.forEach((item: any) => {
            const q = item.query?.trim() || ''
            // Apply same filters as SQL function:
            // - Minimum 4 characters
            // - Must contain at least one alphanumeric character
            if (q.length >= 4 && /[a-zA-Z0-9]/.test(q)) {
              const normalized = q.toLowerCase()
              counts[normalized] = (counts[normalized] || 0) + 1
            }
          })

          // Filter by minimum search count (3) and sort
          suggestions.trending = Object.entries(counts)
            .filter(([_, count]) => count >= 3) // Must be searched at least 3 times
            .sort((a, b) => {
              // Sort by count descending, then by query ascending
              if (b[1] !== a[1]) return b[1] - a[1]
              return a[0].localeCompare(b[0])
            })
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }))
        }
      }
    }

    // If no query provided, return trending only
    if (!query) {
      return NextResponse.json({
        success: true,
        data: suggestions,
      })
    }

    // Get product suggestions
    if (type === 'all' || type === 'products') {
      try {
        // Try RPC function first
        const { data: productData, error: productError } = await supabase.rpc(
          'get_product_suggestions',
          { search_prefix: query, limit_count: limit }
        )

        if (!productError && productData && productData.length > 0) {
          // Get full product details
          const productIds = productData.map((p: any) => p.product_id)
          const { data: fullProducts } = await supabase
            .from('produits')
            .select('id, nom, prix, image_url')
            .in('id', productIds)

          if (fullProducts) {
            suggestions.products = fullProducts
          }
        } else {
          // Fallback to direct ILIKE query
          const { data: fallbackProducts } = await supabase
            .from('produits')
            .select('id, nom, prix, image_url')
            .or(`nom.ilike.${query}%,nom.ilike.%${query}%`)
            .order('vedette', { ascending: false })
            .limit(limit)

          if (fallbackProducts) {
            suggestions.products = fallbackProducts
          }
        }
      } catch {
        // Direct fallback query
        const { data: fallbackProducts } = await supabase
          .from('produits')
          .select('id, nom, prix, image_url')
          .or(`nom.ilike.${query}%,nom.ilike.%${query}%`)
          .order('vedette', { ascending: false })
          .limit(limit)

        if (fallbackProducts) {
          suggestions.products = fallbackProducts
        }
      }
    }

    // Get category suggestions
    if (type === 'all' || type === 'categories') {
      try {
        // Try RPC function first
        const { data: categoryData, error: categoryError } = await supabase.rpc(
          'get_category_suggestions',
          { search_term: query, limit_count: limit }
        )

        if (!categoryError && categoryData && categoryData.length > 0) {
          suggestions.categories = categoryData.map((c: any) => ({
            nom: c.category_name,
            slug: c.category_slug,
            count: Number(c.product_count),
          }))
        } else {
          // Fallback to direct query
          const { data: fallbackCategories } = await supabase
            .from('categories')
            .select('nom, slug')
            .eq('active', true)
            .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
            .order('ordre')
            .limit(limit)

          if (fallbackCategories) {
            // Get product counts
            for (const cat of fallbackCategories) {
              const { count } = await supabase
                .from('produits')
                .select('*', { count: 'exact', head: true })
                .eq('categorie', cat.nom)

              suggestions.categories.push({
                nom: cat.nom,
                slug: cat.slug,
                count: count || 0,
              })
            }
          }
        }
      } catch {
        // Direct fallback
        const { data: fallbackCategories } = await supabase
          .from('categories')
          .select('nom, slug')
          .eq('active', true)
          .or(`nom.ilike.%${query}%,description.ilike.%${query}%`)
          .order('ordre')
          .limit(limit)

        if (fallbackCategories) {
          suggestions.categories = fallbackCategories.map((c: any) => ({
            nom: c.nom,
            slug: c.slug,
            count: 0,
          }))
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      data: suggestions,
      query,
    })

    // Short cache for suggestions
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30')

    return response
  } catch (error) {
    console.error('Erreur suggestions:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}

