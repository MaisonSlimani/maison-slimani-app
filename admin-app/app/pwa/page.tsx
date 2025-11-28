'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StatsCard from '@/components/admin-pwa/StatsCard'
import OrderCard from '@/components/admin-pwa/OrderCard'
import { ShoppingBag, DollarSign, Package, AlertCircle, TrendingUp, CheckCircle, MapPin, Warehouse, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AdminPWAPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCommandes: 0,
    totalRevenus: 0,
    commandesEnAttente: 0,
    produitsTotal: 0,
    commandesLivrees: 0,
    revenusMois: 0,
    villesUniques: 0,
    produitsRuptureStock: 0,
    produitsStockFaible: 0,
    totalStock: 0,
  })
  const [dernieresCommandes, setDernieresCommandes] = useState<any[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  const playDashboardNotification = useCallback((commande?: any) => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.error('❌ Erreur lors de la lecture du son (dashboard):', err)
        })
      } catch (error) {
        console.error('❌ Erreur lors de la préparation du son (dashboard):', error)
      }
    }

    const shortId = commande?.id ? commande.id.substring(0, 8) : 'N/A'
    toast.success('Nouvelle commande reçue !', {
      description: `Commande #${shortId} - ${commande?.nom_client || 'Client'}`,
    })
  }, [])

  // Initialiser l'audio pour la notification
  useEffect(() => {
    audioRef.current = new Audio('/sounds/new_command.mp3')
    audioRef.current.volume = 0.7
  }, [])

  useEffect(() => {
    const verifierSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      }
    }

    verifierSession()
    chargerStats()
    
    // Configurer l'abonnement en temps réel
    const channelName = `commandes-changes-dashboard-pwa-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commandes',
        },
        (payload) => {
          console.log('Changement détecté sur le dashboard PWA:', payload)

          if (payload.eventType === 'INSERT') {
            playDashboardNotification(payload.new)
          }

          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE' ||
            payload.eventType === 'DELETE'
          ) {
            chargerStats()
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut de l\'abonnement real-time (dashboard PWA):', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Abonnement real-time actif (dashboard PWA)')
        }
      })

    // Nettoyer l'abonnement au démontage
    return () => {
      console.log('Nettoyage de l\'abonnement real-time (dashboard PWA)')
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, playDashboardNotification])

  const chargerStats = async () => {
    try {
      setLoading(true)
      const [commandesResponse, produitsResponse] = await Promise.all([
        fetch('/api/admin/commandes?statut=tous'),
        fetch('/api/admin/produits'),
      ])

      if (!commandesResponse.ok) {
        throw new Error('Erreur lors du chargement des commandes')
      }

      const commandesResult = await commandesResponse.json().catch(() => ({ data: [] }))
      const commandes = commandesResult.data || []

      let produitsData: any[] = []
      if (produitsResponse.ok) {
        const produitsResult = await produitsResponse.json()
        produitsData = produitsResult.data || []
      }

      const totalCommandes = commandes.length || 0
      const totalRevenus = commandes
        .filter((c: any) => c.statut === 'Livrée')
        .reduce((acc: number, c: any) => acc + parseFloat(c.total || 0), 0) || 0
      const commandesEnAttente = commandes.filter((c: any) => c.statut === 'En attente').length || 0
      const commandesLivrees = commandes.filter((c: any) => c.statut === 'Livrée').length || 0
      const villesUniques = new Set(commandes.map((c: any) => c.ville)).size || 0
      const produitsTotal = produitsData.length || 0
      
      // Statistiques de stock
      const produitsRuptureStockList = produitsData.filter((p: any) => p.stock === 0) || []
      const produitsRuptureStock = produitsRuptureStockList.length || 0
      const produitsStockFaible = produitsData.filter((p: any) => p.stock > 0 && p.stock <= 5).length || 0
      const totalStock = produitsData.reduce((acc: number, p: any) => acc + (p.stock || 0), 0) || 0

      // Revenus du mois actuel
      const maintenant = new Date()
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
      const revenusMois = commandes
        .filter((c: any) => {
          const dateCommande = new Date(c.date_commande)
          return dateCommande >= debutMois && c.statut === 'Livrée'
        })
        .reduce((acc: number, c: any) => acc + parseFloat(c.total || 0), 0) || 0

      setStats({
        totalCommandes,
        totalRevenus,
        commandesEnAttente,
        produitsTotal,
        commandesLivrees,
        revenusMois,
        villesUniques,
        produitsRuptureStock,
        produitsStockFaible,
        totalStock,
      })

      setDernieresCommandes(
        commandes
          .sort((a: any, b: any) => new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime())
          .slice(0, 5)
      )
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-serif text-foreground mb-6">Tableau de bord</h1>
        </div>

        {/* Stats Grid - Main Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Commandes"
            value={stats.totalCommandes}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Revenus totaux"
            value={`${stats.totalRevenus.toLocaleString('fr-MA')} MAD`}
            icon={DollarSign}
          />
          <StatsCard
            title="Revenus ce mois"
            value={`${stats.revenusMois.toLocaleString('fr-MA')} MAD`}
            icon={TrendingUp}
          />
          <StatsCard
            title="En attente"
            value={stats.commandesEnAttente}
            icon={AlertCircle}
            className={stats.commandesEnAttente > 0 ? 'border-yellow-400/30' : ''}
          />
          <StatsCard
            title="Livrées"
            value={stats.commandesLivrees}
            icon={CheckCircle}
          />
          <StatsCard
            title="Produits"
            value={stats.produitsTotal}
            icon={Package}
          />
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Villes"
            value={stats.villesUniques}
            icon={MapPin}
          />
          <StatsCard
            title="Total stock"
            value={stats.totalStock}
            icon={Warehouse}
          />
          <StatsCard
            title="Rupture stock"
            value={stats.produitsRuptureStock}
            icon={AlertTriangle}
            className={stats.produitsRuptureStock > 0 ? 'border-red-400/30' : ''}
          />
          <StatsCard
            title="Stock faible (≤5)"
            value={stats.produitsStockFaible}
            icon={Clock}
            className={stats.produitsStockFaible > 0 ? 'border-orange-400/30' : ''}
          />
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-xl font-serif text-foreground mb-4">Dernières commandes</h2>
          <div className="space-y-3">
            {dernieresCommandes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune commande</p>
            ) : (
              dernieresCommandes.map((commande) => (
                <OrderCard
                  key={commande.id}
                  commande={commande}
                  onView={() => router.push(`/pwa/commandes/${commande.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

