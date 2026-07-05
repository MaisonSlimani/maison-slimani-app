import { motion } from 'framer-motion'
import { Card } from '@maison/ui'
import { ShoppingBag, DollarSign, Clock, Warehouse, AlertTriangle } from 'lucide-react'

type MetricKey = 'totalCommandes' | 'totalRevenus' | 'commandesEnAttente' | 'totalStock' | 'produitsRupture'

interface MetricCardsProps {
  stats: {
    totalCommandes: number
    totalRevenus: number
    commandesEnAttente: number
    totalStock: number
    produitsRupture: number
  }
  onCardClick?: (key: MetricKey) => void
}

export function MetricCards({ stats, onCardClick }: MetricCardsProps) {
  const metrics = [
    { key: 'totalCommandes' as const, label: 'Commandes totales', value: stats.totalCommandes, icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { key: 'totalRevenus' as const, label: 'Revenus totaux', value: `${stats.totalRevenus.toLocaleString('fr-MA')} DH`, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-50' },
    { key: 'commandesEnAttente' as const, label: 'En attente', value: stats.commandesEnAttente, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { key: 'totalStock' as const, label: 'Total stock', value: stats.totalStock, icon: Warehouse, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
    { key: 'produitsRupture' as const, label: 'Rupture de stock', value: stats.produitsRupture, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isClickable = onCardClick && (metric.key === 'produitsRupture' || metric.key === 'commandesEnAttente') && metric.value > 0

        return (
          <motion.div 
            key={metric.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }}
            whileHover={isClickable ? { scale: 1.02 } : {}}
            onClick={() => isClickable && onCardClick(metric.key)}
            className={isClickable ? 'cursor-pointer' : ''}
          >
            <Card className={`p-6 bg-card border-border hover:shadow-lg transition-all ${metric.bgColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}><Icon className={`w-6 h-6 ${metric.color}`} /></div>
                {isClickable && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-white/60 px-2 py-0.5 rounded-full border border-border/20">
                    Voir détails
                  </span>
                )}
              </div>
              <p className="text-3xl font-serif mb-1 font-bold">{metric.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
