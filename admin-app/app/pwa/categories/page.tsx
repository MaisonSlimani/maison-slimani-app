'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Image as ImageIcon, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { LuxuryLoading } from '@/components/ui/luxury-loading'

export default function AdminPWACategoriesPage() {
  const router = useRouter()
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
    const verifierSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        if (!data.authenticated) {
          router.push('/login')
          return
        }
      } catch (error) {
        router.push('/login')
        return
      }
    }

    verifierSession()
    chargerCategories()
  }, [router])

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
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Erreur lors de l\'upload' }))
          throw new Error(errorData.error || 'Erreur lors de l\'upload de l\'image')
        }

        const uploadResult = await uploadResponse.json()
        imageUrl = uploadResult.url
      }

      const payload = {
        ...formData,
        image_url: imageUrl,
      }

      const url = editingCategorie
        ? `/api/admin/categories?id=${editingCategorie.id}`
        : '/api/admin/categories'
      const method = editingCategorie ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const contentType = response.headers.get('content-type')
      let result
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json()
        } catch {
          result = { success: false, error: 'Erreur lors de la sauvegarde' }
        }
      } else {
        result = { success: false, error: 'Erreur lors de la sauvegarde' }
      }

      if (!response.ok || !result.success) {
        const errorMessage = result.error || result.details || 'Erreur lors de la sauvegarde'
        throw new Error(errorMessage)
      }

      toast.success(editingCategorie ? 'Catégorie mise à jour' : 'Catégorie créée')
      setDialogOpen(false)
      resetForm()
      chargerCategories()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (categorie: any) => {
    setEditingCategorie(categorie)
    setFormData({
      nom: categorie.nom || '',
      slug: categorie.slug || '',
      description: categorie.description || '',
      image_url: categorie.image_url || '',
      ordre: categorie.ordre || 0,
      active: categorie.active !== undefined ? categorie.active : true,
    })
    setImagePreview(categorie.image_url || null)
    setImageFile(null)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!categorieToDelete) return

    try {
      const response = await fetch(`/api/admin/categories?id=${categorieToDelete}`, {
        method: 'DELETE',
      })

      const contentType = response.headers.get('content-type')
      let result
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json()
        } catch {
          result = { success: false, error: 'Erreur lors de la suppression' }
        }
      } else {
        result = { success: false, error: 'Erreur lors de la suppression' }
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }

      toast.success('Catégorie supprimée')
      setDeleteDialogOpen(false)
      setCategorieToDelete(null)
      chargerCategories()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
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
    setEditingCategorie(null)
  }

  if (loading) {
    return (
      <div className="w-full">
        <LuxuryLoading message="Chargement des catégories..." />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-foreground">Catégories</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-dore text-charbon hover:bg-dore/90">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto admin-scroll">
              <DialogHeader>
                <DialogTitle>{editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
                <DialogDescription>
                  {editingCategorie ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour vos produits'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleNomChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
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
                  <Label htmlFor="image">Image</Label>
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
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {!imagePreview && formData.image_url && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <Image
                          src={formData.image_url}
                          alt="Image actuelle"
                          fill
                          className="object-cover"
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
                    className="rounded"
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading} className="flex-1 bg-dore text-charbon hover:bg-dore/90">
                    {uploading ? 'Enregistrement...' : editingCategorie ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune catégorie</p>
          ) : (
            categories.map((categorie) => (
              <Card key={categorie.id} className="p-4">
                <div className="flex items-center gap-4">
                  {categorie.image_url && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={categorie.image_url}
                        alt={categorie.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-foreground">{categorie.nom}</h3>
                    <p className="text-sm text-muted-foreground truncate">{categorie.description || 'Aucune description'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Slug: {categorie.slug} • Ordre: {categorie.ordre}
                    </p>
                    {!categorie.active && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(categorie)}
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
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La catégorie sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

