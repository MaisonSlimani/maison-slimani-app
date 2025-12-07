'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { LuxuryLoading } from '@/components/ui/luxury-loading'
import { MessageSquare, Search, Trash2, Star, Plus, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import OptimizedImage from '@/components/OptimizedImage'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [operationLoading, setOperationLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [editForm, setEditForm] = useState({
    produit_id: '',
    nom: '',
    email: '',
    rating: 5,
    commentaire: '',
    images: [] as string[],
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 50

  // Use React Query for comments
  const { data: commentsData, isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-commentaires', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        filter: 'all',
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

      return {
        comments: data.data || [],
        count: data.count || 0,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const comments = commentsData?.comments || []
  const totalCount = commentsData?.count || 0

  // Use React Query for products
  const { data: produitsData } = useQuery({
    queryKey: ['admin-produits-list'],
    queryFn: async () => {
      const response = await fetch('/api/admin/produits?limit=1000')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement')
      }
      return data.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - products list changes less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  const produits = produitsData || []

  // Real-time updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('commentaires-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'commentaires' },
        () => {
          // Invalidate and refetch comments
          queryClient.invalidateQueries({ queryKey: ['admin-commentaires'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])


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
      queryClient.invalidateQueries({ queryKey: ['admin-commentaires'] })
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
      queryClient.invalidateQueries({ queryKey: ['admin-commentaires'] })
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

  const handleEdit = (comment: Comment) => {
    setSelectedComment(comment)
    setEditForm({
      produit_id: comment.produit_id,
      nom: comment.nom,
      email: comment.email || '',
      rating: comment.rating,
      commentaire: comment.commentaire,
      images: comment.images || [],
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedComment(null)
    setEditForm({
      produit_id: '',
      nom: '',
      email: '',
      rating: 5,
      commentaire: '',
      images: [],
    })
    setEditDialogOpen(true)
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    const MAX_IMAGES = 6
    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
    
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

      const response = await fetch('/api/admin/commentaires/upload-image', {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSaveEdit = async () => {
    if (!editForm.nom.trim() || !editForm.commentaire.trim() || !editForm.produit_id) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    setOperationLoading(true)
    try {
      if (selectedComment) {
        // Update existing comment
        const response = await fetch(`/api/admin/commentaires/${selectedComment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: editForm.nom,
            email: editForm.email || null,
            rating: editForm.rating,
            commentaire: editForm.commentaire,
            images: editForm.images,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erreur')
        }

        toast.success('Commentaire modifié')
      } else {
        // Create new comment
        const response = await fetch('/api/admin/commentaires', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            produit_id: editForm.produit_id,
            nom: editForm.nom,
            email: editForm.email || null,
            rating: editForm.rating,
            commentaire: editForm.commentaire,
            images: editForm.images,
            approved: true,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Erreur')
        }

        toast.success('Commentaire ajouté')
      }

      setEditDialogOpen(false)
      setSelectedComment(null)
      queryClient.invalidateQueries({ queryKey: ['admin-commentaires'] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur')
    } finally {
      setOperationLoading(false)
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
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={operationLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
          {selectedIds.size > 0 && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
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
      </Card>

      {/* Comments Table */}
      <Card>
        <div className="overflow-x-auto admin-scroll">
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
                <th className="p-4 text-left text-sm font-medium min-w-[200px]">Commentaire</th>
                <th className="p-4 text-left text-sm font-medium">Date</th>
                <th className="p-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr
                  key={comment.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
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
                  <td className="p-4 min-w-[200px] max-w-md">
                    <p className="text-sm break-words whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{comment.commentaire}</p>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(comment)}
                        disabled={operationLoading}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
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

      {/* Edit/Add Comment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-scroll">
          <DialogHeader>
            <DialogTitle>{selectedComment ? 'Modifier le commentaire' : 'Ajouter un commentaire'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="produit_id">Produit *</Label>
              <Select
                value={editForm.produit_id}
                onValueChange={(value) => setEditForm({ ...editForm, produit_id: value })}
                disabled={!!selectedComment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {produits.map((produit) => (
                    <SelectItem key={produit.id} value={produit.id}>
                      {produit.nom} ({produit.categorie})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                placeholder="Nom du client"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@exemple.com (optionnel)"
              />
            </div>
            <div>
              <Label>Note *</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6 cursor-pointer transition-colors',
                        star <= editForm.rating
                          ? 'fill-dore text-dore'
                          : 'text-muted-foreground/30 hover:text-dore/50'
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{editForm.rating}/5</span>
              </div>
            </div>
            <div>
              <Label htmlFor="commentaire">Commentaire *</Label>
              <Textarea
                id="commentaire"
                value={editForm.commentaire}
                onChange={(e) => setEditForm({ ...editForm, commentaire: e.target.value })}
                placeholder="Commentaire du client"
                rows={5}
              />
            </div>
            <div>
              <Label>Images (max 6)</Label>
              <div className="space-y-3">
                {/* File input */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingImages || editForm.images.length >= 6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages || editForm.images.length >= 6}
                  >
                    {uploadingImages ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        {editForm.images.length >= 6 ? 'Maximum atteint' : 'Ajouter des images'}
                      </>
                    )}
                  </Button>
                </div>

                {/* Image previews */}
                {editForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {editForm.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
                      >
                        <OptimizedImage
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          fill
                          objectFit="cover"
                          className="transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 150px, 200px"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                          title="Supprimer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={operationLoading}>
                {operationLoading ? 'Enregistrement...' : selectedComment ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

