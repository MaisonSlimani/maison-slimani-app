import { envoyerEmail } from '../resend/client'
import { buildClientConfirmationTemplate } from './templates'
import { commandeEmailSchema, CommandeEmailPayload } from './types'
import { createClient } from '@supabase/supabase-js'

async function getContactEmail(): Promise<string | undefined> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return undefined
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data } = await supabase
      .from('settings')
      .select('email_entreprise')
      .limit(1)
      .single()
    
    return data?.email_entreprise || undefined
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'email de contact:', error)
    return undefined
  }
}

export async function sendCommandeEmails(payload: CommandeEmailPayload) {
  const { client_email } = payload

  try {
    const contactEmail = await getContactEmail()

    // Only send customer confirmation email
    // Admin notifications are handled via push notifications (Supabase Edge Function)
    if (!payload.notification_statut && client_email) {
      await envoyerEmail({
        to: client_email,
        subject: 'Confirmation de commande - Maison Slimani',
        html: buildClientConfirmationTemplate(payload, contactEmail),
      }).catch((error) => {
        console.error('Erreur envoi email client:', error)
      })
    }
  } catch (error) {
    // Don't throw - emails are non-critical
    console.error('Erreur lors de l\'envoi des emails:', error)
  }
}

export async function sendStatusChangeEmail(
  commande: CommandeEmailPayload,
  ancienStatut: string,
  nouveauStatut: string
) {
  // Only send email when status changes to "Expédiée"
  if (nouveauStatut !== 'Expédiée' || !commande.client_email) {
    return
  }

  try {
    const { buildStatusChangeTemplate } = await import('./templates')
    const contactEmail = await getContactEmail()
    
    await envoyerEmail({
      to: commande.client_email,
      subject: `Votre commande #${commande.id.substring(0, 8)} a été expédiée - Maison Slimani`,
      html: buildStatusChangeTemplate(commande, contactEmail),
    })
  } catch (error) {
    // Errors are handled internally, don't throw
    console.error('Erreur lors de l\'envoi de l\'email de changement de statut:', error)
  }
}

export { commandeEmailSchema }
