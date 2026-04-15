'use client'

import { Card } from '@maison/ui'
import { Button } from '@maison/ui'
import { Badge } from '@maison/ui'
import { AlertCircle, Truck, CheckCircle, XCircle, Eye } from 'lucide-react'
import { cn } from '@maison/shared'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Order } from '@maison/domain'

interface OrderCardProps {
  commande: Order
  onView?: () => void
  onStatusChange?: (newStatus: string) => void
}

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
  'En attente': {
    icon: AlertCircle,
    color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30',
    label: 'En attente',
  },
  'Expédiée': {
    icon: Truck,
    color: 'bg-blue-400/20 text-blue-600 border-blue-400/30',
    label: 'Expédiée',
  },
  'Livrée': {
    icon: CheckCircle,
    color: 'bg-green-400/20 text-green-600 border-green-400/30',
    label: 'Livrée',
  },
  'Annulée': {
    icon: XCircle,
    color: 'bg-red-400/20 text-red-600 border-red-400/30',
    label: 'Annulée',
  },
}

export default function OrderCard({ commande, onView, onStatusChange }: OrderCardProps) {
  const status = commande.status || 'En attente'
  const config = statusConfig[status] || statusConfig['En attente']
  const StatusIcon = config.icon

  return (
    <Card className="p-4 touch-manipulation">
      <div className="flex items-start justify-between mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-serif font-semibold text-foreground">
              {commande.customerName}
            </h3>
            <Badge
              variant="outline"
              className={cn('text-xs shrink-0', config.color)}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {commande.city} • {commande.phone}
          </p>
          {commande.email && (
            <p className="text-xs text-muted-foreground mt-1">
              📧 {commande.email}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {commande.orderedAt ? format(new Date(commande.orderedAt), 'PPp', { locale: fr }) : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-serif text-dore font-semibold">
            {commande.total.toLocaleString('fr-MA')} MAD
          </p>
          <p className="text-xs text-muted-foreground">
            {commande.items?.length || 0} article{commande.items?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir
          </Button>
        )}
        {onStatusChange && (
          <Button
            size="sm"
            onClick={() => status === 'En attente' && onStatusChange('Expédiée')}
            disabled={status !== 'En attente'}
            className={cn(
              "flex-1",
              status === 'En attente' 
                ? "bg-dore text-charbon hover:bg-dore/90" 
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            )}
          >
            Expédier
          </Button>
        )}
      </div>
    </Card>
  )
}
