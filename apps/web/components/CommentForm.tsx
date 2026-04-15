'use client'

import React, { useState } from 'react'
import { Button, Input, Textarea, Label } from '@maison/ui'
import { toast } from 'sonner'
import { cn } from '@maison/shared'
import { RatingInput } from './comment-form/RatingInput'
import { CommentImageUpload } from './comment-form/CommentImageUpload'

interface CommentFormProps {
  productId: string
  onSuccess?: () => void
  className?: string
}

export default function CommentForm({ productId, onSuccess, className }: CommentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !rating || !content.trim()) {
      return toast.error('Veuillez remplir tous les champs obligatoires')
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/v1/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          name: name.trim(), 
          email: email.trim() || undefined, 
          rating, 
          content: content.trim(), 
          images: uploadedImages 
        }),
      })
      if (!res.ok) throw new Error('Erreur lors de la soumission')
      toast.success('Commentaire ajouté avec succès!')
      setName(''); setEmail(''); setRating(null); setContent(''); setUploadedImages([])
      onSuccess?.()
    } catch (_err) { 
      const error = _err as Error
      toast.error(error.message) 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom <span className="text-dore">*</span></Label>
          <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={isSubmitting} />
        </div>
      </div>

      <RatingInput rating={rating} setRating={setRating} disabled={isSubmitting} />

      <div className="space-y-2">
        <Label htmlFor="content">Commentaire <span className="text-dore">*</span></Label>
        <Textarea id="content" value={content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} rows={4} required disabled={isSubmitting} maxLength={2000} />
      </div>

      <CommentImageUpload uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} isSubmitting={isSubmitting} />

      <Button type="submit" disabled={isSubmitting || !rating} className="w-full bg-dore text-charbon font-semibold">
        {isSubmitting ? 'Envoi...' : 'Publier le commentaire'}
      </Button>
    </form>
  )
}
