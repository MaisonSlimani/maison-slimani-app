import { CommandeEmailPayload } from '../types'
import { formatPrice, commonStyles } from '../shared'

export function buildAdminNotificationTemplate(commande: CommandeEmailPayload) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Notification commande</title>
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${commande.notification_statut ? 'Mise à jour du statut' : 'Nouvelle commande reçue'}</h1>
    </div>
    <div class="content">
      <div style="background-color: #fff3cd; border-left: 4px solid #d4a574; padding: 15px; margin-bottom: 20px;">
        <strong>Commande #${commande.id.substring(0, 8)}</strong><br />
        ${commande.notification_statut ? `Statut: ${commande.ancien_statut} → ${commande.nouveau_statut}` : 'Nouvelle commande à traiter'}
      </div>
      <div class="section">
        <p><strong>Client :</strong> ${commande.nom_client}</p>
        <p><strong>Téléphone :</strong> ${commande.telephone}</p>
        <p><strong>Ville :</strong> ${commande.ville}</p>
        <p style="font-size: 20px; font-weight: bold; color: #d4a574; margin-top: 15px;">
          Total : ${formatPrice(commande.total)}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}
