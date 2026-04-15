import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, LuxuryLoading } from '@maison/ui'
import { cn } from '@maison/shared'
import { Download, AlertCircle, Package, Truck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { Order } from '@maison/domain'
import { formatOrdersToCSV, downloadCSV } from '@/lib/utils/order-utils'
import { useOrderManagement } from '@/hooks/admin/useOrderManagement'
import { OrderListItem } from '@/components/orders/OrderListItem'
import { OrderStatusDialogs } from '@/components/orders/OrderStatusDialogs'

type StatutKey = 'en-attente' | 'expediee' | 'livree' | 'annulee' | 'toutes'

const statusesMap: Record<string, { name: string; icon: typeof AlertCircle; color: string }> = {
  'en-attente': { name: 'En attente', icon: AlertCircle, color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30' },
  'expediee': { name: 'Expédiée', icon: Truck, color: 'bg-blue-400/20 text-blue-600 border-blue-400/30' },
  'livree': { name: 'Livrée', icon: CheckCircle, color: 'bg-green-400/20 text-green-600 border-green-400/30' },
  'annulee': { name: 'Annulée', icon: XCircle, color: 'bg-red-400/20 text-red-600 border-red-400/30' },
  'toutes': { name: 'Toutes les commandes', icon: Package, color: 'bg-muted text-muted-foreground border-border' },
}

const statusQueryMap: Record<StatutKey, string> = {
  'toutes': 'tous',
  'en-attente': 'en_attente',
  'expediee': 'expediee',
  'livree': 'livree',
  'annulee': 'annulee',
}

export default function CommandesStatutPage() {
  const { statut: statusSlug = 'toutes' } = useParams<{ statut: string }>()
  const navigate = useNavigate()
  const statusInfo = statusesMap[statusSlug] ?? statusesMap['toutes']
  const StatusIcon = statusInfo.icon
  const statusQuery = statusQueryMap[statusSlug as StatutKey] ?? 'tous'

  // Dialog States
  const [selectedCommande, setSelectedCommande] = useState<Order | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null)
  const [expedierDialogOpen, setExpedierDialogOpen] = useState(false)
  const [annulerDialogOpen, setAnnulerDialogOpen] = useState(false)
  const [livreeDialogOpen, setLivreeDialogOpen] = useState(false)
  const [commandeToUpdate, setCommandeToUpdate] = useState<{ id: string; action: string } | null>(null)

  const sortCommandes = useCallback((list: Order[]) => 
    [...list].sort((a, b) => new Date(b.orderedAt || 0).getTime() - new Date(a.orderedAt || 0).getTime()), []
  )

  const { commandes, loading, operationLoading, updateStatus, deleteOrder } = useOrderManagement(statusSlug, statusQuery, sortCommandes)

  const handleActionClick = (commandeId: string, action: string) => {
    setCommandeToUpdate({ id: commandeId, action })
    if (action === 'Expédier') setExpedierDialogOpen(true)
    else if (action === 'Annuler') setAnnulerDialogOpen(true)
    else if (action === 'Livrée') setLivreeDialogOpen(true)
  }

  const handleExportCSV = () => {
    const csvContent = formatOrdersToCSV(commandes)
    downloadCSV(csvContent, `commandes-${statusSlug}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  if (loading) return <LuxuryLoading fullScreen message="Chargement des commandes..." />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/commandes')}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-3">
            <StatusIcon className={cn('w-6 h-6', statusInfo.color.split(' ')[1])} />
            <div>
              <h1 className="text-3xl font-serif mb-2">{statusInfo.name}</h1>
              <p className="text-muted-foreground">{commandes.length} commande{commandes.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" /> Exporter CSV</Button>
      </div>

      <div className="grid gap-4">
        {commandes.map((commande) => (
          <OrderListItem 
            key={commande.id} 
            commande={commande} 
            onActionClick={handleActionClick} 
            onDeleteClick={(id) => { setCommandeToDelete(id); setDeleteDialogOpen(true) }}
            onViewClick={setSelectedCommande}
            operationLoading={operationLoading}
            selectedCommande={selectedCommande}
          />
        ))}
      </div>

      {commandes.length === 0 && (
        <Card className="p-12 text-center"><p className="text-muted-foreground">Aucune commande dans cette catégorie pour le moment.</p></Card>
      )}

      <OrderStatusDialogs 
        deleteDialogOpen={deleteDialogOpen} setDeleteDialogOpen={setDeleteDialogOpen} onDelete={() => commandeToDelete && deleteOrder(commandeToDelete).then(r => r.success && setDeleteDialogOpen(false))}
        expedierDialogOpen={expedierDialogOpen} setExpedierDialogOpen={setExpedierDialogOpen} onExpedier={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'expediee').then(r => r.success && setExpedierDialogOpen(false))}
        annulerDialogOpen={annulerDialogOpen} setAnnulerDialogOpen={setAnnulerDialogOpen} onAnnuler={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'annulee').then(r => r.success && setAnnulerDialogOpen(false))}
        livreeDialogOpen={livreeDialogOpen} setLivreeDialogOpen={setLivreeDialogOpen} onLivree={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'livree').then(r => r.success && setLivreeDialogOpen(false))}
      />
    </div>
  )
}
