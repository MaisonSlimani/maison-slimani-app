import { useState, useMemo } from 'react'
import { 
  Button, 
  LuxuryLoading, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@maison/ui'
import { Package, ShoppingBag, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { useDashboardStats } from '@/hooks/admin/useDashboardStats'
import { DashboardService, Order, Product } from '@maison/domain'

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

interface OutOfStockDialogProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
}

function OutOfStockDialog({ isOpen, onClose, products }: OutOfStockDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-charbon">Produits en rupture de stock</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Ces articles ont un stock épuisé et ne sont plus commandables par les clients.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto pr-2 divide-y divide-border/40 mt-4">
          {products.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded border border-border bg-muted flex-shrink-0 overflow-hidden relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground uppercase">Sans Image</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charbon line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category || 'Sans catégorie'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                  Épuisé
                </span>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                  <Link to="/produits" onClick={onClose}>
                    Gérer
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PendingOrdersDialogProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  isFiltered: boolean
}

function PendingOrdersDialog({ isOpen, onClose, orders, isFiltered }: PendingOrdersDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-charbon">
            Commandes en attente {isFiltered && ' (Filtrées)'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Commandes nécessitant votre attention et validation pour la période active.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto pr-2 divide-y divide-border/40 mt-4 font-sans">
          {orders.map((c) => (
            <div key={c.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-charbon">{c.customerName}</p>
                <p className="text-xs text-muted-foreground">
                  {c.city} • {c.orderedAt ? new Date(c.orderedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Date inconnue'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-serif font-bold text-charbon">
                  {c.total.toLocaleString('fr-MA')} DH
                </span>
                <Button asChild size="sm" className="h-8 text-xs bg-charbon hover:bg-charbon/90 text-white font-serif">
                  <Link to="/commandes/en-attente" onClick={onClose}>
                    Gérer
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DashboardPage() {
  const { data, loading } = useDashboardStats()
  const [dateFilter, setDateFilter] = useState<DateFilter>('toutes')
  const [detailMetric, setDetailMetric] = useState<'produitsRupture' | 'commandesEnAttente' | null>(null)

  const dashboardService = useMemo(() => new DashboardService(), [])

  // Filter commands by date and re-calculate metrics
  const filteredData = useMemo(() => {
    if (!data) return null
    const filteredCommandes = filterCommandesByDate(data.commandes, dateFilter)
    const stats = dashboardService.calculateMetrics(filteredCommandes, data.produits)

    return {
      stats,
      filteredCount: filteredCommandes.length,
      filteredCommandes
    }
  }, [data, dateFilter, dashboardService])

  const outOfStockProducts = useMemo(() => {
    if (!data) return []
    return data.produits.filter(p => (p.totalStock || 0) <= 0)
  }, [data])

  const pendingOrders = useMemo(() => {
    if (!filteredData) return []
    return filteredData.filteredCommandes.filter(c => c.status === 'en_attente' || c.status === 'En attente')
  }, [filteredData])

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
        <MetricCards 
          stats={filteredData.stats} 
          onCardClick={(key) => {
            if (key === 'produitsRupture' || key === 'commandesEnAttente') {
              setDetailMetric(key)
            }
          }} 
        />
      </div>

      <OutOfStockDialog 
        isOpen={detailMetric === 'produitsRupture'} 
        onClose={() => setDetailMetric(null)} 
        products={outOfStockProducts} 
      />

      <PendingOrdersDialog 
        isOpen={detailMetric === 'commandesEnAttente'} 
        onClose={() => setDetailMetric(null)} 
        orders={pendingOrders}
        isFiltered={dateFilter !== 'toutes'}
      />
    </div>
  )
}
