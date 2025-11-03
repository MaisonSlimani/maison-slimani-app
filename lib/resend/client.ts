import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@maisonslimani.com'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maisonslimani.com'

/**
 * Envoie un email via Resend
 */
export async function envoyerEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    throw error
  }
}

