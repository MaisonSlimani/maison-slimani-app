import { motion } from 'framer-motion'
import { Card } from '@maison/ui'
import { ShoppingBag, DollarSign, Clock, Warehouse, AlertTriangle } from 'lucide-react'

interface MetricCardsProps {
  stats: {
    totalCommandes: number
    totalRevenus: number
    commandesEnAttente: number
    totalStock: number
    produitsRupture: number
  }
}

export function MetricCards({ stats }: MetricCardsProps) {
  const metrics = [
    { label: 'Commandes totales', value: stats.totalCommandes, icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Revenus totaux', value: `${stats.totalRevenus.toLocaleString('fr-MA')} DH`, icon: DollarSign, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: 'En attente', value: stats.commandesEnAttente, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { label: 'Total stock', value: stats.totalStock, icon: Warehouse, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
    { label: 'Rupture de stock', value: stats.produitsRupture, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className={`p-6 bg-card border-border hover:shadow-lg transition-shadow ${metric.bgColor}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}><Icon className={`w-6 h-6 ${metric.color}`} /></div>
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
