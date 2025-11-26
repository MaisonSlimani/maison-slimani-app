import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Variables Supabase manquantes pour les routes admin commandes. Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const ORDER_FIELDS =
  'id, nom_client, telephone, adresse, ville, produits, total, statut, date_commande'

// GET - Récupérer toutes les commandes
export async function GET(request: NextRequest) {
  try {
    // Vérifier la session admin
    let email: string | null = null
    try {
      email = await verifyAdminSession()
    } catch (authError) {
      console.error('Erreur lors de la vérification de la session:', authError)
      return NextResponse.json(
        { error: 'Erreur d\'authentification', details: 'Impossible de vérifier la session' },
        { status: 500 }
      )
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut')?.trim()
    const limitParam = Number(searchParams.get('limit'))
    const offsetParam = Number(searchParams.get('offset'))
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 50
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0

    let query = supabase
      .from('commandes')
      .select(ORDER_FIELDS, { count: 'exact' })
      .order('date_commande', { ascending: false })
      .range(offset, offset + limit - 1)

    if (statut && statut !== 'tous' && statut !== 'all') {
      const decodedStatut = decodeURIComponent(statut)
      query = query.eq('statut', decodedStatut)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes', details: error.message },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data: data || [],
      count: count ?? data?.length ?? 0,
    })

    response.headers.set(
      'Cache-Control',
      'private, s-maxage=30, stale-while-revalidate=30'
    )

    return response
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le statut d'une commande
export async function PUT(request: NextRequest) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, statut } = body

    if (!id || !statut) {
      return NextResponse.json(
        { error: 'ID et statut requis' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la commande' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une commande
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur lors de la suppression de la commande:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de la commande' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

