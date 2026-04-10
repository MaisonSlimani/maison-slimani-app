import { Order } from '@maison/domain'
import { Button, Card } from '@maison/ui'
import { Truck, CheckCircle, XCircle } from 'lucide-react'
import { getStatutColor } from '@/lib/utils/order-utils'
import { OrderItemActions } from './OrderItemActions'

interface OrderListItemProps {
  commande: Order
  onActionClick: (id: string, action: string) => void
  onDeleteClick: (id: string) => void
  onViewClick: (commande: Order) => void
  operationLoading: boolean
  selectedCommande: Order | null
}

export function OrderListItem({ 
  commande, onActionClick, onDeleteClick, onViewClick, operationLoading, selectedCommande
}: OrderListItemProps) {
  const ActionButtons = (
    <>
      {commande.statut === 'En attente' && (
        <>
          <Button variant="default" size="sm" onClick={() => onActionClick(commande.id, 'Expédier')} className="w-full bg-blue-600 text-white" disabled={operationLoading}><Truck className="w-4 h-4 mr-2" /> Expédier</Button>
          <Button variant="destructive" size="sm" onClick={() => onActionClick(commande.id, 'Annuler')} className="w-full" disabled={operationLoading}><XCircle className="w-4 h-4 mr-2" /> Annuler</Button>
        </>
      )}
      {commande.statut === 'Expédiée' && (
        <>
          <Button variant="default" size="sm" onClick={() => onActionClick(commande.id, 'Livrée')} className="w-full bg-green-600 text-white" disabled={operationLoading}><CheckCircle className="w-4 h-4 mr-2" /> Livrée</Button>
          <Button variant="destructive" size="sm" onClick={() => onActionClick(commande.id, 'Annuler')} className="w-full" disabled={operationLoading}><XCircle className="w-4 h-4 mr-2" /> Annuler</Button>
        </>
      )}
      {(commande.statut === 'Livrée' || commande.statut === 'Annulée') && (
        <div className="text-sm text-muted-foreground flex items-center justify-center px-3 py-2 w-full border rounded-md">{commande.statut}</div>
      )}
    </>
  )

  return (
    <Card className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${commande.statut === 'En attente' ? 'border-yellow-400/50 bg-yellow-50/30' : 'border-border'}`}>
      <div className="flex gap-6">
        <div className="flex gap-2 flex-shrink-0">
          {(commande.produits ?? []).slice(0, 3).map((p, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
              {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">{p.nom.substring(0, 2)}</div>}
            </div>
          ))}
          {(commande.produits ?? []).length > 3 && <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">+{(commande.produits ?? []).length - 3}</div>}
        </div>
        <div className="flex-1 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h3 className="text-xl font-serif">Commande #{commande.id.substring(0, 8)}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(commande.statut)}`}>{commande.statut}</span>
              <span className="text-sm text-muted-foreground">{commande.date_commande ? new Date(commande.date_commande).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
            <div className="mb-4 flex flex-wrap gap-1">{(commande.produits ?? []).map((p, idx) => (<span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">{p.nom} ×{p.quantite}</span>))}</div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><p className="text-muted-foreground">Client</p><p className="font-medium">{commande.nom_client}</p></div>
              <div><p className="text-muted-foreground">Téléphone</p><p className="font-medium">{commande.telephone}</p></div>
              <div><p className="text-muted-foreground">Total</p><p className="text-dore font-medium text-lg">{commande.total.toLocaleString('fr-MA')} DH</p></div>
            </div>
          </div>
          <OrderItemActions commande={commande} onDeleteClick={onDeleteClick} onViewClick={onViewClick} selectedCommande={selectedCommande} ActionButtons={ActionButtons} />
        </div>
      </div>
    </Card>
  )
}
