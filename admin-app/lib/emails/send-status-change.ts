import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@maison-slimani.com'

interface CommandeData {
  id: string
  nom_client: string
  telephone: string
  email: string | null
  adresse: string
  ville: string
  produits: Array<{
    nom: string
    prix: number
    quantite: number
    image_url?: string | null
    taille?: string | null
    couleur?: string | null
  }>
  total: number
  statut: string
}

async function envoyerEmail({
  to,
  subject,
  html,
}: {
  to: string
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

    const resend = getResend()
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

function formatPrice(value: number): string {
  // French format: dot as thousand separator (1.140 DH)
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function buildStatusChangeTemplate(commande: CommandeData, contactEmail?: string): string {
  const commandeId = commande.id.substring(0, 8)
  const dateCommande = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre commande a été expédiée</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f8f5f0; color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #d4a574; font-size: 24px; font-weight: 600; letter-spacing: 1px;">
        Maison <span style="color: #f8f5f0;">Slimani</span>
      </h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 30px; font-size: 16px; line-height: 1.6;">
      <!-- Title -->
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; text-align: center;">
        Votre commande a été expédiée
      </h2>

      <!-- Command Number -->
      <div style="background-color: #f8f5f0; border: 2px solid #d4a574; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #2d2419; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Numéro de commande
        </p>
        <p style="margin: 0; color: #d4a574; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
          #${commandeId}
        </p>
      </div>

      <!-- Message -->
      <p style="margin: 0 0 25px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6; text-align: center;">
        Nous sommes ravis de vous informer que votre commande a été expédiée le <strong>${dateCommande}</strong>.
      </p>

      <!-- Order Details -->
      <div style="border-top: 2px solid #d4a574; padding: 20px 0; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
          Détails de la commande
        </h3>
        
        ${commande.produits.map((produit) => {
          const productTotal = produit.prix * produit.quantite
          return `
          <div style="padding: 12px 0; border-bottom: 1px solid #e8e3d9;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600; flex: 1;">
                ${produit.nom}
              </p>
              <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                ${formatPrice(productTotal)} DH
              </p>
            </div>
            <div style="padding-left: 0;">
              ${produit.taille ? `<p style="margin: 0 0 4px 0; color: #2d2419; font-size: 16px;">Taille : ${produit.taille}</p>` : ''}
              ${produit.couleur ? `<p style="margin: 0 0 4px 0; color: #2d2419; font-size: 16px;">Couleur : ${produit.couleur.toUpperCase()}</p>` : ''}
              <p style="margin: 0; color: #2d2419; font-size: 16px;">
                Quantité : ${produit.quantite} × ${formatPrice(produit.prix)} DH
              </p>
            </div>
          </div>
        `
        }).join('')}

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0 0 0; margin-top: 15px; border-top: 2px solid #d4a574;">
          <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
            Total
          </p>
          <p style="margin: 0; color: #d4a574; font-size: 20px; font-weight: 600;">
            ${formatPrice(commande.total)} DH
          </p>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="background-color: #f8f5f0; padding: 20px; margin: 25px 0; border-left: 4px solid #d4a574; border-radius: 4px;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 18px; font-weight: 600; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">
          Informations de livraison
        </h3>
        <div style="display: flex; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #e8e3d9;">
          <span style="font-weight: 600; color: #2d2419; font-size: 16px; min-width: 120px; margin-right: 16px; flex-shrink: 0;">Nom :</span>
          <span style="color: #1a1a1a; font-size: 16px; flex: 1;">${commande.nom_client}</span>
        </div>
        <div style="display: flex; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #e8e3d9;">
          <span style="font-weight: 600; color: #2d2419; font-size: 16px; min-width: 120px; margin-right: 16px; flex-shrink: 0;">Téléphone :</span>
          <span style="color: #1a1a1a; font-size: 16px; flex: 1;">${commande.telephone}</span>
        </div>
        <div style="display: flex; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #e8e3d9;">
          <span style="font-weight: 600; color: #2d2419; font-size: 16px; min-width: 120px; margin-right: 16px; flex-shrink: 0;">Adresse :</span>
          <span style="color: #1a1a1a; font-size: 16px; flex: 1;">${commande.adresse}</span>
        </div>
        <div style="display: flex; align-items: flex-start; padding: 8px 0; border-bottom: none;">
          <span style="font-weight: 600; color: #2d2419; font-size: 16px; min-width: 120px; margin-right: 16px; flex-shrink: 0;">Ville :</span>
          <span style="color: #1a1a1a; font-size: 16px; flex: 1;">${commande.ville}</span>
        </div>
      </div>

      <!-- Note -->
      <p style="margin: 25px 0 0 0; color: #2d2419; font-size: 16px; line-height: 1.6; text-align: center; font-style: italic;">
        Vous recevrez un suivi de livraison une fois que votre colis sera en transit.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f5f0; padding: 20px 30px; text-align: center; border-top: 1px solid #e8e3d9;">
      <p style="margin: 0 0 10px 0; color: #2d2419; font-size: 16px; font-weight: 600;">
        Merci pour votre confiance
      </p>
      <p style="margin: 0 0 10px 0; color: #2d2419; font-size: 16px;">
        Maison Slimani
      </p>
      ${contactEmail ? `<p style="margin: 0; color: #2d2419; font-size: 16px; line-height: 1.6;">
        <a href="mailto:${contactEmail}" style="color: #d4a574; text-decoration: none; font-weight: 600;">${contactEmail}</a>
      </p>` : ''}
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function sendStatusChangeEmail(
  commande: CommandeData,
  ancienStatut: string,
  nouveauStatut: string
) {
  // Only send email when status changes to "Expédiée"
  if (nouveauStatut !== 'Expédiée' || !commande.email) {
    return
  }

  try {
    const contactEmail = await getContactEmail()
    await envoyerEmail({
      to: commande.email,
      subject: `Votre commande #${commande.id.substring(0, 8)} a été expédiée - Maison Slimani`,
      html: buildStatusChangeTemplate(commande, contactEmail),
    })
  } catch (error) {
    // Errors are handled internally, don't throw
    console.error('Erreur lors de l\'envoi de l\'email de changement de statut:', error)
  }
}

