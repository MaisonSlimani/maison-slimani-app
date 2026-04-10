'use client'

import { useState } from 'react'
import { Button } from '@maison/ui'
import { Input } from '@maison/ui'
import { Textarea } from '@maison/ui'
import { Label } from '@maison/ui'
import { toast } from 'sonner'
import { cn } from '@maison/shared'
import { RatingInput } from './comment-form/RatingInput'
import { CommentImageUpload } from './comment-form/CommentImageUpload'

interface CommentFormProps {
  produitId: string
  onSuccess?: () => void
  className?: string
}

export default function CommentForm({ produitId, onSuccess, className }: CommentFormProps) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [commentaire, setCommentaire] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim() || !rating || !commentaire.trim()) return toast.error('Veuillez remplir tous les champs obligatoires')

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produit_id: produitId, nom: nom.trim(), email: email.trim() || undefined, rating, commentaire: commentaire.trim(), images: uploadedImages }),
      })
      if (!res.ok) throw new Error('Erreur lors de la soumission')
      toast.success('Commentaire ajouté avec succès!')
      setNom(''); setEmail(''); setRating(null); setCommentaire(''); setUploadedImages([])
      onSuccess?.()
    } catch (_err) { 
      const error = _err as Error
      toast.error(error.message) 
    }
    finally { setIsSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom <span className="text-dore">*</span></Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
        </div>
      </div>

      <RatingInput rating={rating} setRating={setRating} disabled={isSubmitting} />

      <div className="space-y-2">
        <Label htmlFor="commentaire">Commentaire <span className="text-dore">*</span></Label>
        <Textarea id="commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={4} required disabled={isSubmitting} maxLength={2000} />
      </div>

      <CommentImageUpload uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} isSubmitting={isSubmitting} />

      <Button type="submit" disabled={isSubmitting || !rating} className="w-full bg-dore text-charbon font-semibold">
        {isSubmitting ? 'Envoi...' : 'Publier le commentaire'}
      </Button>
    </form>
  )
}
