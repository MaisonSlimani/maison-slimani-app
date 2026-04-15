'use client'

import React from 'react'
import RatingDisplay from '../RatingDisplay'
import OptimizedImage from '../OptimizedImage'
import { Button } from '@maison/ui'
import { Edit2, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@maison/shared'

import { Commentaire } from '@/types/index'

interface CommentCardProps {
  comment: Commentaire
  onEdit: (comment: Commentaire) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

export const CommentCard = ({
  comment,
  onEdit,
  onDelete,
  isDeleting
}: CommentCardProps) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold font-serif text-foreground">{comment.name}</h4>
            <RatingDisplay rating={comment.rating} size="sm" showCount={false} />
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {comment.updatedAt && comment.createdAt !== comment.updatedAt && <span className="ml-2">(modifié)</span>}
          </p>
        </div>
        
        {comment.canEdit && (
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(comment)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(comment.id)}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

      {comment.images && comment.images.length > 0 && (
        <div className={cn("grid gap-2 mt-3", comment.images.length >= 3 ? "grid-cols-3" : `grid-cols-${comment.images.length}`)}>
          {comment.images.map((img: string, i: number) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group cursor-pointer" onClick={() => window.open(img, '_blank')}>
              <OptimizedImage src={img} alt="Comment" fill className="object-cover transition-transform group-hover:scale-105" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
