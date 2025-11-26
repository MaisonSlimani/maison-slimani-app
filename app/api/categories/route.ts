import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const querySchema = z.object({
  slug: z.string().min(1).optional(),
  active: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
})

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const validated = querySchema.safeParse(queryParams)

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { slug, active } = validated.data

    let query = supabase
      .from('categories')
      .select('nom, description, image_url, slug, ordre, active')
      .order('ordre', { ascending: true })

    if (typeof active === 'boolean') {
      query = query.eq('active', active)
    }

    if (slug) {
      query = query.eq('slug', slug).limit(1)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const response = NextResponse.json({
      success: true,
      data: data || [],
    })

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=120'
    )

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des catégories',
      },
      { status: 500 }
    )
  }
}

