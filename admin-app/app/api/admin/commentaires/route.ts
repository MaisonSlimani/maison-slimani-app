import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const adminCreateCommentSchema = z.object({
  produit_id: z.string().uuid('ID produit invalide'),
  nom: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  email: z.string().email('Email invalide').optional().nullable(),
  rating: z.number().int().min(1, 'La note doit être entre 1 et 5').max(5, 'La note doit être entre 1 et 5'),
  commentaire: z.string().min(1, 'Le commentaire est requis').max(2000, 'Le commentaire est trop long'),
  images: z.array(z.string().url('URL d\'image invalide')).max(6, 'Maximum 6 images autorisées').optional(),
  approved: z.boolean().optional().default(true),
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables Supabase manquantes')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * GET /api/admin/commentaires
 * Get all comments with filters
 */
export async function GET(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, approved, flagged, pending
    const search = searchParams.get('search')?.trim()
    const limitParam = Number(searchParams.get('limit'))
    const offsetParam = Number(searchParams.get('offset'))
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 50
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0

    let query = supabase
      .from('commentaires')
      .select(`
        id,
        produit_id,
        nom,
        email,
        rating,
        commentaire,
        images,
        flagged,
        approved,
        created_at,
        updated_at,
        produits!inner(nom, categorie)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filter === 'approved') {
      query = query.eq('approved', true).eq('flagged', false)
    } else if (filter === 'flagged') {
      query = query.eq('flagged', true)
    } else if (filter === 'pending') {
      query = query.eq('approved', false)
    }

    // Apply search - only search in comment fields (can't use .or() with joined table fields)
    if (search) {
      query = query.or(`nom.ilike.%${search}%,commentaire.ilike.%${search}%`)
    }

    // Get all matching results first (for counting and filtering)
    const { data: allData, error: queryError } = await query

    if (queryError) {
      console.error('Erreur lors de la récupération des commentaires:', queryError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commentaires', details: queryError.message },
        { status: 500 }
      )
    }

    // Filter by product name if search is provided (since we can't use .or() with joined fields)
    let filteredData = allData || []
    if (search && allData) {
      const searchLower = search.toLowerCase()
      filteredData = allData.filter((comment: any) => {
        const commentMatches = 
          comment.nom?.toLowerCase().includes(searchLower) ||
          comment.commentaire?.toLowerCase().includes(searchLower)
        const productMatches = 
          comment.produits?.nom?.toLowerCase().includes(searchLower) ||
          comment.produits?.categorie?.toLowerCase().includes(searchLower)
        return commentMatches || productMatches
      })
    }

    // Apply pagination
    const totalCount = filteredData.length
    const paginatedData = filteredData.slice(offset, offset + limit)

    const { data, error, count } = { data: paginatedData, error: null, count: totalCount }

    if (error) {
      console.error('Erreur lors de la récupération des commentaires:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commentaires', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/commentaires
 * Create a new comment (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = adminCreateCommentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Données invalides',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { produit_id, nom, email: commentEmail, rating, commentaire, images, approved } = validation.data

    // Verify product exists
    const { data: produit, error: produitError } = await supabase
      .from('produits')
      .select('id')
      .eq('id', produit_id)
      .single()

    if (produitError || !produit) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Validate images array
    const imagesArray = images && Array.isArray(images) ? images.filter(Boolean) : []
    if (imagesArray.length > 6) {
      return NextResponse.json(
        { error: 'Maximum 6 images autorisées' },
        { status: 400 }
      )
    }

    // Generate session token for admin-created comments
    const sessionToken = randomUUID()

    // Insert comment
    const { data: newComment, error: insertError } = await supabase
      .from('commentaires')
      .insert({
        produit_id,
        nom: nom.trim(),
        email: commentEmail?.trim() || null,
        rating,
        commentaire: commentaire.trim(),
        images: imagesArray.length > 0 ? imagesArray : [],
        session_token: sessionToken,
        approved: approved ?? true,
        flagged: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur lors de la création du commentaire:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du commentaire', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: newComment,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/commentaires
 * Bulk delete comments (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs requis' },
        { status: 400 }
      )
    }

    // Validate all IDs are UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!ids.every((id: string) => uuidRegex.test(id))) {
      return NextResponse.json(
        { error: 'IDs invalides' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('commentaires')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Erreur lors de la suppression des commentaires:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des commentaires', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} commentaire(s) supprimé(s)`,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

