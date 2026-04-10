import { useState } from 'react'
import { storageRepo } from '@/lib/repositories'

export function useCategoryForm(
  initialImageUrl: string, 
  onSubmit: (e: React.FormEvent, url: string | null) => void
) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const generateSlug = (nom: string) =>
    nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

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
      const path = `categories/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      await storageRepo.uploadImage(path, imageFile, imageFile.type)
      imageUrl = storageRepo.getPublicUrl(path)
    }
    onSubmit(e, imageUrl)
  }

  return { imageFile, imagePreview, handleImageChange, handleLocalSubmit, generateSlug }
}
