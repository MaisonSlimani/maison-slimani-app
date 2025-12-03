import { CommandeEmailPayload } from '@/lib/emails/types'

const priceFormatter = new Intl.NumberFormat('fr-MA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatPrice = (value: number) => `${priceFormatter.format(value)} DH`

export function buildClientConfirmationTemplate(commande: CommandeEmailPayload, contactEmail?: string) {
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
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .header .dore {
      color: #d4a574;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .command-number {
      background: linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%);
      padding: 25px;
      border-radius: 8px;
      border: 2px solid #d4a574;
      margin: 25px 0;
      text-align: center;
    }
    .command-number-label {
      font-size: 14px;
      color: #2d2419;
      margin-bottom: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .command-number-value {
      font-size: 24px;
      font-weight: 700;
      color: #d4a574;
      letter-spacing: 1px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      font-size: 18px;
      color: #1a1612;
      border-bottom: 2px solid #d4a574;
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .info-row {
      display: flex;
      align-items: flex-start;
      padding: 12px 0;
      border-bottom: 1px solid #e8e3d9;
      font-size: 16px;
    }
    .info-label {
      font-weight: 600;
      color: #2d2419;
      font-size: 16px;
      min-width: 120px;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .info-value {
      color: #1a1612;
      font-size: 16px;
      flex: 1;
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
      font-size: 14px;
    }
    .produits-table td {
      font-size: 16px;
    }
    .total {
      text-align: right;
      font-size: 20px;
      font-weight: 600;
      color: #d4a574;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #d4a574;
    }
    .section p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .footer {
      background-color: #f8f5f0;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #2d2419;
      border-top: 1px solid #e8e3d9;
      line-height: 1.6;
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
      <p>Confirmation de commande</p>
    </div>
    <div class="content">
      <p>Bonjour ${commande.nom_client},</p>
      <p>Nous vous confirmons la réception de votre commande. Merci pour votre confiance !</p>
      
      <div class="section" style="background: linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%); padding: 25px; border-radius: 8px; border: 2px solid #d4a574; margin-bottom: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div class="command-number-label">Numéro de commande</div>
          <div class="command-number-value">#${commande.id.substring(0, 8).toUpperCase()}</div>
        </div>
        <div class="info-row" style="border-bottom: 1px solid #e8e3d9;">
          <span class="info-label">Date :</span>
          <span class="info-value">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Statut :</span>
          <span class="info-value" style="font-weight: 600; color: #2d2419;">${commande.statut}</span>
        </div>
      </div>

      <div class="section">
        <h2>Informations de livraison</h2>
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
      ${contactEmail ? `<p><a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}
    </div>
  </div>
</body>
</html>`
}

export function buildStatusChangeTemplate(commande: CommandeEmailPayload, contactEmail?: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre commande a été expédiée</title>
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
      border: 2px solid #d4a574;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1a1612 0%, #2d2419 100%);
      color: #f8f5f0;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header .dore {
      color: #d4a574;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      font-size: 18px;
      color: #1a1612;
      border-bottom: 2px solid #d4a574;
      padding-bottom: 10px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .command-number {
      background: linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%);
      padding: 25px;
      border-radius: 8px;
      border: 2px solid #d4a574;
      margin: 25px 0;
      text-align: center;
    }
    .command-number-label {
      font-size: 14px;
      color: #2d2419;
      margin-bottom: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .command-number-value {
      font-size: 24px;
      font-weight: 700;
      color: #d4a574;
      letter-spacing: 1px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e8e3d9;
      font-size: 16px;
    }
    .info-label {
      font-weight: 600;
      color: #2d2419;
      font-size: 16px;
    }
    .info-value {
      color: #1a1612;
      font-size: 16px;
    }
    .produits-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .produits-table th,
    .produits-table td {
      padding: 14px;
      text-align: left;
      border-bottom: 1px solid #e8e3d9;
    }
    .produits-table th {
      background-color: #f8f5f0;
      font-weight: 600;
      color: #2d2419;
      border-bottom: 2px solid #d4a574;
      font-size: 14px;
    }
    .produits-table td {
      font-size: 16px;
    }
    .total {
      text-align: right;
      font-size: 20px;
      font-weight: 600;
      color: #d4a574;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #d4a574;
    }
    .shipping-info {
      background-color: #f8f5f0;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #d4a574;
      margin-top: 25px;
    }
    .shipping-info p {
      margin: 8px 0;
      color: #2d2419;
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f8f5f0;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #2d2419;
      border-top: 1px solid #e8e3d9;
      line-height: 1.6;
    }
    .footer a {
      color: #d4a574;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Maison <span class="dore">Slimani</span></h1>
      <p>Votre commande a été expédiée</p>
    </div>
    <div class="content">
      <p>Bonjour ${commande.nom_client},</p>
      <p>Nous avons le plaisir de vous informer que votre commande a été expédiée et est en cours de livraison.</p>
      
      <div class="command-number">
        <div class="command-number-label">Numéro de commande</div>
        <div class="command-number-value">#${commande.id.substring(0, 8).toUpperCase()}</div>
      </div>

      <div class="section">
        <h2>Informations de livraison</h2>
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
        <div class="info-row" style="border-bottom: none;">
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
                <td>${p.nom}${p.couleur ? ` (${p.couleur})` : ''}${p.taille ? ` - Taille: ${p.taille}` : ''}</td>
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

      <div class="shipping-info">
        <p style="font-weight: 600; margin-bottom: 12px; color: #1a1612;">Informations de livraison</p>
        <p><strong>Livraison :</strong> Gratuite dans tout le Maroc 🇲🇦</p>
        <p><strong>Délai estimé :</strong> 3-5 jours ouvrables</p>
        <p style="margin-top: 15px; font-style: italic; color: #2d2419;">Votre colis devrait arriver sous peu. Nous vous remercions pour votre confiance.</p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Maison Slimani. Tous droits réservés.</p>
      ${contactEmail ? `<p><a href="mailto:${contactEmail}">${contactEmail}</a></p>` : ''}
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

