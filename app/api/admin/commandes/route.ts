import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

// GET - Récupérer toutes les commandes
export async function GET(request: NextRequest) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer le filtre de statut depuis les query params
    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut')?.trim()

    let query = supabase
      .from('commandes')
      .select('*')
      .order('date_commande', { ascending: false })

    if (statut && statut !== 'tous' && statut !== 'all') {
      // Décode l'URL encoding si nécessaire (ex: "En%20attente" -> "En attente")
      const decodedStatut = decodeURIComponent(statut)
      query = query.eq('statut', decodedStatut)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data || [] })
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

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Utiliser la SERVICE_ROLE_KEY pour contourner RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

