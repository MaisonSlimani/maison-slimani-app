import { NextRequest, NextResponse } from 'next/server'
import { commandeEmailSchema, sendCommandeEmails } from '@/lib/emails/send'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = commandeEmailSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload email invalide',
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Fire-and-forget
    sendCommandeEmails(validation.data).catch((error) => {
      console.error("Erreur lors de l'envoi des emails:", error)
    })

    return NextResponse.json({ success: true, queued: true })
  } catch (error) {
    console.error('Erreur lors de la réception du payload email:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    )
  }
}

