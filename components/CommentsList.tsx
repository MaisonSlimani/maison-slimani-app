'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import RatingDisplay from './RatingDisplay'
import { Edit2, Trash2, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import OptimizedImage from './OptimizedImage'

interface Comment {
  id: string
  nom: string
  email?: string
  rating: number
  commentaire: string
  images?: string[]
  created_at: string
  updated_at?: string
  session_token?: string // Only present if user owns the comment
}

interface CommentsListProps {
  produitId: string
  onCommentUpdate?: () => void
  className?: string
}

export default function CommentsList({ produitId, onCommentUpdate, className }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nom: '', rating: 0, commentaire: '' })

  const limit = 10

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/commentaires?produit_id=${produitId}&sort=${sort}&limit=${limit}&offset=${(page - 1) * limit}`
      )
      const data = await response.json()

      if (data.success) {
        // Check which comments belong to current user
        const sessionToken = localStorage.getItem('comment_session_token')
        const commentsWithOwnership = (data.data || []).map((comment: Comment) => ({
          ...comment,
          // Note: We can't check ownership from client-side, but we'll try to edit/delete
          // and let the server validate via session token cookie
        }))
        setComments(commentsWithOwnership)
        setTotalCount(data.count || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
      toast.error('Erreur lors du chargement des commentaires')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [produitId, sort, page])

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditForm({
      nom: comment.nom,
      rating: comment.rating,
      commentaire: comment.commentaire,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    if (!editForm.nom.trim() || !editForm.commentaire.trim() || !editForm.rating) {
      toast.error('Tous les champs sont requis')
      return
    }

    try {
      const response = await fetch(`/api/commentaires/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Commentaire mis à jour')
      setEditingId(null)
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/commentaires/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      toast.success('Commentaire supprimé')
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.ceil(totalCount / limit)

  if (loading && comments.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <p className="text-sm">Aucun commentaire pour le moment.</p>
        <p className="text-xs mt-2">Soyez le premier à laisser un avis !</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-serif">
          Commentaires{totalCount > 0 && ` (${totalCount})`}
        </h3>
        <Select value={sort} onValueChange={(value: 'newest' | 'highest' | 'lowest') => {
          setSort(value)
          setPage(1)
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents</SelectItem>
            <SelectItem value="highest">Meilleures notes</SelectItem>
            <SelectItem value="lowest">Moins bonnes notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border border-border rounded-lg p-4 space-y-3 bg-card"
          >
            {editingId === comment.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Nom"
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'w-5 h-5 transition-colors',
                          star <= editForm.rating
                            ? 'fill-dore text-dore'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {editForm.rating}/5
                  </span>
                </div>
                <textarea
                  value={editForm.commentaire}
                  onChange={(e) => setEditForm({ ...editForm, commentaire: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                  rows={3}
                  placeholder="Commentaire"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-dore hover:bg-dore/90 text-charbon"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold font-serif text-foreground">
                        {comment.nom}
                      </h4>
                      <RatingDisplay
                        rating={comment.rating}
                        size="sm"
                        showCount={false}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      {comment.updated_at && comment.created_at !== comment.updated_at && (
                        <span className="ml-2">(modifié)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleEdit(comment)}
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      title="Supprimer"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {comment.commentaire}
                </p>
                
                {/* Display images if any */}
                {comment.images && comment.images.length > 0 && (
                  <div className={cn(
                    "grid gap-2 mt-3",
                    comment.images.length === 1 ? "grid-cols-1" :
                    comment.images.length === 2 ? "grid-cols-2" :
                    comment.images.length >= 3 ? "grid-cols-3" : "grid-cols-3"
                  )}>
                    {comment.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group cursor-pointer"
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <OptimizedImage
                          src={imageUrl}
                          alt={`Image ${index + 1} de ${comment.nom}`}
                          fill
                          objectFit="cover"
                          className="transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 33vw, 200px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}

