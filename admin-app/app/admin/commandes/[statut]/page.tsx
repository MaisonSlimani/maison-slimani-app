'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LoadingButton } from '@/components/ui/loading-overlay'
import { LuxuryLoading } from '@/components/ui/luxury-loading'
import { Eye, Download, AlertCircle, Package, Truck, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Commande {
  id: string
  statut: string
  nom_client: string
  telephone?: string
  ville?: string
  total: number
  date_commande: string
  produits?: any[]
}

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
  const queryClient = useQueryClient()
  const statutSlug = params.statut as string
  const statutInfo = statutsMap[statutSlug] || { nom: 'Toutes les commandes', icon: Package, color: 'bg-muted text-muted-foreground border-border' }
  const StatutIcon = statutInfo.icon
  
  const [selectedCommande, setSelectedCommande] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commandeToDelete, setCommandeToDelete] = useState<string | null>(null)
  const [expedierDialogOpen, setExpedierDialogOpen] = useState(false)
  const [annulerDialogOpen, setAnnulerDialogOpen] = useState(false)
  const [livreeDialogOpen, setLivreeDialogOpen] = useState(false)
  const [commandeToUpdate, setCommandeToUpdate] = useState<{ id: string; action: string } | null>(null)
  const [operationLoading, setOperationLoading] = useState(false)
  const [operationMessage, setOperationMessage] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const supabase = createClient()

  const sortCommandes = useCallback((list: any[]) => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a?.date_commande || 0).getTime()
      const dateB = new Date(b?.date_commande || 0).getTime()
      return dateB - dateA
    })
  }, [])

  // Map statut slug to API query parameter
  const statutQuery = statutSlug === 'toutes' ? 'tous' : statutSlug === 'en-attente' ? 'En attente' : statutSlug === 'expediee' ? 'Expédiée' : statutSlug === 'livree' ? 'Livrée' : statutSlug === 'annulee' ? 'Annulée' : 'tous'

  // Use React Query for commandes
  const { data: commandesData, isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-commandes', statutSlug],
    queryFn: async () => {
      const response = await fetch(`/api/admin/commandes?statut=${encodeURIComponent(statutQuery)}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || errorData.details || 'Erreur lors du chargement des commandes')
      }
      const result = await response.json()
      return sortCommandes(result.data || [])
    },
    staleTime: 1 * 60 * 1000, // 1 minute - orders change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const commandes: Commande[] = commandesData || []

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
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
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

          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
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

          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
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
    queryClient,
    playNotificationSound,
  ])


  const handleStatutChange = async (commandeId: string, nouveauStatut: string) => {
    setOperationLoading(true)
    const actionMessages: Record<string, string> = {
      'Expédiée': 'Expédition de la commande...',
      'Livrée': 'Marquage comme livrée...',
      'Annulée': 'Annulation de la commande...',
    }
    setOperationMessage(actionMessages[nouveauStatut] || 'Mise à jour en cours...')
    
    try {
      const response = await fetch(`/api/admin/commandes/${commandeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nouveau_statut: nouveauStatut,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Statut mis à jour')
      queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      
      // Trigger sidebar badge refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderStatusChanged'))
      }
      
      // Close all dialogs
      setExpedierDialogOpen(false)
      setAnnulerDialogOpen(false)
      setLivreeDialogOpen(false)
      setCommandeToUpdate(null)
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setOperationLoading(false)
      setOperationMessage('')
    }
  }

  const handleActionClick = (commandeId: string, action: string) => {
    setCommandeToUpdate({ id: commandeId, action })
    if (action === 'Expédier') {
      setExpedierDialogOpen(true)
    } else if (action === 'Annuler') {
      setAnnulerDialogOpen(true)
    } else if (action === 'Livrée') {
      setLivreeDialogOpen(true)
    }
  }

  const handleDelete = async () => {
    if (!commandeToDelete) return

    setOperationLoading(true)
    setOperationMessage('Suppression de la commande...')

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
      queryClient.invalidateQueries({ queryKey: ['admin-commandes'] })
      
      // Trigger sidebar badge refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderStatusChanged'))
      }
      
      setDeleteDialogOpen(false)
      setCommandeToDelete(null)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    } finally {
      setOperationLoading(false)
      setOperationMessage('')
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
    return <LuxuryLoading fullScreen message="Chargement des commandes..." />
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
      <LoadingButton isLoading={operationLoading} message={operationMessage} />
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

      {/* Dialog de confirmation Expédier */}
      <AlertDialog open={expedierDialogOpen} onOpenChange={setExpedierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'expédition</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir marquer cette commande comme expédiée ? Un email de notification sera envoyé au client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => commandeToUpdate && handleStatutChange(commandeToUpdate.id, 'Expédiée')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation Annuler */}
      <AlertDialog open={annulerDialogOpen} onOpenChange={setAnnulerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette commande ? Cette action changera le statut de la commande.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => commandeToUpdate && handleStatutChange(commandeToUpdate.id, 'Annulée')}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation Livrée */}
      <AlertDialog open={livreeDialogOpen} onOpenChange={setLivreeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la livraison</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir marquer cette commande comme livrée ? Cette action finalise la commande.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => commandeToUpdate && handleStatutChange(commandeToUpdate.id, 'Livrée')}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmer
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
            {commande.email && (
              <div className="mt-2 text-sm">
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="text-foreground font-medium">{commande.email}</p>
              </div>
            )}
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">
                📍 {commande.ville} - {commande.adresse}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 ml-4 items-end min-w-[200px]">
            {/* Status-specific action buttons - Primary actions */}
            <div className="flex flex-col gap-2 w-full">
              {statut === 'En attente' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleActionClick(commande.id, 'Expédier')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Expédier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleActionClick(commande.id, 'Annuler')}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </>
              )}
              {statut === 'Expédiée' && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleActionClick(commande.id, 'Livrée')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Livrée
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleActionClick(commande.id, 'Annuler')}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </>
              )}
              {(statut === 'Livrée' || statut === 'Annulée') && (
                <div className="text-sm text-muted-foreground flex items-center justify-center px-3 py-2 w-full border rounded-md">
                  {statut}
                </div>
              )}
            </div>
            
            {/* Secondary actions - View and Delete */}
            <div className="flex gap-2 pt-2 border-t w-full">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCommande(commande)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-scroll">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCommandeToDelete(commande.id)
                  setDeleteDialogOpen(true)
                }}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

