import { Order } from '@maison/domain'

/**
 * Returns CSS classes for order status badges.
 */
export const getStatutColor = (statut: string | null) => {
  switch (statut) {
    case 'En attente':
      return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30'
    case 'Expédiée':
      return 'bg-blue-400/20 text-blue-600 border-blue-400/30'
    case 'Livrée':
      return 'bg-green-400/20 text-green-600 border-green-400/30'
    case 'Annulée':
      return 'bg-red-400/20 text-red-600 border-red-400/30'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

/**
 * Formats a list of orders into a CSV string.
 */
export const formatOrdersToCSV = (commandes: Order[]) => {
  const headers = ['ID', 'Client', 'Téléphone', 'Ville', 'Total', 'Statut', 'Date']
  const rows = commandes.map((c) => [
    c.id.substring(0, 8),
    c.nom_client,
    c.telephone ?? '',
    c.ville ?? '',
    c.total,
    c.statut ?? '',
    c.date_commande ? new Date(c.date_commande).toLocaleDateString('fr-FR') : '',
  ])

  return [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')
}

/**
 * Triggers a browser download for a CSV file.
 */
export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
