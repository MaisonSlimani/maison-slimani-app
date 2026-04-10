import { CommandeEmailPayload } from '../types'
import { formatPrice, commonStyles } from '../shared'

export function buildClientConfirmationTemplate(commande: CommandeEmailPayload, _contactEmail?: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de commande</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Maison <span class="dore">Slimani</span></h1>
      <p>Confirmation de commande</p>
    </div>
    <div class="content">
      <p>Bonjour ${commande.nom_client},</p>
      <p>Nous vous confirmons la réception de votre commande. Merci pour votre confiance !</p>
      
      <div class="section" style="background:#f8f5f0; padding:20px; border:1px solid #d4a574;">
        <p><strong>Commande #${commande.id.substring(0, 8).toUpperCase()}</strong></p>
        <p>Statut : ${commande.statut}</p>
      </div>

      <div class="section">
        <h2>Produits commandés</h2>
        <table style="width:100%; border-collapse:collapse;">
          ${commande.produits.map(p => `
            <tr>
              <td style="padding:10px; border-bottom:1px solid #e8e3d9;">${p.nom} x ${p.quantite}</td>
              <td style="padding:10px; border-bottom:1px solid #e8e3d9; text-align:right;">${formatPrice(p.prix * p.quantite)}</td>
            </tr>
          `).join('')}
        </table>
        <p style="text-align:right; font-weight:bold; color:#d4a574; font-size:18px; margin-top:15px;">
          Total : ${formatPrice(commande.total)}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Maison Slimani</p>
    </div>
  </div>
</body>
</html>`
}
