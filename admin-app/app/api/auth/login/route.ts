import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPassword } from '@/lib/auth/hash'
import { createAdminSession } from '@/lib/auth/session'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent brute force attacks
    const identifier = getClientIdentifier(request)
    const rateLimitResult = applyRateLimit({
      key: `login:${identifier}`,
      limit: 5, // 5 attempts per window
      windowMs: 15 * 60 * 1000, // 15 minutes
    })

    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { error: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
      response.headers.set('Retry-After', rateLimitResult.retryAfter.toString())
      return response
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Configuration serveur invalide' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
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

    const isValid = await verifyPassword(password, admin.hash_mdp)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

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

