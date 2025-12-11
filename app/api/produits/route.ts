import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Product, ApiResponse } from '@/types'

// Schema for valid query parameters
// Helper for optional number coercion that handles empty strings
const optionalNumber = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.coerce.number().optional()
)

// Schema for valid query parameters
const productQuerySchema = z.object({
  search: z.string().optional(),
  categorie: z.string().optional(),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
  inStock: z.enum(['true', 'false']).optional(),
  couleur: z.string().or(z.array(z.string())).optional(),
  taille: z.string().or(z.array(z.string())).optional(),
  sort: z.enum(['prix_asc', 'prix_desc']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  useFullText: z.enum(['true', 'false']).default('false')
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const queryParams: Record<string, string | string[]> = {}
    searchParams.forEach((value, key) => {
      // Handle array parameters (couleur, taille)
      if (key === 'couleur' || key === 'taille') {
        const existing = queryParams[key]
        if (existing) {
          if (Array.isArray(existing)) {
            existing.push(value)
          } else {
            queryParams[key] = [existing, value]
          }
        } else {
          queryParams[key] = value // Start as single string, schema handles array conversion if needed
        }
      } else {
        queryParams[key] = value
      }
    })

    const validationResult = productQuerySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: validationResult.error.format() },
        { status: 400 }
      )
    }

    const filters = validationResult.data
    const supabase = await createClient()

    // Normalize array filters
    const couleurFilter = Array.isArray(filters.couleur)
      ? filters.couleur
      : filters.couleur
        ? [filters.couleur]
        : null

    const tailleFilter = Array.isArray(filters.taille)
      ? filters.taille
      : filters.taille
        ? [filters.taille]
        : null



    // Call the updated RPC function "search_products"

    const { data: products, error } = await supabase.rpc('search_products', {
      search_query: filters.search || '',
      category_filter: filters.categorie || null,
      min_price: filters.minPrice || null,
      max_price: filters.maxPrice || null,
      in_stock: filters.inStock === 'true' ? true : filters.inStock === 'false' ? false : null,
      couleur_filter: couleurFilter,
      taille_filter: tailleFilter,
      sort_by: filters.sort,
      limit_count: filters.limit,
      offset_count: filters.offset
    })

    if (error) {
      console.error('Supabase RPC Error:', error)
      return NextResponse.json(
        { success: false, error: 'Database error fetching products' },
        { status: 500 }
      )
    }

    // Log analytics if it's a search query
    if (filters.search) {
      // We don't await this to avoid blocking the response
      supabase.from('search_queries').insert({
        query: filters.search,
        results_count: products?.length || 0
      }).then(({ error }) => {
        // Ignore schema errors if table structure is different
        if (error && error.code !== 'PGRST204') {
          console.error('Error logging search query:', error)
        }
      })
    }

    const response: ApiResponse<Product[]> = {
      success: true,
      data: products as Product[],
      metadata: {
        count: products?.length || 0,
        page: Math.floor(filters.offset / filters.limit) + 1,
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
