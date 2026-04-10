import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema for valid query parameters
// Helper for optional number coercion that handles empty strings
const optionalNumber = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.coerce.number().optional()
)

// Schema for valid query parameters
const querySchema = z.object({
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

import { ProductRepository } from '@maison/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new ProductRepository(supabase)
    
    const searchParams = request.nextUrl.searchParams
    const queryParams = parseSearchParams(searchParams)
    const validationResult = querySchema.safeParse(queryParams)

    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: validationResult.error.flatten() }, { status: 400 })
    }

    const filters = validationResult.data
    const { data: products, count } = await repo.search(filters)

    return NextResponse.json({
      success: true,
      data: products,
      metadata: { count, page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1 }
    })
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

function parseSearchParams(searchParams: URLSearchParams) {
  const queryParams: Record<string, string | string[]> = {}
  searchParams.forEach((val, key) => {
    if (key === 'couleur' || key === 'taille') {
      const existing = queryParams[key]
      queryParams[key] = existing ? (Array.isArray(existing) ? [...existing, val] : [existing, val]) : val
    } else {
      queryParams[key] = val
    }
  })
  return queryParams
}
