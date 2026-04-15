import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const instance = getResend()
    const value = (instance as unknown as Record<string, unknown>)[prop as string]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value
  }
})

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@maison-slimani.com'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maison-slimani.com'

function logResendError(error: unknown) {
  const err = error as Record<string, unknown>
  if (typeof err?.message === 'string' && err.message.includes('Unable to fetch data')) {
    console.error('Erreur réseau Resend:', err.message)
  } else {
    console.error('Erreur email:', { name: err?.name, message: err?.message, status: err?.status })
  }
}

export async function envoyerEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
  try {
    const { data, error } = await resend.emails.send({ from: RESEND_FROM_EMAIL, to, subject, html })
    if (error) { logResendError(error); throw error }
    return data
  } catch (error: unknown) {
    logResendError(error); throw error
  }
}
