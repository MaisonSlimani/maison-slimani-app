'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState<any>(null)
  const [formData, setFormData] = useState({
    nom: '',
    slug: '',
    description: '',
    image_url: '',
    ordre: 0,
    active: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categorieToDelete, setCategorieToDelete] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerCategories()
  }, [])

  const chargerCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      
      const result = await response.json()
      setCategories(result.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast.error('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (nom: string) => {
    return nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNomChange = (nom: string) => {
    setFormData({
      ...formData,
      nom,
      slug: editingCategorie ? formData.slug : generateSlug(nom),
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      let imageUrl = formData.image_url

      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Erreur lors de l\'upload de l\'image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.imageUrl
      }

      const categorieData = {
        ...formData,
        image_url: imageUrl || null,
        ordre: parseInt(formData.ordre.toString()) || 0,
      }

      const response = await fetch('/api/admin/categories', {
        method: editingCategorie ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categorieData,
          id: editingCategorie?.id,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }

      toast.success(editingCategorie ? 'Catégorie mise à jour' : 'Catégorie créée')
      setDialogOpen(false)
      setEditingCategorie(null)
      setFormData({
        nom: '',
        slug: '',
        description: '',
        image_url: '',
        ordre: 0,
        active: true,
      })
      setImageFile(null)
      setImagePreview(null)
      chargerCategories()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!categorieToDelete) return

    try {
      const response = await fetch(`/api/admin/categories?id=${categorieToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la suppression'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          }
        } catch {
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }

      toast.success('Catégorie supprimée')
      chargerCategories()
      setDeleteDialogOpen(false)
      setCategorieToDelete(null)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gestion des catégories</h1>
          <p className="text-muted-foreground">Créez et gérez les catégories de produits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategorie(null)
                setFormData({
                  nom: '',
                  slug: '',
                  description: '',
                  image_url: '',
                  ordre: categories.length,
                  active: true,
                })
                setImageFile(null)
                setImagePreview(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
              <DialogDescription>
                {editingCategorie ? 'Modifiez les informations de la catégorie' : 'Remplissez les informations pour créer une nouvelle catégorie'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    required
                    value={formData.nom}
                    onChange={(e) => handleNomChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ordre">Ordre d'affichage</Label>
                <Input
                  id="ordre"
                  type="number"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="image">Image de la catégorie</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="bg-dore text-charbon hover:bg-dore/90"
                      onClick={() => {
                        const input = document.getElementById('image') as HTMLInputElement
                        input?.click()
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner une image
                    </Button>
                    {imageFile && (
                      <span className="text-sm text-muted-foreground">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                  {!imagePreview && formData.image_url && (
                    <div className="mt-4">
                      <Image
                        src={formData.image_url}
                        alt="Image actuelle"
                        width={400}
                        height={200}
                        className="rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Catégorie active
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Enregistrement...' : editingCategorie ? 'Modifier' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((categorie: any) => (
          <Card key={categorie.id} className="p-6 overflow-hidden">
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-border bg-muted">
              {categorie.image_url ? (
                <Image
                  src={categorie.image_url}
                  alt={categorie.nom}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif">{categorie.nom}</h3>
                {categorie.active ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{categorie.description || 'Aucune description'}</p>
              <p className="text-xs text-muted-foreground">Slug: {categorie.slug}</p>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCategorie(categorie)
                    setFormData({
                      nom: categorie.nom,
                      slug: categorie.slug,
                      description: categorie.description || '',
                      image_url: categorie.image_url || '',
                      ordre: categorie.ordre || 0,
                      active: categorie.active !== false,
                    })
                    setImageFile(null)
                    setImagePreview(null)
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategorieToDelete(categorie.id)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucune catégorie pour le moment.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Créer la première catégorie
          </Button>
        </Card>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les produits liés devront être re-catégorisés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

