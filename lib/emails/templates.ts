import { CommandeEmailPayload } from '@/lib/emails/types'

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatPrice = (value: number) => `${priceFormatter.format(value)} DH`

export function buildClientConfirmationTemplate(commande: CommandeEmailPayload) {
  return `<!DOCTYPE html>
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
            ${commande.produits
              .map(
                (p) => `
              <tr>
                <td>${p.nom}${p.couleur ? ` (${p.couleur})` : ''}</td>
                <td>${p.quantite}</td>
                <td>${formatPrice(p.prix)}</td>
                <td>${formatPrice(p.prix * p.quantite)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="total">
          Total : ${formatPrice(commande.total)}
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
</html>`
}

export function buildAdminNotificationTemplate(commande: CommandeEmailPayload) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification commande</title>
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
      <h1>${
        commande.notification_statut
          ? 'Mise à jour du statut'
          : 'Nouvelle commande reçue'
      }</h1>
    </div>
    <div class="content">
      <div class="alert">
        <strong>Commande #${commande.id.substring(0, 8)}</strong><br />
        ${
          commande.notification_statut
            ? `Statut: ${commande.ancien_statut} → ${commande.nouveau_statut}`
            : 'Nouvelle commande à traiter'
        }
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
        <span class="info-label">Statut :</span>
        <span>${commande.statut}</span>
      </div>
      <div class="total">
        Total : ${formatPrice(commande.total)}
      </div>
    </div>
  </div>
</body>
</html>`
}

