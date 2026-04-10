import { Resend } from 'resend'
import { CommandeEmailPayload } from './types'
import { buildClientConfirmationTemplate, buildAdminNotificationTemplate } from './templates'
import { ContactRepository, createClient } from '@maison/db'
import { ADMIN_EMAIL } from '@/lib/resend/client'

// Lazily initialized — not at module scope so it doesn't crash during Next.js build analysis
let resendInstance: Resend | null = null
const getResend = () => {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

export async function sendCommandeEmails(payload: CommandeEmailPayload) {
  try {
    const supabase = await createClient()
    const contactRepo = new ContactRepository(supabase)
    const settings = await contactRepo.getSettings()
    const adminEmail = settings?.email_entreprise || ADMIN_EMAIL

    // 1. Send to Client
    if (payload.client_email) {
      await getResend().emails.send({
        from: process.env.EMAIL_FROM || 'Maison Slimani <onboarding@resend.dev>',
        to: payload.client_email,
        subject: `Confirmation de votre commande #${payload.id}`,
        html: buildClientConfirmationTemplate(payload),
      })
    }

    // 2. Send to Admin
    await getResend().emails.send({
      from: process.env.EMAIL_FROM || 'Maison Slimani <onboarding@resend.dev>',
      to: adminEmail,
      subject: `Nouvelle commande #${payload.id}`,
      html: buildAdminNotificationTemplate(payload),
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending commande emails:', error)
    throw error
  }
}
