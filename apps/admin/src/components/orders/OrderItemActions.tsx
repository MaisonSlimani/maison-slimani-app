import { Order } from '@maison/domain'
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@maison/ui'
import { Eye, Trash2 } from 'lucide-react'

interface OrderItemActionsProps {
  commande: Order
  onDeleteClick: (id: string) => void
  onViewClick: (commande: Order) => void
  selectedCommande: Order | null
  ActionButtons: React.ReactNode
}

export function OrderItemActions({
  commande, onDeleteClick, onViewClick, selectedCommande, ActionButtons
}: OrderItemActionsProps) {
  return (
    <div className="flex flex-col gap-3 ml-4 items-end min-w-[200px]">
      <div className="flex flex-col gap-2 w-full">{ActionButtons}</div>
      <div className="flex gap-2 pt-2 border-t w-full">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => onViewClick(commande)} className="flex-1">
              <Eye className="w-4 h-4 mr-2" /> Voir
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-scroll">
            <DialogHeader><DialogTitle>Détails #{commande.id.substring(0, 8)}</DialogTitle></DialogHeader>
            {selectedCommande && (
              <div className="space-y-6">
                <div className="space-y-3">
                  {(selectedCommande.items ?? []).map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      {p.image_url && <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.quantity} × {p.price.toLocaleString('fr-MA')} DH</p>
                      </div>
                      <p className="font-medium text-dore">{(p.price * p.quantity).toLocaleString('fr-MA')} DH</p>
                    </div>
                  ))}
                </div>
                <p className="text-lg font-medium pt-4 border-t">Total: <span className="text-dore">{selectedCommande.total.toLocaleString('fr-MA')} DH</span></p>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="sm" onClick={() => onDeleteClick(commande.id)} className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
        </Button>
      </div>
    </div>
  )
}
