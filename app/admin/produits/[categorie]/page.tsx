'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

const categoriesMap: Record<string, string> = {
  'classiques': 'Classiques',
  'cuirs-exotiques': 'Cuirs Exotiques',
  'editions-limitees': 'Éditions Limitées',
  'nouveautes': 'Nouveautés',
  'tous': 'Tous les produits',
}

export default function AdminCategorieProduitsPage() {
  const params = useParams()
  const router = useRouter()
  const categorieSlug = params.categorie as string
  const categorieNom = categoriesMap[categorieSlug] || 'Tous les produits'
  
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduit, setEditingProduit] = useState<any>(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorie: categorieSlug === 'tous' ? '' : categorieNom,
    vedette: false,
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    chargerProduits()
  }, [categorieSlug])

  const chargerProduits = async () => {
    try {
      const response = await fetch('/api/admin/produits')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      
      const result = await response.json()
      let produitsData = result.data || []

      // Filtrer par catégorie si ce n'est pas "tous"
      if (categorieSlug !== 'tous' && categorieNom) {
        produitsData = produitsData.filter((p: any) => p.categorie === categorieNom)
      }

      setProduits(produitsData)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
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

      const produitData = {
        ...formData,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        vedette: formData.vedette,
        image_url: imageUrl,
        categorie: categorieSlug === 'tous' ? formData.categorie : categorieNom,
      }

      const response = await fetch('/api/admin/produits', {
        method: editingProduit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...produitData,
          id: editingProduit?.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(editingProduit ? 'Produit mis à jour' : 'Produit créé')
      setDialogOpen(false)
      setEditingProduit(null)
      setFormData({
        nom: '',
        description: '',
        prix: '',
        stock: '',
        categorie: categorieSlug === 'tous' ? '' : categorieNom,
        vedette: false,
        image_url: '',
      })
      setImageFile(null)
      setImagePreview(null)
      chargerProduits()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const response = await fetch(`/api/admin/produits?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      toast.success('Produit supprimé')
      chargerProduits()
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  // Grouper les produits par catégorie si "tous"
  const produitsParCategorie = produits.reduce((acc, produit) => {
    const cat = produit.categorie || 'Sans catégorie'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(produit)
    return acc
  }, {} as Record<string, typeof produits>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/produits')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif mb-2">{categorieNom}</h1>
            <p className="text-muted-foreground">
              {produits.length} produit{produits.length > 1 ? 's' : ''} dans cette catégorie
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduit(null)
                setFormData({
                  nom: '',
                  description: '',
                  prix: '',
                  stock: '',
                  categorie: categorieSlug === 'tous' ? '' : categorieNom,
                  vedette: false,
                  image_url: '',
                })
                setImageFile(null)
                setImagePreview(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
              <DialogDescription>
                {editingProduit ? 'Modifiez les informations du produit' : 'Remplissez les informations pour créer un nouveau produit'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prix">Prix (DH) *</Label>
                  <Input
                    id="prix"
                    type="number"
                    step="0.01"
                    required
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
              {categorieSlug === 'tous' && (
                <div>
                  <Label htmlFor="categorie">Catégorie *</Label>
                  <Select
                    value={formData.categorie}
                    onValueChange={(value) => setFormData({ ...formData, categorie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classiques">Classiques</SelectItem>
                      <SelectItem value="Cuirs Exotiques">Cuirs Exotiques</SelectItem>
                      <SelectItem value="Éditions Limitées">Éditions Limitées</SelectItem>
                      <SelectItem value="Nouveautés">Nouveautés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="image">Image du produit</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="cursor-pointer"
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
                    <img
                      src={formData.image_url}
                      alt="Image actuelle"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vedette"
                  checked={formData.vedette}
                  onChange={(e) => setFormData({ ...formData, vedette: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="vedette" className="cursor-pointer">
                  Produit en vedette
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Enregistrement...' : editingProduit ? 'Modifier' : 'Créer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {categorieSlug === 'tous' ? (
        <div className="space-y-8">
          {Object.entries(produitsParCategorie).map(([cat, prods]) => (
            <div key={cat}>
              <h2 className="text-2xl font-serif mb-4">{cat}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prods.map((produit: any) => (
                  <Card key={produit.id} className="p-4">
                    <div className="flex gap-4">
                      {produit.image_url && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <Image
                            src={produit.image_url}
                            alt={produit.nom}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1 truncate">{produit.nom}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {produit.prix.toLocaleString('fr-MA')} DH
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduit(produit)
                              setFormData({
                                nom: produit.nom,
                                description: produit.description || '',
                                prix: produit.prix.toString(),
                                stock: produit.stock.toString(),
                                categorie: produit.categorie || '',
                                vedette: produit.vedette || false,
                                image_url: produit.image_url || '',
                              })
                              setImageFile(null)
                              setImagePreview(null)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(produit.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produits.map((produit: any) => (
            <Card key={produit.id} className="p-4">
              <div className="flex gap-4">
                {produit.image_url && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <Image
                      src={produit.image_url}
                      alt={produit.nom}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 truncate">{produit.nom}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {produit.prix.toLocaleString('fr-MA')} DH
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduit(produit)
                        setFormData({
                          nom: produit.nom,
                          description: produit.description || '',
                          prix: produit.prix.toString(),
                          stock: produit.stock.toString(),
                          categorie: produit.categorie || categorieNom,
                          vedette: produit.vedette || false,
                          image_url: produit.image_url || '',
                        })
                        setImageFile(null)
                        setImagePreview(null)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(produit.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {produits.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucun produit dans cette catégorie pour le moment.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le premier produit
          </Button>
        </Card>
      )}
    </div>
  )
}

