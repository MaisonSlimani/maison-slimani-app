import { envoyerEmail, ADMIN_EMAIL } from '@/lib/resend/client'
import { buildAdminNotificationTemplate, buildClientConfirmationTemplate } from '@/lib/emails/templates'
import { commandeEmailSchema, CommandeEmailPayload } from '@/lib/emails/types'

function formatAdminSubject(payload: CommandeEmailPayload) {
  if (payload.notification_statut) {
    return `Commande ${payload.id.substring(0, 8)} - Statut changé`
  }
  return `Nouvelle commande #${payload.id.substring(0, 8)}`
}

export async function sendCommandeEmails(payload: CommandeEmailPayload) {
  const { client_email, ...commande } = payload

  const adminEmailPromise = envoyerEmail({
    to: ADMIN_EMAIL,
    subject: formatAdminSubject(payload),
    html: buildAdminNotificationTemplate(payload),
  })

  const tasks: Array<Promise<unknown>> = [adminEmailPromise]

  if (!payload.notification_statut && client_email) {
    tasks.push(
      envoyerEmail({
        to: client_email,
        subject: 'Confirmation de commande - Maison Slimani',
        html: buildClientConfirmationTemplate(payload),
      })
    )
  }

  await Promise.all(tasks)
}

export { commandeEmailSchema }
