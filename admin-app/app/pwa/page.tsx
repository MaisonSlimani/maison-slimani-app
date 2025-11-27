'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatsCard from '@/components/admin-pwa/StatsCard'
import OrderCard from '@/components/admin-pwa/OrderCard'
import { ShoppingBag, DollarSign, Package, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPWAPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCommandes: 0,
    totalRevenus: 0,
    commandesEnAttente: 0,
    produitsTotal: 0,
  })
  const [dernieresCommandes, setDernieresCommandes] = useState<any[]>([])

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
  }, [router])

  const chargerStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/commandes')
      if (!response.ok) throw new Error('Erreur')
      const result = await response.json()
      const commandes = result.data || []

      const totalCommandes = commandes.length
      const totalRevenus = commandes
        .filter((c: any) => c.statut === 'Livrée')
        .reduce((sum: number, c: any) => sum + (c.total || 0), 0)
      const commandesEnAttente = commandes.filter((c: any) => c.statut === 'En attente').length

      // Fetch products count
      try {
        const produitsResponse = await fetch('/api/admin/produits')
        if (produitsResponse.ok) {
          const produitsResult = await produitsResponse.json()
          setStats({
            totalCommandes,
            totalRevenus,
            commandesEnAttente,
            produitsTotal: produitsResult.data?.length || 0,
          })
        } else {
          setStats({
            totalCommandes,
            totalRevenus,
            commandesEnAttente,
            produitsTotal: 0,
          })
        }
      } catch {
        setStats({
          totalCommandes,
          totalRevenus,
          commandesEnAttente,
          produitsTotal: 0,
        })
      }

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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Commandes"
            value={stats.totalCommandes}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Revenus"
            value={`${stats.totalRevenus.toLocaleString('fr-MA')} MAD`}
            icon={DollarSign}
          />
          <StatsCard
            title="En attente"
            value={stats.commandesEnAttente}
            icon={AlertCircle}
            className={stats.commandesEnAttente > 0 ? 'border-yellow-400/30' : ''}
          />
          <StatsCard
            title="Produits"
            value={stats.produitsTotal}
            icon={Package}
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

