'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LuxuryLoading } from '@/components/ui/luxury-loading'
import { MessageSquare, Search, Filter, CheckCircle, XCircle, Flag, Trash2, Eye, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import OptimizedImage from '@/components/OptimizedImage'

interface Comment {
  id: string
  produit_id: string
  nom: string
  email?: string
  rating: number
  commentaire: string
  images?: string[]
  flagged: boolean
  approved: boolean
  created_at: string
  updated_at?: string
  produits?: {
    nom: string
    categorie: string
  }
}

export default function AdminCommentairesPage() {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'flagged' | 'pending'>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [flaggedCount, setFlaggedCount] = useState(0)
  const limit = 50

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        filter,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      })
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/commentaires?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }

      setComments(data.data || [])
      setTotalCount(data.count || 0)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [filter, search, page])

  const fetchFlaggedCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/commentaires?filter=flagged&limit=1')
      const data = await response.json()
      if (response.ok) {
        setFlaggedCount(data.count || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de commentaires signalés:', error)
    }
  }, [])

  useEffect(() => {
    fetchComments()
    fetchFlaggedCount()
  }, [fetchComments, fetchFlaggedCount])

  // Real-time updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('commentaires-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commentaires' },
        () => {
          fetchComments()
          fetchFlaggedCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchComments, fetchFlaggedCount])

  const handleApprove = async (id: string) => {
    setOperationLoading(true)
    try {
      const response = await fetch(`/api/admin/commentaires/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, flagged: false }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Commentaire approuvé')
      fetchComments()
      fetchFlaggedCount()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleReject = async (id: string) => {
    setOperationLoading(true)
    try {
      const response = await fetch(`/api/admin/commentaires/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Commentaire rejeté')
      fetchComments()
      fetchFlaggedCount()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleFlag = async (id: string, flagged: boolean) => {
    setOperationLoading(true)
    try {
      const response = await fetch(`/api/admin/commentaires/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(flagged ? 'Commentaire signalé' : 'Signalement retiré')
      fetchComments()
      fetchFlaggedCount()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setOperationLoading(true)
    try {
      const response = await fetch(`/api/admin/commentaires/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Commentaire supprimé')
      fetchComments()
      fetchFlaggedCount()
      setDeleteDialogOpen(false)
      setSelectedComment(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    setOperationLoading(true)
    try {
      const response = await fetch('/api/admin/commentaires', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur')
      }

      toast.success(`${selectedIds.size} commentaire(s) supprimé(s)`)
      setSelectedIds(new Set())
      fetchComments()
      fetchFlaggedCount()
      setBulkDeleteDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(comments.map((c) => c.id)))
    }
  }

  if (loading && comments.length === 0) {
    return <LuxuryLoading message="Chargement des commentaires..." fullScreen />
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Commentaires</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les avis et commentaires des clients
          </p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} sélectionné(s)
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={operationLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, commentaire ou produit..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={(value: any) => {
            setFilter(value)
            setPage(1)
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
              <SelectItem value="flagged">
                Signalés {flaggedCount > 0 && `(${flaggedCount})`}
              </SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Comments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left">
                  <Checkbox
                    checked={selectedIds.size === comments.length && comments.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium">Produit</th>
                <th className="p-4 text-left text-sm font-medium">Auteur</th>
                <th className="p-4 text-left text-sm font-medium">Note</th>
                <th className="p-4 text-left text-sm font-medium">Commentaire</th>
                <th className="p-4 text-left text-sm font-medium">Date</th>
                <th className="p-4 text-left text-sm font-medium">Statut</th>
                <th className="p-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr
                  key={comment.id}
                  className={cn(
                    'border-b border-border hover:bg-muted/50 transition-colors',
                    comment.flagged && 'bg-red-50/50 dark:bg-red-950/10'
                  )}
                >
                  <td className="p-4">
                    <Checkbox
                      checked={selectedIds.has(comment.id)}
                      onCheckedChange={() => toggleSelect(comment.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">
                      {comment.produits?.nom || 'Produit inconnu'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comment.produits?.categorie}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium">{comment.nom}</div>
                    {comment.email && (
                      <div className="text-xs text-muted-foreground">{comment.email}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-4 h-4',
                            star <= comment.rating
                              ? 'fill-dore text-dore'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-md">
                    <p className="text-sm line-clamp-2">{comment.commentaire}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => {
                        setSelectedComment(comment)
                        setViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Voir tout
                    </Button>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {comment.approved ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                          <CheckCircle className="w-3 h-3" />
                          Approuvé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                          <XCircle className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                      {comment.flagged && (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                          <Flag className="w-3 h-3" />
                          Signalé
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {!comment.approved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(comment.id)}
                          disabled={operationLoading}
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      {comment.approved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(comment.id)}
                          disabled={operationLoading}
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4 text-yellow-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlag(comment.id, !comment.flagged)}
                        disabled={operationLoading}
                        title={comment.flagged ? 'Retirer le signalement' : 'Signaler'}
                      >
                        <Flag className={cn('w-4 h-4', comment.flagged && 'text-red-600 fill-current')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedComment(comment)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={operationLoading}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comments.length === 0 && !loading && (
          <div className="p-12 text-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun commentaire trouvé</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {page} sur {totalPages} ({totalCount} commentaires)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Comment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du commentaire</DialogTitle>
            <DialogDescription>
              {selectedComment?.produits?.nom}
            </DialogDescription>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{selectedComment.nom}</span>
                  {selectedComment.email && (
                    <span className="text-sm text-muted-foreground">{selectedComment.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-5 h-5',
                        star <= selectedComment.rating
                          ? 'fill-dore text-dore'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Commentaire:</p>
                <p className="text-sm whitespace-pre-wrap">{selectedComment.commentaire}</p>
              </div>
              
              {/* Display images if any */}
              {selectedComment.images && selectedComment.images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Photos ({selectedComment.images.length}):</p>
                  <div className={cn(
                    "grid gap-2",
                    selectedComment.images.length === 1 ? "grid-cols-1" :
                    selectedComment.images.length === 2 ? "grid-cols-2" :
                    "grid-cols-3"
                  )}>
                    {selectedComment.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <OptimizedImage
                          src={imageUrl}
                          alt={`Image ${index + 1} de ${selectedComment.nom}`}
                          fill
                          objectFit="cover"
                          className="transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 200px, 250px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Date: {new Date(selectedComment.created_at).toLocaleString('fr-FR')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le commentaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le commentaire sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedComment && handleDelete(selectedComment.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedIds.size} commentaire(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les commentaires sélectionnés seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

