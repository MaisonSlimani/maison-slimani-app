'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ArrowRight, AlertCircle, Truck, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const statuts = [
  {
    slug: 'en-attente',
    nom: 'En attente',
    description: 'Nouvelles commandes en attente de traitement. Actions requises rapidement.',
    icon: AlertCircle,
    color: 'from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-200',
    badgeColor: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30',
  },
  {
    slug: 'expediee',
    nom: 'Expédiée',
    description: 'Commandes expédiées et en cours de livraison. Suivez le statut de livraison.',
    icon: Truck,
    color: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-400/20 text-blue-600 border-blue-400/30',
  },
  {
    slug: 'livree',
    nom: 'Livrée',
    description: 'Commandes livrées avec succès. Archivez les commandes terminées.',
    icon: CheckCircle,
    color: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-400/20 text-green-600 border-green-400/30',
  },
  {
    slug: 'annulee',
    nom: 'Annulée',
    description: 'Commandes annulées. Consultez l\'historique des annulations.',
    icon: XCircle,
    color: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-400/20 text-red-600 border-red-400/30',
  },
]

export default function AdminCommandesPage() {
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif mb-2">Gestion des commandes</h1>
        <p className="text-muted-foreground">Sélectionnez un statut pour gérer les commandes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {statuts.map((statut, index) => {
          const Icon = statut.icon
          return (
            <motion.div
              key={statut.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'p-6 cursor-pointer transition-all hover:shadow-xl border-2 overflow-hidden group',
                  `bg-gradient-to-br ${statut.color} ${statut.borderColor} hover:scale-105`
                )}
                onClick={() => router.push(`/admin/commandes/${statut.slug}`)}
              >
                <div className="flex gap-6 items-start">
                  <div className={cn(
                    'w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg border-2',
                    statut.borderColor
                  )}>
                    <Icon className={cn('w-12 h-12', statut.badgeColor.replace('bg-', 'text-').split(' ')[0])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-2xl font-serif mb-2 text-charbon">{statut.nom}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {statut.description}
                        </p>
                      </div>
                      <Package className="w-6 h-6 text-dore flex-shrink-0 mt-1" />
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 group-hover:bg-white group-hover:text-charbon"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/commandes/${statut.slug}`)
                      }}
                    >
                      Voir les commandes
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Card className="p-6 bg-muted/30 border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Vous souhaitez voir toutes les commandes en même temps ?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/commandes/toutes')}
          >
            Voir toutes les commandes
          </Button>
        </div>
      </Card>
    </div>
  )
}
