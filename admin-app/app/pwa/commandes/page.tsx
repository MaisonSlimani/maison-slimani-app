'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import OrderCard from '@/components/admin-pwa/OrderCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function AdminPWACommandesPage() {
  const router = useRouter()
  const [commandes, setCommandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statutFilter, setStatutFilter] = useState<string>('tous')

  const chargerCommandes = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statutFilter && statutFilter !== 'tous') {
        params.set('statut', statutFilter)
      }

      const response = await fetch(`/api/admin/commandes?${params.toString()}`)
      if (!response.ok) throw new Error('Erreur')
      const result = await response.json()
      setCommandes(result.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [statutFilter])

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
    chargerCommandes()
  }, [router, chargerCommandes])

  const handleStatusChange = async (commandeId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveau_statut: newStatus }),
      })

      if (!response.ok) throw new Error('Erreur')
      toast.success('Statut mis à jour')
      chargerCommandes()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
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
          <h1 className="text-2xl font-serif text-foreground mb-4">Commandes</h1>
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Toutes</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Expédiée">Expédiée</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
              <SelectItem value="Annulée">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {commandes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune commande</p>
          ) : (
            commandes.map((commande) => (
              <OrderCard
                key={commande.id}
                commande={commande}
                onView={() => router.push(`/pwa/commandes/${commande.id}`)}
                onStatusChange={(newStatus) => handleStatusChange(commande.id, newStatus)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

