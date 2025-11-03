'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ShoppingBag, DollarSign, MapPin, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCommandes: 0,
    totalRevenus: 0,
    commandesEnAttente: 0,
    villesUniques: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chargerStats()
  }, [])

  const chargerStats = async () => {
    try {
      const supabase = createClient()
      
      // Charger les commandes
      const { data: commandes, error } = await supabase
        .from('commandes')
        .select('*')

      if (error) throw error

      // Calculer les statistiques
      const totalCommandes = commandes?.length || 0
      const totalRevenus = commandes?.reduce((acc, c) => acc + parseFloat(c.total || 0), 0) || 0
      const commandesEnAttente = commandes?.filter((c) => c.statut === 'En attente').length || 0
      const villesUniques = new Set(commandes?.map((c) => c.ville)).size || 0

      setStats({
        totalCommandes,
        totalRevenus,
        commandesEnAttente,
        villesUniques,
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  const metrics = [
    {
      label: 'Commandes totales',
      value: stats.totalCommandes,
      icon: ShoppingBag,
      color: 'text-blue-400',
    },
    {
      label: 'Revenus totaux',
      value: `${stats.totalRevenus.toLocaleString('fr-MA')} DH`,
      icon: DollarSign,
      color: 'text-green-400',
    },
    {
      label: 'En attente',
      value: stats.commandesEnAttente,
      icon: TrendingUp,
      color: 'text-yellow-400',
    },
    {
      label: 'Villes',
      value: stats.villesUniques,
      icon: MapPin,
      color: 'text-purple-400',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Tableau de bord</h1>
        <p className="text-ecru/70">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 bg-ecru/5 border-ecru/20">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
                <p className="text-2xl font-serif mb-1">{metric.value}</p>
                <p className="text-sm text-ecru/70">{metric.label}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card className="p-6 bg-ecru/5 border-ecru/20">
        <h2 className="text-xl font-serif mb-4">Bienvenue</h2>
        <p className="text-ecru/80">
          Utilisez le menu de navigation pour gérer vos produits et commandes.
        </p>
      </Card>
    </div>
  )
}

