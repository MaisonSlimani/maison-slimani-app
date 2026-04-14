import { Resend } from 'resend'
import { CommandeEmailPayload } from './types'
import { buildClientConfirmationTemplate, buildAdminNotificationTemplate } from './templates'
import { SettingsRepository, createClient } from '@maison/db'
import { ADMIN_EMAIL } from '@/lib/resend/client'
import { createLogger } from '@maison/shared'

const logger = createLogger('emails.send')

// Lazily initialized
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
    const settingsRepo = new SettingsRepository(supabase)
    const settings = await settingsRepo.getSettings()
    const adminEmail = settings?.companyEmail || ADMIN_EMAIL

    // 1. Send to Client
    if (payload.clientEmail) {
      await getResend().emails.send({
        from: process.env.EMAIL_FROM || 'Maison Slimani <onboarding@resend.dev>',
        to: payload.clientEmail,
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
    logger.error('Error sending commande emails:', error);
    throw error
  }
}
