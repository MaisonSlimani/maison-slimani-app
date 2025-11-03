import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schemaContact = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  message: z.string().min(1, 'Le message est requis'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = schemaContact.parse(body)

    // Appeler l'Edge Function pour envoyer l'email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseKey) {
      try {
        const emailUrl = new URL('/functions/v1/envoyerEmailCommande', supabaseUrl)
        await fetch(emailUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            type: 'contact',
            ...validatedData,
          }),
        })
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError)
        // Ne pas faire échouer la requête si l'email échoue
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire de contact:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

