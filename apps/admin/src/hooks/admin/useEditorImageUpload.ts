import { useCallback } from 'react'
import { storageRepo } from '@/lib/repositories'
import { optimizeImage } from '@/lib/utils/image-optimizer'
import { toast } from 'sonner'

/**
 * Returns an async upload function suitable for passing as RichTextEditor's `onImageUpload` prop.
 * Handles: client-side WebP optimization → Supabase Storage upload → public URL resolution.
 */
export function useEditorImageUpload() {
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    toast.loading("Optimisation et envoi de l'image...", { id: 'editor-upload' })

    try {
      const optimizedBlob = await optimizeImage(file, { maxWidth: 1200, maxHeight: 1200 })

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`
      const path = `editor/${fileName}`
      await storageRepo.uploadImage(path, optimizedBlob as File, 'image/webp')
      const imageUrl = storageRepo.getPublicUrl(path)

      toast.success("Image insérée avec succès !", { id: 'editor-upload' })
      return imageUrl
    } catch (err) {
      toast.error("Erreur lors de l'insertion de l'image.", { id: 'editor-upload' })
      throw err
    }
  }, [])

  return uploadImage
}
