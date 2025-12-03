import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'
import { createClient } from '@supabase/supabase-js'

async function getAdminEmail(): Promise<string> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return ADMIN_EMAIL // Fallback to env var
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data } = await supabase
      .from('settings')
      .select('email_entreprise')
      .limit(1)
      .single()
    
    // Use email_entreprise from settings, fallback to env var, then default
    return data?.email_entreprise || ADMIN_EMAIL
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'email admin:', error)
    return ADMIN_EMAIL // Fallback to env var
  }
}

const schemaContact = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  message: z.string().min(1, 'Le message est requis'),
})

function buildContactEmail(data: z.infer<typeof schemaContact>) {
  return `
    <h2>Nouveau message de contact</h2>
    <p><strong>Nom :</strong> ${data.nom}</p>
    <p><strong>Email :</strong> ${data.email}</p>
    ${
      data.telephone
        ? `<p><strong>Téléphone :</strong> ${data.telephone}</p>`
        : ''
    }
    <p><strong>Message :</strong></p>
    <p>${data.message}</p>
  `
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = applyRateLimit({
      key: `contact:${identifier}`,
      limit: 5,
      windowMs: 60 * 1000,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: { 'Retry-After': rateLimitResult.retryAfter.toString() },
        }
      )
    }

    const body = await request.json()
    const validatedData = schemaContact.parse(body)

    try {
      const adminEmail = await getAdminEmail()
      await envoyerEmail({
        to: adminEmail,
        subject: `Nouveau message de ${validatedData.nom}`,
        html: buildContactEmail(validatedData),
      })
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email de contact:", emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de l'envoi du formulaire de contact:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
