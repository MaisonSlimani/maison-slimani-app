import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/hash'
import { createAdminSession } from '@/lib/auth/session'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Récupérer l'admin depuis la base de données
    const { data: admin, error } = await supabase
      .from('admins')
      .select('email, hash_mdp')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, admin.hash_mdp)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer la session
    await createAdminSession(email)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

