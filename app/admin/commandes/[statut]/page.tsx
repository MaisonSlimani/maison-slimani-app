'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Eye, Download, AlertCircle, Package, Truck, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const statutsMap: Record<string, { nom: string; icon: typeof AlertCircle; color: string }> = {
  'en-attente': {
    nom: 'En attente',
    icon: AlertCircle,
    color: 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30',
  },
  'expediee': {
    nom: 'Expédiée',
    icon: Truck,
    color: 'bg-blue-400/20 text-blue-600 border-blue-400/30',
  },
  'livree': {
    nom: 'Livrée',
    icon: CheckCircle,
    color: 'bg-green-400/20 text-green-600 border-green-400/30',
  },
  'annulee': {
    nom: 'Annulée',
    icon: XCircle,
    color: 'bg-red-400/20 text-red-600 border-red-400/30',
  },
  'toutes': {
    nom: 'Toutes les commandes',
    icon: Package,
    color: 'bg-muted text-muted-foreground border-border',
  },
}

export default function AdminCommandesStatutPage() {
  const params = useParams()
  const router = useRouter()
  const statutSlug = params.statut as string
  const statutInfo = statutsMap[statutSlug] || { nom: 'Toutes les commandes', icon: Package, color: 'bg-muted text-muted-foreground border-border' }
  const StatutIcon = statutInfo.icon
  
  const [commandes, setCommandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCommande, setSelectedCommande] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()
  const isReloadingRef = useRef(false)
  const lastCommandeIdsRef = useRef<Set<string>>(new Set())

  // Initialiser l'audio pour la notification
  useEffect(() => {
    try {
      audioRef.current = new Audio('/sounds/new_command.mp3')
      audioRef.current.volume = 0.7
      audioRef.current.preload = 'auto'
      
      // Gérer les erreurs de chargement
      audioRef.current.addEventListener('error', (e) => {
        console.error('❌ Erreur de chargement audio:', e)
      })
      
      // Précharger l'audio pour éviter les problèmes de timing
      audioRef.current.load()
      console.log('✅ Audio initialisé:', audioRef.current.src)
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation audio:', error)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerCommandes()
    
    // Configurer l'abonnement en temps réel
    const channelName = `commandes-changes-${statutSlug}-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      
    // Ajouter un handler catch-all pour voir TOUS les événements
    channel.on('broadcast', { event: '*' }, (payload) => {
      console.log('📡 Broadcast reçu:', payload)
    })
      
    // Écouter tous les types d'événements
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commandes',
        },
        (payload) => {
          console.log('🎯 INSERT événement reçu:', payload)
          const nouvelleCommande = payload.new as any
          console.log('📦 Nouvelle commande détectée:', {
            id: nouvelleCommande?.id,
            statut: nouvelleCommande?.statut,
            nom_client: nouvelleCommande?.nom_client,
            filtreActuel: statutSlug,
            statutInfoNom: statutInfo.nom
          })
          
          // Vérifier si la nouvelle commande correspond au filtre actuel
          const commandeCorrespondAuFiltre = 
            statutSlug === 'toutes' || 
            nouvelleCommande?.statut === statutInfo.nom
          
          console.log('✅ Commande correspond au filtre:', commandeCorrespondAuFiltre)
          
          // Si la commande correspond au filtre, recharger immédiatement
          // (Le son et la notification sont gérés globalement dans le layout)
          if (commandeCorrespondAuFiltre) {
            console.log('🔄 Rechargement des commandes...')
            chargerCommandes()
          } else {
            console.log('ℹ️ Commande ne correspond pas au filtre actuel')
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'commandes',
        },
        (payload) => {
          console.log('🔄 UPDATE événement reçu:', payload)
          const commandeModifiee = payload.new as any
          const ancienneCommande = payload.old as any
          
          // Vérifier si la commande modifiée affecte la liste actuelle
          const nouvelleStatutCorrespond = statutSlug === 'toutes' || commandeModifiee?.statut === statutInfo.nom
          const ancienStatutCorrespondait = statutSlug === 'toutes' || ancienneCommande?.statut === statutInfo.nom
          
          if (nouvelleStatutCorrespond || ancienStatutCorrespondait) {
            console.log('🔄 Statut modifié, rechargement...')
            chargerCommandes()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'commandes',
        },
        (payload) => {
          console.log('🗑️ DELETE événement reçu:', payload)
          console.log('🔄 Commande supprimée, rechargement...')
          chargerCommandes()
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Statut de l\'abonnement real-time:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Abonnement real-time actif - En attente d\'événements...')
          // Test: essayer de recevoir un événement de test
          console.log('🔍 Test: Abonnement configuré pour écouter:', {
            schema: 'public',
            table: 'commandes',
            event: '*'
          })
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur de canal real-time:', err)
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️ Abonnement real-time timeout')
        } else if (status === 'CLOSED') {
          console.warn('⚠️ Canal real-time fermé')
        }
      })

    // Polling de secours pour détecter les nouvelles commandes
    // (au cas où real-time INSERT events ne fonctionnent pas)
    const pollingInterval = setInterval(() => {
      console.log('🔍 Polling: Vérification des nouvelles commandes...')
      chargerCommandes(true) // Silent mode pour ne pas interférer avec l'UI
    }, 5000) // Vérifier toutes les 5 secondes

    // Nettoyer l'abonnement et le polling au démontage
    return () => {
      console.log('Nettoyage de l\'abonnement real-time et polling')
      clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statutSlug, supabase])

  const chargerCommandes = async (silent = false) => {
    // Prévenir les appels multiples simultanés
    if (isReloadingRef.current && !silent) {
      console.log('⚠️ Rechargement déjà en cours, ignoré')
      return
    }
    
    try {
      if (!silent) {
        isReloadingRef.current = true
        setLoading(true)
      }
      // Si "toutes", charger toutes les commandes
      const statutQuery = statutSlug === 'toutes' ? 'tous' : statutInfo.nom
      const response = await fetch(`/api/admin/commandes?statut=${encodeURIComponent(statutQuery)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des commandes')
      }

      const result = await response.json()
      const nouvellesCommandes = result.data || []
      
      // Détecter les nouvelles commandes (pour le polling)
      // Toujours vérifier, même en mode silent, pour détecter les nouvelles commandes
      if (lastCommandeIdsRef.current.size > 0) {
        const nouvellesCommandesIds = new Set(nouvellesCommandes.map((c: any) => c.id))
        const anciennesCommandesIds = lastCommandeIdsRef.current
        
        // Trouver les nouvelles commandes
        const commandesNouvelles = nouvellesCommandes.filter(
          (c: any) => !anciennesCommandesIds.has(c.id)
        )
        
        if (commandesNouvelles.length > 0) {
          console.log('🆕 Nouvelles commandes détectées via polling:', commandesNouvelles.length, commandesNouvelles)
          // Le son et la notification sont gérés globalement dans le layout
          // On recharge juste la liste ici
        }
      }
      
      // Mettre à jour les IDs des commandes
      lastCommandeIdsRef.current = new Set(nouvellesCommandes.map((c: any) => c.id))
      
      if (!silent) {
        console.log(`✅ Commandes chargées: ${nouvellesCommandes.length} commande(s)`)
      }
      setCommandes(nouvellesCommandes)
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des commandes:', error)
      if (!silent) {
        toast.error(error.message || 'Erreur lors du chargement des commandes')
      }
    } finally {
      if (!silent) {
        setLoading(false)
        setTimeout(() => {
          isReloadingRef.current = false
        }, 500)
      }
    }
  }

  const handleStatutChange = async (commandeId: string, nouveauStatut: string) => {
    try {
      const response = await fetch('/api/admin/commandes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commandeId,
          statut: nouveauStatut,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Statut mis à jour')
      chargerCommandes()
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async () => {
    if (!commandeToDelete) return

    try {
      const response = await fetch(`/api/admin/commandes?id=${commandeToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      toast.success('Commande supprimée')
      chargerCommandes()
      setDeleteDialogOpen(false)
      setCommandeToDelete(null)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Client', 'Téléphone', 'Ville', 'Total', 'Statut', 'Date'].join(','),
      ...commandes.map((c) =>
        [
          c.id.substring(0, 8),
          c.nom_client,
          c.telephone,
          c.ville,
          c.total,
          c.statut,
          new Date(c.date_commande).toLocaleDateString('fr-FR'),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes-${statutSlug}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  // Grouper les commandes par statut si "toutes"
  const commandesParStatut = statutSlug === 'toutes' 
    ? commandes.reduce((acc, commande) => {
        const statut = commande.statut || 'En attente'
        if (!acc[statut]) {
          acc[statut] = []
        }
        acc[statut].push(commande)
        return acc
      }, {} as Record<string, typeof commandes>)
    : {}

  // Ordre d'affichage des statuts
  const statutsOrdre = ['En attente', 'Expédiée', 'Livrée', 'Annulée']
  const statutsAffiches = statutsOrdre.filter(statut => commandesParStatut[statut]?.length > 0)

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return <AlertCircle className="w-4 h-4" />
      case 'Expédiée':
        return <Truck className="w-4 h-4" />
      case 'Livrée':
        return <CheckCircle className="w-4 h-4" />
      case 'Annulée':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30'
      case 'Expédiée':
        return 'bg-blue-400/20 text-blue-600 border-blue-400/30'
      case 'Livrée':
        return 'bg-green-400/20 text-green-600 border-green-400/30'
      case 'Annulée':
        return 'bg-red-400/20 text-red-600 border-red-400/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/commandes')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <StatutIcon className={cn('w-6 h-6', statutInfo.color.split(' ')[1])} />
            <div>
              <h1 className="text-3xl font-serif mb-2">{statutInfo.nom}</h1>
              <p className="text-muted-foreground">
                {commandes.length} commande{commandes.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Affichage par catégorie si "toutes" */}
      {statutSlug === 'toutes' ? (
        <div className="space-y-8">
          {statutsAffiches.map((statut) => (
            <div key={statut}>
              <div className="flex items-center gap-3 mb-6">
                {getStatutIcon(statut)}
                <h2 className="text-2xl font-serif">{statut}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(statut)}`}>
                  {commandesParStatut[statut].length} commande{commandesParStatut[statut].length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid gap-4">
                {commandesParStatut[statut].map((commande) => (
                  <Card key={commande.id} className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${
                    statut === 'En attente' ? 'border-yellow-400/50 bg-yellow-50/30' : 'border-border'
                  }`}>
                    {renderCommandeCard(commande, statut, getStatutColor)}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Affichage simple pour un statut spécifique
        <div className="grid gap-4">
          {commandes.map((commande) => (
            <Card key={commande.id} className={`p-6 bg-card border-2 transition-all hover:shadow-lg ${
              commande.statut === 'En attente' ? 'border-yellow-400/50 bg-yellow-50/30' : 'border-border'
            }`}>
              {renderCommandeCard(commande, commande.statut, getStatutColor)}
            </Card>
          ))}
        </div>
      )}

      {commandes.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucune commande dans cette catégorie pour le moment.
          </p>
        </Card>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  function renderCommandeCard(commande: any, statut: string, getStatutColor: (s: string) => string) {
    return (
      <div className="flex gap-6">
        {/* Produits avec images */}
        <div className="flex gap-2 flex-shrink-0">
          {(commande.produits || []).slice(0, 3).map((p: any, idx: number) => (
            <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.nom}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  {p.nom.substring(0, 2)}
                </div>
              )}
            </div>
          ))}
          {(commande.produits || []).length > 3 && (
            <div className="relative w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              +{(commande.produits || []).length - 3}
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h3 className="text-xl font-serif">
                Commande #{commande.id.substring(0, 8)}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(statut)}`}>
                {commande.statut}
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(commande.date_commande).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Liste des produits */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-muted-foreground">Produits :</p>
              <div className="flex flex-wrap gap-2">
                {(commande.produits || []).map((p: any, idx: number) => (
                  <span key={idx} className="text-sm bg-muted px-2 py-1 rounded">
                    {p.nom} × {p.quantite}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Client</p>
                <p className="text-foreground font-medium">{commande.nom_client}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Téléphone</p>
                <p className="text-foreground font-medium">{commande.telephone}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Total</p>
                <p className="text-dore font-medium text-lg">
                  {commande.total.toLocaleString('fr-MA')} DH
                </p>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">
                📍 {commande.ville} - {commande.adresse}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCommandeToDelete(commande.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedCommande(commande)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Détails de la commande #{commande.id.substring(0, 8)}</DialogTitle>
                </DialogHeader>
                {selectedCommande && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Produits commandés</h4>
                      <div className="space-y-3">
                        {(selectedCommande.produits || []).map((p: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            {p.image_url && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                                <Image
                                  src={p.image_url}
                                  alt={p.nom}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{p.nom}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantité: {p.quantite} × {p.prix.toLocaleString('fr-MA')} DH
                              </p>
                            </div>
                            <p className="font-medium text-dore">
                              {(p.prix * p.quantite).toLocaleString('fr-MA')} DH
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-lg font-medium">
                        Total: <span className="text-dore">{selectedCommande.total.toLocaleString('fr-MA')} DH</span>
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Select
              value={commande.statut}
              onValueChange={(value) => handleStatutChange(commande.id, value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Expédiée">Expédiée</SelectItem>
                <SelectItem value="Livrée">Livrée</SelectItem>
                <SelectItem value="Annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }
}

