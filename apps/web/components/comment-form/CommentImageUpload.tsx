'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Label } from '@maison/ui'
import { toast } from 'sonner'
import { cn } from '@maison/shared'
import OptimizedImage from '@/components/OptimizedImage'

interface CommentImageUploadProps {
  uploadedImages: string[]
  setUploadedImages: (cb: (prev: string[]) => string[]) => void
  isSubmitting?: boolean
}

const MAX_IMAGES = 6
const MAX_FILE_SIZE = 2 * 1024 * 1024

export function CommentImageUpload({ uploadedImages, setUploadedImages, isSubmitting }: CommentImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const filesArray = Array.from(files)
    if (uploadedImages.length + filesArray.length > MAX_IMAGES) return toast.error(`Max ${MAX_IMAGES} images`)
    
    // Check file size
    const overSized = filesArray.some(file => file.size > MAX_FILE_SIZE)
    if (overSized) return toast.error(`Images max ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    
    setUploadingImages(true)
    try {
      const formData = new FormData()
      filesArray.forEach(file => formData.append('files', file))
      const res = await fetch('/api/commentaires/upload-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newUrls = data.images || [data.imageUrl].filter(Boolean)
      setUploadedImages(prev => [...prev, ...newUrls])
    } catch (err) { 
      const error = err as Error
      toast.error(error.message) 
    }
    finally { setUploadingImages(false) }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Photos (optionnel, max {MAX_IMAGES})</Label>
      <div className="space-y-3">
        {uploadedImages.length < MAX_IMAGES && (
          <div className="relative">
            <input ref={fileInputRef} type="file" accept="image/*" multiple 
              onChange={(e) => handleImageUpload(e.target.files)} 
              disabled={isSubmitting || uploadingImages} className="hidden" id="comment-images" />
            <Label htmlFor="comment-images" className={cn("flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer",
              uploadingImages ? "opacity-50 cursor-not-allowed" : "border-dore/50 hover:bg-dore/5")}>
              <Upload className="w-4 h-4 text-dore" />
              <span className="text-sm">{uploadingImages ? 'Upload...' : 'Ajouter des photos'}</span>
            </Label>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {uploadedImages.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
              <OptimizedImage src={src} alt="Preview" fill objectFit="cover" />
              <button type="button" onClick={() => setUploadedImages(p => p.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
