'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import RatingDisplay from './RatingDisplay'
import { Edit2, Trash2, Loader2, Star, Upload, X } from 'lucide-react'
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
  canEdit?: boolean // Whether the current user can edit this comment
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nom: '', rating: 0, commentaire: '', images: [] as string[] })
  const [uploadingImages, setUploadingImages] = useState(false)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  
  const MAX_IMAGES = 6
  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

  const limit = 10

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/commentaires?produit_id=${produitId}&sort=${sort}&limit=${limit}&offset=${(page - 1) * limit}`
      )
      const data = await response.json()

      if (data.success) {
        setComments(data.data || [])
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
      images: comment.images || [],
    })
  }

  const handleEditImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    
    // Check total count
    if (editForm.images.length + filesArray.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images autorisées`)
      return
    }

    // Validate files
    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} est trop volumineux (max 2MB)`)
        return
      }
    }

    setUploadingImages(true)

    try {
      const formData = new FormData()
      filesArray.forEach(file => formData.append('files', file))

      const response = await fetch('/api/commentaires/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'upload des images')
      }

      const newImageUrls = data.images || [data.imageUrl].filter(Boolean)
      setEditForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }))
      toast.success(`${newImageUrls.length} image(s) uploadée(s) avec succès`)
    } catch (error) {
      console.error('Erreur upload images:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload des images')
    } finally {
      setUploadingImages(false)
      if (editFileInputRef.current) {
        editFileInputRef.current.value = ''
      }
    }
  }

  const removeEditImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
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
        body: JSON.stringify({
          nom: editForm.nom,
          rating: editForm.rating,
          commentaire: editForm.commentaire,
          images: editForm.images.length > 0 ? editForm.images : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Commentaire mis à jour')
      setEditingId(null)
      setEditForm({ nom: '', rating: 0, commentaire: '', images: [] })
      fetchComments()
      onCommentUpdate?.()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  const handleDeleteClick = (id: string) => {
    setCommentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!commentToDelete) return

    setDeletingId(commentToDelete)
    setDeleteDialogOpen(false)
    
    try {
      const response = await fetch(`/api/commentaires/${commentToDelete}`, {
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
      setCommentToDelete(null)
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
                
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Images ({editForm.images.length}/{MAX_IMAGES})</Label>
                  {editForm.images.length < MAX_IMAGES && (
                    <div>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={(e) => handleEditImageUpload(e.target.files)}
                        disabled={uploadingImages}
                        className="hidden"
                        id={`edit-image-upload-${comment.id}`}
                      />
                      <Label
                        htmlFor={`edit-image-upload-${comment.id}`}
                        className={cn(
                          "flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                          uploadingImages && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {uploadingImages ? 'Upload en cours...' : 'Ajouter des images'}
                        </span>
                      </Label>
                    </div>
                  )}
                  
                  {/* Image Previews */}
                  {editForm.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {editForm.images.map((imageUrl, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                          <OptimizedImage
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            fill
                            objectFit="cover"
                            sizes="(max-width: 768px) 33vw, 150px"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            disabled={uploadingImages}
                            className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="bg-dore hover:bg-dore/90 text-charbon"
                    disabled={uploadingImages}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setEditForm({ nom: '', rating: 0, commentaire: '', images: [] })
                    }}
                    disabled={uploadingImages}
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
                  {comment.canEdit && (
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
                        onClick={() => handleDeleteClick(comment.id)}
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
                  )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le commentaire</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

