import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { commentaireSchema } from '@/lib/validations'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'
import { generateSessionToken, setSessionToken, getSessionToken } from '@/lib/utils/comment-session'
import { shouldFlagAsSpam } from '@/lib/utils/spam-detection'

export const dynamic = 'force-dynamic'

/**
 * GET /api/commentaires?produit_id=xxx
 * Get comments for a product
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const produitId = searchParams.get('produit_id')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!produitId) {
      return NextResponse.json(
        { success: false, error: 'produit_id est requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user's session token to check ownership
    const userSessionToken = await getSessionToken()

    let query = supabase
      .from('commentaires')
      .select('id, nom, email, rating, commentaire, images, created_at, updated_at, session_token')
      .eq('produit_id', produitId)
      .eq('approved', true)
      .range(offset, offset + limit - 1)

    // Apply sorting
    if (sort === 'highest') {
      query = query.order('rating', { ascending: false })
    } else if (sort === 'lowest') {
      query = query.order('rating', { ascending: true })
    } else {
      // newest (default)
      query = query.order('created_at', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erreur lors de la récupération des commentaires:', error)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des commentaires' },
        { status: 500 }
      )
    }

    // Add ownership flag without exposing session_token
    const commentsWithOwnership = (data || []).map((comment: any) => {
      const { session_token, ...commentWithoutToken } = comment
      return {
        ...commentWithoutToken,
        canEdit: userSessionToken && session_token === userSessionToken,
      }
    })

    return NextResponse.json({
      success: true,
      data: commentsWithOwnership,
      count: count || 0,
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/commentaires
 * Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 comments per hour per IP
    const identifier = getClientIdentifier(request)
    const rateLimitResult = applyRateLimit({
      key: `commentaires:${identifier}`,
      limit: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Trop de commentaires. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter.toString() },
        }
      )
    }

    const body = await request.json()
    const validation = commentaireSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { produit_id, nom, email, rating, commentaire, images } = validation.data

    // Verify product exists
    const supabase = await createClient()
    const { data: produit, error: produitError } = await supabase
      .from('produits')
      .select('id')
      .eq('id', produit_id)
      .single()

    if (produitError || !produit) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Validate images array
    const imagesArray = images && Array.isArray(images) ? images.filter(Boolean) : []
    if (imagesArray.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Maximum 6 images autorisées' },
        { status: 400 }
      )
    }

    // Check for spam
    const flagged = shouldFlagAsSpam(commentaire)

    // Generate session token for user ownership
    const sessionToken = generateSessionToken()

    // Insert comment
    const { data: newComment, error: insertError } = await supabase
      .from('commentaires')
      .insert({
        produit_id,
        nom: nom.trim(),
        email: email?.trim() || null,
        rating,
        commentaire: commentaire.trim(),
        images: imagesArray.length > 0 ? imagesArray : [],
        session_token: sessionToken,
        flagged,
        approved: true, // Auto-approve, but flag if suspicious
      })
      .select('id, nom, rating, commentaire, images, created_at')
      .single()

    if (insertError) {
      console.error('Erreur lors de la création du commentaire:', insertError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du commentaire' },
        { status: 500 }
      )
    }

    // Set session token in cookie
    await setSessionToken(sessionToken)

    return NextResponse.json({
      success: true,
      data: newComment,
      session_token: sessionToken, // Also return in response for client-side storage
    })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

