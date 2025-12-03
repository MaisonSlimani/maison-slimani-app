import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Variables Supabase manquantes. Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
  )
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const ORDER_FIELDS =
  'id, nom_client, telephone, email, adresse, ville, produits, total, statut, date_commande'

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

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count ?? data?.length ?? 0,
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error?.message || 'Erreur inconnue' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
        { error: 'ID de la commande requis' },
        { status: 400 }
      )
    }

    // Vérifier si la commande existe
    const { data: commande, error: fetchError } = await supabase
      .from('commandes')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !commande) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // Supprimer la commande
    const { error: deleteError } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Erreur lors de la suppression de la commande' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Commande supprimée avec succès',
    })
  } catch (error: any) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

