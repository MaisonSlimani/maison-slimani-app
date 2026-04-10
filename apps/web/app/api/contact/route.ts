import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client'
import { applyRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limit'
import { ContactRepository, createClient } from '@maison/db'

const schemaContact = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  message: z.string().min(1, 'Le message est requis'),
})

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request)
    const rateLimitResult = applyRateLimit({ key: `contact:${identifier}`, limit: 5, windowMs: 60 * 1000 })
    if (!rateLimitResult.success) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

    const body = await request.json()
    const validatedData = schemaContact.parse(body)

    const supabase = await createClient()
    const contactRepo = new ContactRepository(supabase)
    const settings = await contactRepo.getSettings()
    const adminEmail = settings?.email_entreprise || ADMIN_EMAIL

    await envoyerEmail({
      to: adminEmail,
      subject: `Nouveau message de ${validatedData.nom}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${validatedData.nom}</p>
        <p><strong>Email :</strong> ${validatedData.email}</p>
        ${validatedData.telephone ? `<p><strong>Téléphone :</strong> ${validatedData.telephone}</p>` : ''}
        <p><strong>Message :</strong></p>
        <p>${validatedData.message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
