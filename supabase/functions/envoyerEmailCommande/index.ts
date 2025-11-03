import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const schemaCommande = z.object({
  id: z.string().uuid(),
  nom_client: z.string(),
  telephone: z.string(),
  adresse: z.string(),
  ville: z.string(),
  produits: z.array(z.any()),
  total: z.number(),
  statut: z.string(),
  notification_statut: z.boolean().optional(),
  ancien_statut: z.string().optional(),
  nouveau_statut: z.string().optional(),
})

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@maisonslimani.com'
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@maisonslimani.com'

// Template email confirmation client
const templateConfirmationClient = (commande: z.infer<typeof schemaCommande>) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande</title>
  <style>
    body {
      font-family: 'Playfair Display', 'Times New Roman', serif;
      background-color: #f8f5f0;
      color: #1a1612;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #d4a574;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a1612 0%, #2d2419 100%);
      color: #f8f5f0;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header .dore {
      color: #d4a574;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      font-size: 20px;
      color: #1a1612;
      border-bottom: 2px solid #d4a574;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e8e3d9;
    }
    .info-label {
      font-weight: 600;
      color: #2d2419;
    }
    .info-value {
      color: #1a1612;
    }
    .produits-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .produits-table th,
    .produits-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e8e3d9;
    }
    .produits-table th {
      background-color: #f8f5f0;
      font-weight: 600;
      color: #2d2419;
    }
    .total {
      text-align: right;
      font-size: 24px;
      font-weight: 600;
      color: #d4a574;
      margin-top: 20px;
    }
    .footer {
      background-color: #f8f5f0;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #2d2419;
      border-top: 1px solid #e8e3d9;
    }
    .footer a {
      color: #d4a574;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Maison <span class="dore">Slimani</span></h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Confirmation de commande</p>
    </div>
    <div class="content">
      <p>Bonjour ${commande.nom_client},</p>
      <p>Nous vous confirmons la réception de votre commande. Merci pour votre confiance !</p>
      
      <div class="section">
        <h2>Détails de la commande</h2>
        <div class="info-row">
          <span class="info-label">Numéro de commande :</span>
          <span class="info-value">${commande.id.substring(0, 8)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date :</span>
          <span class="info-value">${new Date().toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Statut :</span>
          <span class="info-value">${commande.statut}</span>
        </div>
      </div>

      <div class="section">
        <h2>Adresse de livraison</h2>
        <div class="info-row">
          <span class="info-label">Nom :</span>
          <span class="info-value">${commande.nom_client}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Téléphone :</span>
          <span class="info-value">${commande.telephone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Adresse :</span>
          <span class="info-value">${commande.adresse}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Ville :</span>
          <span class="info-value">${commande.ville}</span>
        </div>
      </div>

      <div class="section">
        <h2>Produits commandés</h2>
        <table class="produits-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${commande.produits.map((p: any) => `
              <tr>
                <td>${p.nom}</td>
                <td>${p.quantite}</td>
                <td>${p.prix.toLocaleString('fr-MA')} DH</td>
                <td>${(p.prix * p.quantite).toLocaleString('fr-MA')} DH</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total : ${commande.total.toLocaleString('fr-MA')} DH
        </div>
      </div>

      <div class="section">
        <p><strong>Livraison :</strong> Gratuite dans tout le Maroc 🇲🇦</p>
        <p><strong>Retours :</strong> 7 jours pour changer d'avis</p>
        <p><strong>Délai estimé :</strong> 3-5 jours ouvrables</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Maison Slimani. Tous droits réservés.</p>
      <p><a href="mailto:contact@maisonslimani.com">contact@maisonslimani.com</a></p>
    </div>
  </div>
</body>
</html>
`

// Template email notification admin
const templateNotificationAdmin = (commande: z.infer<typeof schemaCommande>) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle commande</title>
  <style>
    body {
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f8f5f0;
      color: #1a1612;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 2px solid #d4a574;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a1612 0%, #2d2419 100%);
      color: #f8f5f0;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 20px;
    }
    .alert {
      background-color: #fff3cd;
      border-left: 4px solid #d4a574;
      padding: 15px;
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e8e3d9;
    }
    .info-label {
      font-weight: 600;
      color: #2d2419;
    }
    .total {
      text-align: right;
      font-size: 20px;
      font-weight: 600;
      color: #d4a574;
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nouvelle commande reçue</h1>
    </div>
    <div class="content">
      <div class="alert">
        <strong>Commande #${commande.id.substring(0, 8)}</strong>
      </div>
      <div class="info-row">
        <span class="info-label">Client :</span>
        <span>${commande.nom_client}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Téléphone :</span>
        <span>${commande.telephone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ville :</span>
        <span>${commande.ville}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total :</span>
        <span class="total">${commande.total.toLocaleString('fr-MA')} DH</span>
      </div>
    </div>
  </div>
</body>
</html>
`

serve(async (req) => {
  try {
    const body = await req.json()
    const commande = schemaCommande.parse(body)

    // Envoyer email au client (si pas une notification de statut)
    if (!commande.notification_statut) {
      try {
        const clientEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: commande.nom_client, // TODO: Ajouter champ email client dans la commande
            subject: `Confirmation de commande - Maison Slimani`,
            html: templateConfirmationClient(commande),
          }),
        })

        if (!clientEmailResponse.ok) {
          console.error('Erreur envoi email client:', await clientEmailResponse.text())
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email client:', emailError)
      }
    }

    // Envoyer email à l'admin
    try {
      const adminEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: commande.notification_statut 
            ? `Commande ${commande.id.substring(0, 8)} - Statut changé`
            : `Nouvelle commande #${commande.id.substring(0, 8)}`,
          html: templateNotificationAdmin(commande),
        }),
      })

      if (!adminEmailResponse.ok) {
        console.error('Erreur envoi email admin:', await adminEmailResponse.text())
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email admin:', emailError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails envoyés avec succès',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

