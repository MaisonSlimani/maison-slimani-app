import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SearchRepository } from '@maison/db'

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
    const supabase = await createClient()
    const repo = new SearchRepository(supabase)
    
    const validated = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()))
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.flatten() }, { status: 400 })
    }

    const { q: query, type = 'all', limit = 5 } = validated.data
    const suggestions = {
      products: [] as import('@maison/db').ProductSuggestion[],
      categories: [] as import('@maison/db').CategorySuggestion[],
      trending: [] as import('@maison/db').TrendingSearch[]
    }

    if (type === 'all' || type === 'trending') {
      suggestions.trending = await repo.getTrendingSearches(limit)
    }

    if (query) {
      if (type === 'all' || type === 'products') {
        suggestions.products = await repo.getProductSuggestions(query, limit)
      }
      if (type === 'all' || type === 'categories') {
        suggestions.categories = await repo.getCategorySuggestions(query, limit)
      }
    }

    const response = NextResponse.json({ success: true, data: suggestions, query })
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30')
    return response
  } catch (error) {
    console.error('Erreur suggestions:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}
