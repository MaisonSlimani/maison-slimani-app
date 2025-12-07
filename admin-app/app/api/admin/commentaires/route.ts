import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

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
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filter === 'approved') {
      query = query.eq('approved', true).eq('flagged', false)
    } else if (filter === 'flagged') {
      query = query.eq('flagged', true)
    } else if (filter === 'pending') {
      query = query.eq('approved', false)
    }

    // Apply search
    if (search) {
      query = query.or(`nom.ilike.%${search}%,commentaire.ilike.%${search}%,produits.nom.ilike.%${search}%`)
    }

    const { data, error, count } = await query

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

