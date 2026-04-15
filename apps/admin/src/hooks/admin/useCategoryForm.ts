import { useState } from 'react'
import { storageRepo } from '@/lib/repositories'
import { optimizeImage } from '@/lib/utils/image-optimizer'

export function useCategoryForm(
  initialImageUrl: string, 
  onSubmit: (e: React.FormEvent, url: string | null) => void
) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let imageUrl = initialImageUrl
    if (imageFile) {
      const optimizedBlob = await optimizeImage(imageFile);
      const fileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `categories/${Date.now()}-${fileName.split('.')[0]}.webp`;
      
      await storageRepo.uploadImage(path, optimizedBlob as File, 'image/webp')
      imageUrl = storageRepo.getPublicUrl(path)
    }
    onSubmit(e, imageUrl)
  }

  return { imageFile, imagePreview, handleImageChange, handleLocalSubmit, generateSlug }
}
