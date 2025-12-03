import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public endpoint to fetch settings (no authentication required)
export async function GET() {
  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('settings')
      .select('email_entreprise, telephone, adresse, description, facebook, instagram, meta_pixel_code')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({ 
      success: true,
      data: data || null 
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Erreur serveur',
        data: null
      },
      { status: 500 }
    )
  }
}

