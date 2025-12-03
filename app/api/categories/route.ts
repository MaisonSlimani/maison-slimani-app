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

    // Execute query with better error handling
    let data, error
    try {
      const result = await query
      data = result.data
      error = result.error
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
    })

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=900'  // 15 minutes (increased from 120s)
    )
    response.headers.set('x-vercel-cache-tags', CATEGORIES_CACHE_TAG)

    return response
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : String(error),
      error,
    })

    // Provide more specific error messages
    let errorMessage = 'Erreur inconnue lors de la récupération des catégories'
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

