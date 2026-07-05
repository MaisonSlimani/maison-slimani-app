import { useState, useMemo } from 'react'
import { Button, LuxuryLoading, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@maison/ui'
import { Package, ShoppingBag, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { useDashboardStats } from '@/hooks/admin/useDashboardStats'
import { DashboardService, Order } from '@maison/domain'

type DateFilter = 'toutes' | 'aujourdhui' | '7jours' | 'ce_mois'

function filterCommandesByDate(commandes: Order[], dateFilter: DateFilter): Order[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return commandes.filter(order => {
    if (!order.orderedAt) return true
    const orderDate = new Date(order.orderedAt)

    switch (dateFilter) {
      case 'aujourdhui':
        return orderDate >= startOfToday
      case '7jours': {
        const sevenDaysAgo = new Date(startOfToday)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return orderDate >= sevenDaysAgo
      }
      case 'ce_mois': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        return orderDate >= startOfMonth
      }
      case 'toutes':
      default:
        return true
    }
  })
}

export default function DashboardPage() {
  const { data, loading } = useDashboardStats()
  const [dateFilter, setDateFilter] = useState<DateFilter>('toutes')

  const dashboardService = useMemo(() => new DashboardService(), [])

  // Filter commands by date and re-calculate metrics
  const filteredData = useMemo(() => {
    if (!data) return null
    const filteredCommandes = filterCommandesByDate(data.commandes, dateFilter)
    const stats = dashboardService.calculateMetrics(filteredCommandes, data.produits)

    return {
      stats,
      filteredCount: filteredCommandes.length
    }
  }, [data, dateFilter, dashboardService])

  if (loading || !data || !filteredData) {
    return <LuxuryLoading fullScreen message="Chargement des statistiques..." />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={(val) => setDateFilter(val as DateFilter)}>
              <SelectTrigger className="w-[180px] bg-background border-border/80">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes les dates</SelectItem>
                <SelectItem value="aujourdhui">Aujourd'hui</SelectItem>
                <SelectItem value="7jours">7 derniers jours</SelectItem>
                <SelectItem value="ce_mois">Ce mois-ci</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/produits">
                <Package className="w-4 h-4 mr-2" /> Produits
              </Link>
            </Button>
            <Button asChild>
              <Link to="/commandes">
                <ShoppingBag className="w-4 h-4 mr-2" /> Commandes
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif text-foreground/80">Revenus et finances</h2>
          {dateFilter !== 'toutes' && (
            <p className="text-xs text-muted-foreground">
              Filtre actif : {filteredData.filteredCount} / {data.commandes.length} commandes
            </p>
          )}
        </div>
        <MetricCards stats={filteredData.stats} />
      </div>
    </div>
  )
}
