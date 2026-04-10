import { CommandeEmailPayload } from '../types'
import { formatPrice, commonStyles } from '../shared'

export function buildStatusChangeTemplate(commande: CommandeEmailPayload, contactEmail?: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Votre commande a été expédiée</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Maison <span class="dore">Slimani</span></h1>
      <p>Mise à jour de votre commande</p>
    </div>
    <div class="content">
      <p>Bonjour ${commande.nom_client},</p>
      <p>Nous avons le plaisir de vous informer que votre commande a été expédiée et est en cours de livraison.</p>
      
      <div class="section" style="background:#f8f5f0; padding:20px; border:1px solid #d4a574; text-align:center;">
        <p>Numéro de commande : <strong>#${commande.id.substring(0, 8).toUpperCase()}</strong></p>
      </div>

      <div class="section">
        <h2>Détails</h2>
        <p><strong>Adresse :</strong> ${commande.adresse}, ${commande.ville}</p>
        <p><strong>Total :</strong> ${formatPrice(commande.total)}</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Maison Slimani</p>
      ${contactEmail ? `<p><a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}
    </div>
  </div>
</body>
</html>`
}
