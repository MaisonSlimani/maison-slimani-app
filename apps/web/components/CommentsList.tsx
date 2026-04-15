'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@maison/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@maison/ui'
import { CommentCard } from './comments/CommentCard'
import { CommentEditForm } from './comments/CommentEditForm'
import { toast } from 'sonner'
import { cn } from '@maison/shared'
import { Commentaire } from '@/types/index'

interface CommentsListProps {
  productId: string; // Was 'produitId'
  onCommentUpdate?: () => void; 
  className?: string
}

export default function CommentsList({ productId, onCommentUpdate, className }: CommentsListProps) {
  const [comments, setComments] = useState<Commentaire[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Commentaire | null>(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await fetch(`/api/v1/commentaires?productId=${productId}&sort=${sort}`)
      const data = await resp.json()
      if (data.success) {
        setComments(data.data || [])
      }
    } catch { 
      toast.error('Erreur de chargement') 
    } finally { 
      setLoading(false) 
    }
  }, [productId, sort])

  useEffect(() => { 
    fetchComments() 
  }, [fetchComments])

  const handleSaveEdit = async () => {
    try {
      const resp = await fetch(`/api/v1/commentaires/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (resp.ok) {
        toast.success('Commentaire mis à jour')
        setEditingId(null); fetchComments(); onCommentUpdate?.()
      }
    } catch { 
      toast.error('Erreur mise à jour') 
    }
  }

  const handleDelete = async () => {
    try {
      const resp = await fetch(`/api/v1/commentaires/${commentToDelete}`, { method: 'DELETE' })
      if (resp.ok) {
        toast.success('Supprimé'); setDeleteDialogOpen(false); fetchComments(); onCommentUpdate?.()
      }
    } catch { 
      toast.error('Erreur suppression') 
    }
  }

  if (loading && comments.length === 0) return <div className="animate-pulse py-8">Chargement...</div>

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif">Avis clients</h3>
        <Select value={sort} onValueChange={(v: 'newest' | 'highest' | 'lowest') => setSort(v)}>
          <SelectTrigger className="w-40 font-serif"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Les plus récents</SelectItem>
            <SelectItem value="highest">Les mieux notés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {comments.map(comment => (
          editingId === comment.id ? (
            <CommentEditForm 
              key={comment.id} editForm={editForm as Commentaire} setEditForm={setEditForm} 
              onSave={handleSaveEdit} onCancel={() => setEditingId(null)} 
              isUploading={false} onImageUpload={() => {}} onRemoveImage={() => {}}
            />
          ) : (
            <CommentCard 
              key={comment.id} comment={comment} isDeleting={false}
              onEdit={(c) => { setEditingId(c.id); setEditForm(c) }}
              onDelete={(id) => { setCommentToDelete(id); setDeleteDialogOpen(true) }}
            />
          )
        ))}
      </div>

      <DialogDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} />
    </div>
  )
}

function DialogDelete({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ?</AlertDialogTitle>
          <AlertDialogDescription>Action irréversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600">Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
