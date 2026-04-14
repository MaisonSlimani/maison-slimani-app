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
      <h1>${commande.statusNotification ? 'Mise à jour du statut' : 'Nouvelle commande reçue'}</h1>
    </div>
    <div class="content">
      <div style="background-color: #fff3cd; border-left: 4px solid #d4a574; padding: 15px; margin-bottom: 20px;">
        <strong>Commande #${commande.id.substring(0, 8)}</strong><br />
        ${commande.statusNotification ? `Statut: ${commande.oldStatus} → ${commande.newStatus}` : 'Nouvelle commande à traiter'}
      </div>
      <div class="section">
        <p><strong>Client :</strong> ${commande.clientName}</p>
        <p><strong>Téléphone :</strong> ${commande.phone}</p>
        <p><strong>Ville :</strong> ${commande.city}</p>
        <p style="font-size: 20px; font-weight: bold; color: #d4a574; margin-top: 15px;">
          Total : ${formatPrice(commande.total)}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}
