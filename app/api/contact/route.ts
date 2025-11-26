import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'

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
      await envoyerEmail({
        to: ADMIN_EMAIL,
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
