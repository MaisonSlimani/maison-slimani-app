import { NextResponse } from 'next/server'
import { SettingsRepository, createClient } from '@maison/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const settingsRepo = new SettingsRepository(supabase)
    const data = await settingsRepo.getEnterpriseSettings()
    
    if (!data) {
      return NextResponse.json({ success: false, error: 'Paramètres introuvables' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
