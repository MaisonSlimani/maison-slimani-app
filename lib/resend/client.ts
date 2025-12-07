import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors when env var is not set
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        'RESEND_API_KEY is not set. Please add it to your Vercel environment variables. ' +
        'Go to Vercel Dashboard → Settings → Environment Variables → Add RESEND_API_KEY'
      )
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

// Export a proxy that lazily initializes Resend only when used
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const instance = getResend()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@maison-slimani.com'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maison-slimani.com'

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
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      const error = new Error('RESEND_API_KEY is not configured. Email sending is disabled.')
      console.warn('⚠️ Email sending disabled:', error.message)
      throw error
    }

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Erreur Resend API:', {
        name: error.name,
        message: error.message,
        status: (error as any).status,
      })
      throw error
    }

    return data
  } catch (error: any) {
    // Provide more helpful error messages
    if (error?.message?.includes('Unable to fetch data') || error?.message?.includes('could not be resolved')) {
      console.error('Erreur réseau Resend - Impossible de se connecter à l\'API Resend:', {
        message: error.message,
        hint: 'Vérifiez votre connexion internet et que RESEND_API_KEY est correctement configuré',
      })
    } else if (error?.message?.includes('RESEND_API_KEY')) {
      console.error('Configuration Resend manquante:', error.message)
    } else {
      console.error('Erreur lors de l\'envoi de l\'email:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
      })
    }
    throw error
  }
}

