import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminSession } from '@/lib/auth/session'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// GET - Récupérer les paramètres (public, pas besoin d'être admin)
export async function GET() {
  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (error) throw error

    return NextResponse.json({ data: data || null })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres (admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    // Vérifier la session admin
    const email = await verifyAdminSession()
    if (!email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email_entreprise, telephone, adresse, description } = body

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    // Récupérer d'abord la ligne existante pour obtenir son ID
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError
    }

    // Si une ligne existe, la mettre à jour, sinon en créer une nouvelle
    let result
    if (existingSettings) {
      // Mettre à jour la ligne existante
      const { data, error } = await supabase
        .from('settings')
        .update({
          email_entreprise: email_entreprise || null,
          telephone: telephone || null,
          adresse: adresse || null,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Créer une nouvelle ligne si elle n'existe pas
      const { data, error } = await supabase
        .from('settings')
        .insert({
          email_entreprise: email_entreprise || null,
          telephone: telephone || null,
          adresse: adresse || null,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ data: result, message: 'Paramètres mis à jour avec succès' })
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

