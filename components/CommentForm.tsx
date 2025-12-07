'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import RatingDisplay from './RatingDisplay'
import OptimizedImage from './OptimizedImage'

interface CommentFormProps {
  produitId: string
  onSuccess?: () => void
  className?: string
}

const MAX_IMAGES = 6
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

export default function CommentForm({ produitId, onSuccess, className }: CommentFormProps) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [commentaire, setCommentaire] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    
    // Check total count
    if (uploadedImages.length + filesArray.length > MAX_IMAGES) {
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

      // Show immediate feedback
      const startTime = Date.now()
      
      const response = await fetch('/api/commentaires/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1)

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'upload des images')
      }

      const newImageUrls = data.images || [data.imageUrl].filter(Boolean)
      setUploadedImages(prev => [...prev, ...newImageUrls])
      toast.success(`${newImageUrls.length} image(s) uploadée(s) avec succès (${uploadTime}s)`)
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
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nom.trim()) {
      toast.error('Le nom est requis')
      return
    }

    if (!rating) {
      toast.error('Veuillez sélectionner une note')
      return
    }

    if (!commentaire.trim()) {
      toast.error('Le commentaire est requis')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/commentaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produit_id: produitId,
          nom: nom.trim(),
          email: email.trim() || undefined,
          rating,
          commentaire: commentaire.trim(),
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission')
      }

      // Store session token if provided
      if (data.session_token) {
        // Cookie is set by server, but we can also store in localStorage as backup
        localStorage.setItem('comment_session_token', data.session_token)
      }

      toast.success('Commentaire ajouté avec succès!')
      
      // Reset form
      setNom('')
      setEmail('')
      setRating(null)
      setCommentaire('')
      setUploadedImages([])
      
      // Callback to refresh comments list
      onSuccess?.()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la soumission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredStar || rating || 0

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="nom" className="text-sm font-medium">
          Nom <span className="text-dore">*</span>
        </Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Votre nom"
          required
          disabled={isSubmitting}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email (optionnel)
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          disabled={isSubmitting}
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Note <span className="text-dore">*</span>
        </Label>
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoveredStar(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              disabled={isSubmitting}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  star <= displayRating
                    ? 'fill-dore text-dore'
                    : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
          {rating && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="commentaire" className="text-sm font-medium">
          Commentaire <span className="text-dore">*</span>
        </Label>
        <Textarea
          id="commentaire"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={4}
          required
          disabled={isSubmitting}
          maxLength={2000}
          className="bg-background resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {commentaire.length}/2000
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Photos (optionnel, max {MAX_IMAGES})
        </Label>
        <div className="space-y-3">
          {/* Upload Button */}
          {uploadedImages.length < MAX_IMAGES && (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={isSubmitting || uploadingImages}
                className="hidden"
                id="comment-images"
              />
              <Label
                htmlFor="comment-images"
                className={cn(
                  "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  uploadingImages || isSubmitting
                    ? "border-muted-foreground/30 cursor-not-allowed opacity-50"
                    : "border-dore/50 hover:border-dore hover:bg-dore/5"
                )}
              >
                <Upload className="w-4 h-4 text-dore" />
                <span className="text-sm text-muted-foreground">
                  {uploadingImages 
                    ? 'Upload en cours...' 
                    : `Ajouter des photos (${uploadedImages.length}/${MAX_IMAGES}) - Sélectionnez plusieurs à la fois`}
                </span>
              </Label>
            </div>
          )}

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedImages.map((imageUrl, index) => (
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
                    onClick={() => removeImage(index)}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum {MAX_IMAGES} images, 2MB par image (JPEG, PNG, WebP). Vous pouvez sélectionner plusieurs images à la fois.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || uploadingImages || !rating || !nom.trim() || !commentaire.trim()}
        className="w-full bg-dore hover:bg-dore/90 text-charbon font-semibold"
      >
        {isSubmitting ? 'Envoi en cours...' : 'Publier le commentaire'}
      </Button>
    </form>
  )
}

