import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES_CACHE_TAG } from '@/lib/cache/tags'

const querySchema = z.object({
  slug: z.string().min(1).optional(),
  active: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
})

export const dynamic = 'force-dynamic'
export const revalidate = 300  // 5 minutes (increased from 60s for better caching)

import { CategoryRepository } from '@maison/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const repo = new CategoryRepository(supabase)

    const { slug, active } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()))

    if (slug) {
      const category = await repo.findBySlug(slug)
      return NextResponse.json({ success: true, data: category ? [category] : [] })
    }

    const categories = active !== undefined ? await repo.findAllActive() : await repo.findAll()

    const response = NextResponse.json({ success: true, data: categories })
    response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=900')
    response.headers.set('x-vercel-cache-tags', CATEGORIES_CACHE_TAG)

    return response
  } catch (error) {
    return handleApiError(error, 'Erreur lors de la récupération des catégories')
  }
}

function handleApiError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error)
  let errorMessage = error instanceof Error ? error.message : String(error)
  let statusCode = 500

  if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('network'))) {
    errorMessage = 'Erreur de connexion réseau.'
    statusCode = 503
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
    },
    { status: statusCode }
  )
}

