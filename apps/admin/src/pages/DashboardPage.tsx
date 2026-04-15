import { Button } from '@maison/ui'
import { Package, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { LuxuryLoading } from '@maison/ui'
import { useDashboardStats } from '@/hooks/admin/useDashboardStats'

export default function DashboardPage() {
  const { data, loading } = useDashboardStats()

  if (loading || !data) {
    return <LuxuryLoading fullScreen message="Chargement des statistiques..." />
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
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

      <div>
        <h2 className="text-xl font-serif mb-4 text-foreground/80">Revenus et finances</h2>
        <MetricCards stats={data.stats} />
      </div>

      {/* Other sections like RecentOrders will be added here as modular components */}
    </div>
  )
}
