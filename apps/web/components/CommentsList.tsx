'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@maison/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@maison/ui'
import { CommentCard } from './comments/CommentCard'
import { CommentEditForm } from './comments/CommentEditForm'
import { cn } from '@maison/shared'
import { Commentaire } from '@/types/index'
import { useComments } from '@/hooks/use-comments'

interface CommentsListProps {
  productId: string; // Was 'produitId'
  onCommentUpdate?: () => void;
  className?: string
}

export default function CommentsList({ productId, onCommentUpdate, className }: CommentsListProps) {
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Commentaire | null>(null)

  const { comments, loading, handleDelete, handleUpdate } = useComments(productId, sort, onCommentUpdate)

  const onConfirmDelete = async () => {
    if (commentToDelete && await handleDelete(commentToDelete)) {
      setDeleteDialogOpen(false)
    }
  }

  const onSaveEdit = async () => {
    if (editingId && editForm && await handleUpdate(editingId, editForm)) {
      setEditingId(null)
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
              onSave={onSaveEdit} onCancel={() => setEditingId(null)}
              isUploading={false} onImageUpload={() => { }} onRemoveImage={() => { }}
            />
          ) : (
            <CommentCard
              key={comment.id} comment={comment as Commentaire} isDeleting={false}
              onEdit={(c) => { setEditingId(c.id); setEditForm(c) }}
              onDelete={(id) => { setCommentToDelete(id); setDeleteDialogOpen(true) }}
            />
          )
        ))}
      </div>

      <DialogDelete open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={onConfirmDelete} />
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
