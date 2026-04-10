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

const statutsMap: Record<string, { nom: string; icon: typeof AlertCircle; color: string }> = {
  'en-attente': { nom: 'En attente', icon: AlertCircle, color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30' },
  'expediee': { nom: 'Expédiée', icon: Truck, color: 'bg-blue-400/20 text-blue-600 border-blue-400/30' },
  'livree': { nom: 'Livrée', icon: CheckCircle, color: 'bg-green-400/20 text-green-600 border-green-400/30' },
  'annulee': { nom: 'Annulée', icon: XCircle, color: 'bg-red-400/20 text-red-600 border-red-400/30' },
  'toutes': { nom: 'Toutes les commandes', icon: Package, color: 'bg-muted text-muted-foreground border-border' },
}

const statutQueryMap: Record<StatutKey, string> = {
  'toutes': 'tous',
  'en-attente': 'En attente',
  'expediee': 'Expédiée',
  'livree': 'Livrée',
  'annulee': 'Annulée',
}

export default function CommandesStatutPage() {
  const { statut: statutSlug = 'toutes' } = useParams<{ statut: string }>()
  const navigate = useNavigate()
  const statutInfo = statutsMap[statutSlug] ?? statutsMap['toutes']
  const StatutIcon = statutInfo.icon
  const statutQuery = statutQueryMap[statutSlug as StatutKey] ?? 'tous'

  // Dialog States
  const [selectedCommande, setSelectedCommande] = useState<Order | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null)
  const [expedierDialogOpen, setExpedierDialogOpen] = useState(false)
  const [annulerDialogOpen, setAnnulerDialogOpen] = useState(false)
  const [livreeDialogOpen, setLivreeDialogOpen] = useState(false)
  const [commandeToUpdate, setCommandeToUpdate] = useState<{ id: string; action: string } | null>(null)

  const sortCommandes = useCallback((list: Order[]) => 
    [...list].sort((a, b) => new Date(b.date_commande || 0).getTime() - new Date(a.date_commande || 0).getTime()), []
  )

  const { commandes, loading, operationLoading, updateStatus, deleteOrder } = useOrderManagement(statutSlug, statutQuery, sortCommandes)

  const handleActionClick = (commandeId: string, action: string) => {
    setCommandeToUpdate({ id: commandeId, action })
    if (action === 'Expédier') setExpedierDialogOpen(true)
    else if (action === 'Annuler') setAnnulerDialogOpen(true)
    else if (action === 'Livrée') setLivreeDialogOpen(true)
  }

  const handleExportCSV = () => {
    const csvContent = formatOrdersToCSV(commandes)
    downloadCSV(csvContent, `commandes-${statutSlug}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  if (loading) return <LuxuryLoading fullScreen message="Chargement des commandes..." />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/commandes')}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-3">
            <StatutIcon className={cn('w-6 h-6', statutInfo.color.split(' ')[1])} />
            <div>
              <h1 className="text-3xl font-serif mb-2">{statutInfo.nom}</h1>
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
        expedierDialogOpen={expedierDialogOpen} setExpedierDialogOpen={setExpedierDialogOpen} onExpedier={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'Expédiée').then(r => r.success && setExpedierDialogOpen(false))}
        annulerDialogOpen={annulerDialogOpen} setAnnulerDialogOpen={setAnnulerDialogOpen} onAnnuler={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'Annulée').then(r => r.success && setAnnulerDialogOpen(false))}
        livreeDialogOpen={livreeDialogOpen} setLivreeDialogOpen={setLivreeDialogOpen} onLivree={() => commandeToUpdate && updateStatus(commandeToUpdate.id, 'Livrée').then(r => r.success && setLivreeDialogOpen(false))}
      />
    </div>
  )
}
