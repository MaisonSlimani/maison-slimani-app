'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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
  const commandesRef = useRef<any[]>([])

  const sortCommandes = useCallback((list: any[]) => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a?.date_commande || 0).getTime()
      const dateB = new Date(b?.date_commande || 0).getTime()
      return dateB - dateA
    })
  }, [])

  const updateCommandesList = useCallback(
    (updater: (prev: any[]) => any[]) => {
      setCommandes((prev) => {
        const next = updater(prev)
        commandesRef.current = next
        return next
      })
    },
    []
  )

  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) return
    
    // Vérifier si l'audio est prêt à être joué
    if (audioRef.current.readyState < 2) {
      // Si l'audio n'est pas encore chargé, essayer de le charger
      audioRef.current.load()
      return
    }
    
    try {
      audioRef.current.currentTime = 0
      const playPromise = audioRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Erreur silencieuse - l'audio n'est pas critique pour le fonctionnement
          console.debug('Audio playback failed (non-critical):', err)
        })
      }
    } catch (error) {
      // Erreur silencieuse
      console.debug('Audio preparation failed (non-critical):', error)
    }
  }, [])

  // Initialiser l'audio pour la notification
  useEffect(() => {
    let audio: HTMLAudioElement | null = null
    
    try {
      audio = new Audio('/sounds/new_command.mp3')
      audio.volume = 0.7
      audio.preload = 'auto'
      
      // Gérer les erreurs de chargement de manière silencieuse
      audio.addEventListener('error', (e) => {
        // Ne pas logger l'erreur complète, juste indiquer que l'audio n'est pas disponible
        console.debug('Audio file not available, notifications will be silent')
        audioRef.current = null
      })
      
      // Vérifier quand l'audio est prêt
      audio.addEventListener('canplaythrough', () => {
        audioRef.current = audio
      })
      
      // Gérer les erreurs de chargement réseau
      audio.addEventListener('loadstart', () => {
        // Le chargement a commencé
      })
      
      // Précharger l'audio (errors are handled by the 'error' event listener above)
      audio.load()
    } catch (error) {
      // Erreur lors de la création de l'audio - ne pas bloquer l'application
      console.debug('Audio initialization failed (non-critical):', error)
      audioRef.current = null
    }
    
    // Cleanup
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
        audio.load()
      }
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerCommandes()

    const channelName = `commandes-changes-${statutSlug}-${Date.now()}`
    const channel = supabase.channel(channelName)

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'commandes' },
        (payload) => {
          const nouvelleCommande = payload.new as any
          const correspond =
            statutSlug === 'toutes' || nouvelleCommande?.statut === statutInfo.nom

          if (!correspond) {
            return
          }

          playNotificationSound()
          updateCommandesList((prev) => {
            const index = prev.findIndex((c) => c.id === nouvelleCommande.id)
            if (index !== -1) {
              const next = [...prev]
              next[index] = nouvelleCommande
              return sortCommandes(next)
            }

            return sortCommandes([nouvelleCommande, ...prev])
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'commandes' },
        (payload) => {
          const commandeModifiee = payload.new as any
          const ancienneCommande = payload.old as any

          const nouvelleCorrespond =
            statutSlug === 'toutes' || commandeModifiee?.statut === statutInfo.nom
          const ancienneCorrespondait =
            statutSlug === 'toutes' || ancienneCommande?.statut === statutInfo.nom

          if (!nouvelleCorrespond && !ancienneCorrespondait) {
            return
          }

          updateCommandesList((prev) => {
            let next = [...prev]
            const index = next.findIndex((c) => c.id === commandeModifiee.id)

            if (nouvelleCorrespond) {
              if (index !== -1) {
                next[index] = commandeModifiee
              } else {
                next = [commandeModifiee, ...next]
              }
            } else if (index !== -1) {
              next.splice(index, 1)
            }

            return sortCommandes(next)
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'commandes' },
        (payload) => {
          const commandeSupprimee = payload.old as any
          if (
            statutSlug !== 'toutes' &&
            commandeSupprimee?.statut !== statutInfo.nom
          ) {
            return
          }

          updateCommandesList((prev) =>
            prev.filter((commande) => commande.id !== commandeSupprimee.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statutSlug,
    supabase,
    statutInfo.nom,
    playNotificationSound,
    sortCommandes,
    updateCommandesList,
  ])

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
      
      if (!silent) {
        console.log(`✅ Commandes chargées: ${nouvellesCommandes.length} commande(s)`)
      }
      updateCommandesList(() => sortCommandes(nouvellesCommandes))
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
        let errorMessage = 'Erreur lors de la suppression'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
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
                {commandesParStatut[statut].map((commande: any) => (
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

