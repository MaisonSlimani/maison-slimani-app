'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Truck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LuxuryLoading } from '@/components/ui/luxury-loading'

const statutConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
  'En attente': {
    icon: AlertCircle,
    color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30',
    label: 'En attente',
  },
  'Expédiée': {
    icon: Truck,
    color: 'bg-blue-400/20 text-blue-600 border-blue-400/30',
    label: 'Expédiée',
  },
  'Livrée': {
    icon: CheckCircle,
    color: 'bg-green-400/20 text-green-600 border-green-400/30',
    label: 'Livrée',
  },
  'Annulée': {
    icon: XCircle,
    color: 'bg-red-400/20 text-red-600 border-red-400/30',
    label: 'Annulée',
  },
}

export default function AdminPWACommandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const commandeId = params.id as string
  const [commande, setCommande] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const chargerCommande = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/commandes/${commandeId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Commande introuvable')
          router.push('/pwa/commandes')
          return
        }
        throw new Error('Erreur')
      }
      const result = await response.json()
      setCommande(result.data)
    } catch (error) {
      toast.error('Erreur lors du chargement')
      router.push('/pwa/commandes')
    } finally {
      setLoading(false)
    }
  }, [commandeId, router])

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
    chargerCommande()
  }, [commandeId, router, chargerCommande])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveau_statut: newStatus }),
      })

      if (!response.ok) throw new Error('Erreur')
      toast.success('Statut mis à jour')
      chargerCommande()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <LuxuryLoading message="Chargement de la commande..." />
      </div>
    )
  }

  if (!commande) {
    return (
      <div className="w-full">
        <div className="px-4 py-8 text-center text-muted-foreground">Commande introuvable</div>
      </div>
    )
  }

  const config = statutConfig[commande.statut] || statutConfig['En attente']
  const StatutIcon = config.icon

  return (
    <div className="w-full">
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif text-foreground">Commande #{commande.id.substring(0, 8)}</h1>
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif font-semibold text-foreground mb-1">
                {commande.nom_client}
              </h2>
              <p className="text-sm text-muted-foreground">
                {commande.ville} • {commande.telephone}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn('text-xs', config.color)}
            >
              <StatutIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">Date de commande</span>
              <span className="text-sm font-medium">
                {format(new Date(commande.date_commande), 'PPp', { locale: fr })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-serif text-dore font-semibold">
                {commande.total.toLocaleString('fr-MA')} MAD
              </span>
            </div>
          </div>
        </Card>

        {/* Products */}
        <Card className="p-4">
          <h3 className="font-serif font-semibold text-foreground mb-4">
            Produits ({commande.produits?.length || 0})
          </h3>
          <div className="space-y-3">
            {commande.produits && commande.produits.length > 0 ? (
              commande.produits.map((produit: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  {produit.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
                      <Image
                        src={produit.image_url}
                        alt={produit.nom || 'Produit'}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{produit.nom || 'Produit sans nom'}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {produit.quantite || 1} × {produit.prix?.toLocaleString('fr-MA') || '0'} MAD
                    </p>
                  </div>
                  <p className="font-medium text-dore shrink-0">
                    {((produit.prix || 0) * (produit.quantite || 1)).toLocaleString('fr-MA')} MAD
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Aucun produit</p>
            )}
          </div>
        </Card>

        {/* Address */}
        <Card className="p-4">
          <h3 className="font-serif font-semibold text-foreground mb-4">Informations de livraison</h3>
          <div className="space-y-2 text-sm">
            <p className="text-foreground">{commande.nom_client}</p>
            <p className="text-muted-foreground">{commande.adresse}</p>
            <p className="text-muted-foreground">{commande.ville}</p>
            <p className="text-muted-foreground">{commande.telephone}</p>
          </div>
        </Card>

        {/* Status Update */}
        <Card className="p-4">
          <h3 className="font-serif font-semibold text-foreground mb-4">Modifier le statut</h3>
          <Select
            value={commande.statut}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Expédiée">Expédiée</SelectItem>
              <SelectItem value="Livrée">Livrée</SelectItem>
              <SelectItem value="Annulée">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </Card>
      </div>
    </div>
  )
}

