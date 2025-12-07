'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, ArrowLeft, Package, AlertTriangle, X, Upload, Image as ImageIcon, Palette, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ProductPreviewModal from '@/components/ProductPreviewModal'
import { LuxuryLoading } from '@/components/ui/luxury-loading'

export default function AdminCategorieProduitsPage() {
  const params = useParams()
  const router = useRouter()
  const categorieSlug = params.categorie as string
  
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({})
  const [categorieNom, setCategorieNom] = useState<string>('Tous les produits')
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
    taille: '',
        has_colors: false,
  })
  const [uploading, setUploading] = useState(false)
  
  // États pour les images multiples et couleurs
  const [couleurs, setCouleurs] = useState<Array<{ nom: string; code: string; stock: number; taille: string; images: File[]; imageUrls: string[] }>>([])
  const [imagesGenerales, setImagesGenerales] = useState<Array<{ file: File | null; url: string | null }>>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [produitToDelete, setProduitToDelete] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const chargerCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories')
      
      const result = await response.json()
      const categoriesData = result.data || []
      
      // Build categories map
      const map: Record<string, string> = { 'tous': 'Tous les produits' }
      categoriesData.forEach((cat: any) => {
        map[cat.slug] = cat.nom
      })
      
      setCategories(categoriesData)
      setCategoriesMap(map)
      
      // Set current category name
      if (categorieSlug === 'tous') {
        setCategorieNom('Tous les produits')
      } else {
        const foundCat = categoriesData.find((cat: any) => cat.slug === categorieSlug)
        setCategorieNom(foundCat?.nom || 'Tous les produits')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      toast.error('Erreur lors du chargement des catégories')
    }
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
    window.scrollTo(0, 0)
    chargerCategories()
  }, [chargerCategories, router])

  useEffect(() => {
    if (categories.length > 0) {
      chargerProduits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieSlug, categorieNom, categories])


  // Gestion des couleurs
  const addCouleur = () => {
    setCouleurs([...couleurs, { nom: '', code: '#000000', stock: 0, taille: '', images: [], imageUrls: [] }])
  }

  const removeCouleur = (index: number) => {
    setCouleurs(couleurs.filter((_, i) => i !== index))
  }

  const updateCouleur = (index: number, field: 'nom' | 'code' | 'stock' | 'taille', value: string | number) => {
    setCouleurs(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addImageToCouleur = (couleurIndex: number, file: File) => {
    const updated = [...couleurs]
    updated[couleurIndex].images.push(file)
    setCouleurs(updated)
  }

  const removeImageFromCouleur = (couleurIndex: number, imageIndex: number, isNewImage?: boolean) => {
    const updated = [...couleurs]
    if (isNewImage) {
      updated[couleurIndex].images.splice(imageIndex, 1)
    } else {
      updated[couleurIndex].imageUrls.splice(imageIndex, 1)
    }
    setCouleurs(updated)
  }

  // Utility function to get filename from URL
  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const fileName = pathname.split('/').pop() || pathname
      return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url
    }
  }

  // Gestion des images générales (sans couleur)
  const addImageGenerale = () => {
    setImagesGenerales([...imagesGenerales, { file: null, url: null }])
  }

  const removeImageGenerale = (index: number) => {
    setImagesGenerales(imagesGenerales.filter((_, i) => i !== index))
  }

  const handleImageGeneraleChange = (index: number, file: File | null) => {
    const updated = [...imagesGenerales]
    updated[index] = { file, url: file ? URL.createObjectURL(file) : null }
    setImagesGenerales(updated)
  }

  const uploadImage = async (file: File): Promise<string> => {
        const uploadFormData = new FormData()
    uploadFormData.append('file', file)

        const uploadResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Erreur lors de l\'upload de l\'image')
        }

        const uploadData = await uploadResponse.json()
    return uploadData.imageUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      // Collect all files that need to be uploaded (for parallel processing)
      const filesToUpload: Array<{ file: File; type: 'general' | 'color'; index?: number; colorIndex?: number }> = []
      
      // Collect general images
      for (let i = 0; i < imagesGenerales.length; i++) {
        const img = imagesGenerales[i]
        if (img.file) {
          filesToUpload.push({ file: img.file, type: 'general', index: i })
        }
      }

      // Collect color images
      if (formData.has_colors) {
        for (let colorIdx = 0; colorIdx < couleurs.length; colorIdx++) {
          const couleur = couleurs[colorIdx]
          if (couleur.nom) {
            for (let imgIdx = 0; imgIdx < couleur.images.length; imgIdx++) {
              filesToUpload.push({ 
                file: couleur.images[imgIdx], 
                type: 'color', 
                colorIndex: colorIdx,
                index: imgIdx 
              })
            }
          }
        }
      }

      // Upload all files in parallel
      const uploadPromises = filesToUpload.map(({ file }) => uploadImage(file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // Map uploaded URLs back to their locations
      let urlIndex = 0
      const urlMap = new Map<string, string>()
      filesToUpload.forEach((item) => {
        urlMap.set(`${item.type}-${item.colorIndex ?? 'none'}-${item.index}`, uploadedUrls[urlIndex])
        urlIndex++
      })

      // Build general images URLs
      const imagesGeneralesUrls: Array<{ url: string; couleur: null; ordre: number }> = []
      for (let i = 0; i < imagesGenerales.length; i++) {
        const img = imagesGenerales[i]
        if (img.file) {
          const url = urlMap.get(`general-none-${i}`)
          if (url) {
            imagesGeneralesUrls.push({ url, couleur: null, ordre: i + 1 })
          }
        } else if (img.url) {
          // URL existante (lors de l'édition)
          imagesGeneralesUrls.push({ url: img.url, couleur: null, ordre: i + 1 })
        }
      }

      // Traitement selon le type de produit
      let images: Array<{ url: string; ordre: number }> | undefined = undefined
      let couleursData: Array<{ nom: string; code?: string; images: string[]; stock: number; taille?: string }> | undefined = undefined
      let imageUrl = formData.image_url

      if (formData.has_colors) {
        // Produit AVEC couleurs
        // Validation: chaque couleur doit avoir au moins une image
        for (const couleur of couleurs) {
          if (!couleur.nom) {
            toast.error('Tous les noms de couleur doivent être remplis')
            setUploading(false)
            return
          }
          const totalImages = couleur.images.length + couleur.imageUrls.length
          if (totalImages === 0) {
            toast.error(`La couleur "${couleur.nom}" doit avoir au moins une image`)
            setUploading(false)
            return
          }
        }

        // Build color images data with uploaded URLs
        couleursData = [] as Array<{ nom: string; code?: string; images: string[]; stock: number; taille?: string }>
        for (let colorIdx = 0; colorIdx < couleurs.length; colorIdx++) {
          const couleur = couleurs[colorIdx]
          if (!couleur.nom) continue

          const couleurImages: string[] = []
          
          // Add uploaded URLs in order
          for (let imgIdx = 0; imgIdx < couleur.images.length; imgIdx++) {
            const url = urlMap.get(`color-${colorIdx}-${imgIdx}`)
            if (url) {
              couleurImages.push(url)
            }
          }
          
          // Ajouter URLs existantes (lors de l'édition)
          couleurImages.push(...couleur.imageUrls)

          if (couleurImages.length === 0) {
            toast.error(`La couleur "${couleur.nom}" doit avoir au moins une image`)
            setUploading(false)
            return
          }

          couleursData.push({
            nom: couleur.nom,
            code: couleur.code,
            images: couleurImages,
            stock: couleur.stock || 0,
            taille: couleur.taille || undefined,
          })
        }

        // Utiliser la première image de la première couleur comme image_url
        if (couleursData.length > 0 && couleursData[0].images.length > 0) {
          imageUrl = couleursData[0].images[0]
        }
      } else {
        // Produit SANS couleurs - images générales
        if (imagesGeneralesUrls.length === 0) {
          toast.error('Au moins une image est requise pour les produits sans couleurs')
          setUploading(false)
          return
        }

        images = imagesGeneralesUrls.map(img => ({ url: img.url, ordre: img.ordre }))
        imageUrl = images[0]?.url || formData.image_url
      }

      const produitData = {
        ...formData,
        prix: parseFloat(formData.prix),
        stock: formData.has_colors ? 0 : parseInt(formData.stock), // Stock global = 0 si produit avec couleurs
        vedette: formData.vedette,
        has_colors: formData.has_colors,
        image_url: imageUrl,
        images: images,
        couleurs: couleursData,
        categorie: categorieSlug === 'tous' ? formData.categorie : categorieNom,
      }

      // Debug: log data being sent
      console.log('📦 Données envoyées:', {
        images: produitData.images,
        couleurs: produitData.couleurs,
        imagesCount: produitData.images?.length || 0,
        couleursCount: produitData.couleurs?.length || 0,
      })

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
        let errorMessage = 'Erreur lors de la sauvegarde'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            console.error('❌ Erreur API:', errorData)
          } else {
            const text = await response.text()
            console.error('❌ Erreur API (non-JSON):', text)
            errorMessage = text || errorMessage
          }
        } catch (parseError) {
          console.error('❌ Erreur lors du parsing de la réponse:', parseError)
          // If parsing fails, use default error message
        }
        throw new Error(errorMessage)
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
        taille: '',
        has_colors: false,
      })
      setCouleurs([])
      setImagesGenerales([])
      chargerProduits()
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!produitToDelete) return

    try {
      const response = await fetch(`/api/admin/produits?id=${produitToDelete}`, {
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

      toast.success('Produit supprimé')
      chargerProduits()
      setDeleteDialogOpen(false)
      setProduitToDelete(null)
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <LuxuryLoading fullScreen message="Chargement des produits..." />
  }

  // Grouper les produits par catégorie si "tous"
  const produitsParCategorie = produits.reduce((acc, produit) => {
    const cat = produit.categorie || 'Sans catégorie'
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(produit)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/pwa/produits')}
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
                  taille: '',
                  has_colors: false,
                })
                setCouleurs([])
                setImagesGenerales([])
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <div>
                  <DialogTitle>
                    {editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduit ? 'Modifiez les informations du produit' : 'Remplissez les informations pour créer un nouveau produit'}
                  </DialogDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center gap-2 shrink-0"
                >
                  <Eye className="w-4 h-4" />
                  Aperçu
                </Button>
              </div>
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
                <RichTextEditor
                  content={formData.description}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                  placeholder="Décrivez le produit..."
                  className="mt-2"
                />
              </div>
              {/* Sélection du type de produit */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Type de produit *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, has_colors: false })
                      setCouleurs([])
                    }}
                    className={cn(
                      "h-auto py-6 px-4 rounded-lg border-2 transition-all flex flex-col gap-3 items-center justify-center",
                      !formData.has_colors
                        ? "bg-dore border-dore text-charbon shadow-lg scale-[1.02]"
                        : "bg-background border-border text-foreground hover:border-dore/50 hover:bg-muted/50"
                    )}
                  >
                    <Package className={cn(
                      "w-8 h-8",
                      !formData.has_colors ? "text-charbon" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-semibold text-base",
                      !formData.has_colors ? "text-charbon" : "text-foreground"
                    )}>
                      Sans couleurs
                    </span>
                    <span className={cn(
                      "text-xs",
                      !formData.has_colors ? "text-charbon/80" : "text-muted-foreground"
                    )}>
                      Images multiples
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, has_colors: true })
                      setImagesGenerales([])
                    }}
                    className={cn(
                      "h-auto py-6 px-4 rounded-lg border-2 transition-all flex flex-col gap-3 items-center justify-center",
                      formData.has_colors
                        ? "bg-dore border-dore text-charbon shadow-lg scale-[1.02]"
                        : "bg-background border-border text-foreground hover:border-dore/50 hover:bg-muted/50"
                    )}
                  >
                    <Palette className={cn(
                      "w-8 h-8",
                      formData.has_colors ? "text-charbon" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-semibold text-base",
                      formData.has_colors ? "text-charbon" : "text-foreground"
                    )}>
                      Avec couleurs
                    </span>
                    <span className={cn(
                      "text-xs",
                      formData.has_colors ? "text-charbon/80" : "text-muted-foreground"
                    )}>
                      Stock par couleur
                    </span>
                  </button>
                </div>
                <div className={cn(
                  "mt-3 p-3 rounded-lg border",
                  formData.has_colors ? "bg-dore/10 border-dore/30" : "bg-muted/30 border-border"
                )}>
                  <p className={cn(
                    "text-sm",
                    formData.has_colors ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {formData.has_colors 
                      ? 'Ce produit aura des variantes de couleur avec stock et images séparés pour chaque couleur.'
                      : 'Ce produit aura plusieurs images sans variantes de couleur.'}
                  </p>
                </div>
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
                {!formData.has_colors && (
                <div>
                  <Label htmlFor="stock">Stock disponible *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Le stock sera automatiquement décrémenté lors des commandes
                  </p>
                  {parseInt(formData.stock) <= 5 && parseInt(formData.stock) > 0 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Stock faible - Considérez réapprovisionner
                    </p>
                  )}
                  {parseInt(formData.stock) === 0 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Rupture de stock - Le produit ne sera pas disponible à la vente
                    </p>
                  )}
                </div>
                )}
              </div>
              <div>
                <Label htmlFor="taille">Tailles disponibles (séparées par des virgules, ex: 40, 41, 42, 43)</Label>
                <Input
                  id="taille"
                  type="text"
                  placeholder="40, 41, 42, 43"
                  value={formData.taille}
                  onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide si le produit n'a pas de tailles. Format: tailles séparées par des virgules.
                </p>
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
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.nom}>
                          {cat.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Images générales (uniquement pour produits SANS couleurs) */}
              {!formData.has_colors && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Images du produit *
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ajoutez plusieurs images pour ce produit. Au moins une image est requise.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="bg-dore text-charbon hover:bg-dore/90"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          files.forEach((file) => {
                            addImageGenerale()
                            const newIndex = imagesGenerales.length
                            setTimeout(() => {
                              handleImageGeneraleChange(newIndex, file)
                            }, 0)
                          })
                        }
                        input.click()
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Sélectionner des images
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesGenerales.map((img, index) => (
                      <div key={index} className="relative group border rounded-lg overflow-hidden bg-muted/50">
                        {img.url ? (
                          <>
                            <div className="relative aspect-square">
                              <img src={img.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                              onClick={() => removeImageGenerale(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <div className="aspect-square flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                            <div className="text-center p-2">
                              <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Image {index + 1}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {imagesGenerales.length === 0 && (
                      <div className="col-span-full">
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Aucune image ajoutée</p>
                          <p className="text-xs text-muted-foreground">Cliquez sur "Sélectionner des images" pour commencer</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gestion des couleurs (uniquement pour produits AVEC couleurs) */}
              {formData.has_colors && (
                <div className="border-t pt-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg p-4 -mx-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Palette className="w-4 h-4" />
                        Couleurs disponibles *
                      </Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Ajoutez des variantes de couleur. Chaque couleur doit avoir au moins une image et son propre stock.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCouleur}
                      className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une couleur
                    </Button>
                  </div>
                <div className="space-y-6">
                  {couleurs.map((couleur, couleurIndex) => (
                    <div key={couleurIndex} className="p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg space-y-5 shadow-sm">
                      {/* Top row: Color name, code, and stock */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nom de la couleur *</Label>
                          <Input
                            value={couleur.nom}
                            onChange={(e) => updateCouleur(couleurIndex, 'nom', e.target.value)}
                            placeholder="Ex: Noir, Marron, Rouge"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code couleur (hex)</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={couleur.code || '#000000'}
                              onChange={(e) => {
                                const newColor = e.target.value
                                updateCouleur(couleurIndex, 'code', newColor)
                              }}
                              className="w-16 h-10 rounded border border-input cursor-pointer flex-shrink-0"
                            />
                            <Input
                              type="text"
                              value={couleur.code || '#000000'}
                              onChange={(e) => {
                                let value = e.target.value
                                // Ensure it starts with #
                                if (value && !value.startsWith('#')) {
                                  value = '#' + value
                                }
                                // Limit to 7 characters (#RRGGBB)
                                if (value.length <= 7) {
                                  updateCouleur(couleurIndex, 'code', value)
                                }
                              }}
                              placeholder="#000000"
                              pattern="^#[0-9A-Fa-f]{6}$"
                              maxLength={7}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Stock pour cette couleur *</Label>
                          <Input
                            type="number"
                            min="0"
                            value={couleur.stock || 0}
                            onChange={(e) => updateCouleur(couleurIndex, 'stock', parseInt(e.target.value) || 0)}
                            required
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Stock disponible pour cette couleur
                          </p>
                        </div>
                      </div>

                      {/* Sizes section */}
                      <div className="space-y-2">
                        <Label>Tailles disponibles pour cette couleur</Label>
                        <Input
                          type="text"
                          value={couleur.taille || ''}
                          onChange={(e) => updateCouleur(couleurIndex, 'taille', e.target.value)}
                          placeholder="Ex: 40, 41, 42, 43 (séparées par des virgules)"
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Laissez vide si cette couleur n'a pas de tailles spécifiques. Format: tailles séparées par des virgules.
                        </p>
                      </div>

                      {/* Images section */}
                      <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">
                            Images pour "{couleur.nom || 'cette couleur'}" * (minimum 1 image)
                          </Label>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="bg-dore text-charbon hover:bg-dore/90"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
                              input.multiple = true
                              input.onchange = (e) => {
                                const files = Array.from((e.target as HTMLInputElement).files || [])
                                files.forEach((file) => {
                                  addImageToCouleur(couleurIndex, file)
                                })
                              }
                              input.click()
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Sélectionner des images
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {couleur.imageUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="flex gap-4 items-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                              <div className="relative w-24 h-24 rounded overflow-hidden border flex-shrink-0">
                                <img src={url} alt={`Image ${imgIndex + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{getFileName(url)}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeImageFromCouleur(couleurIndex, imgIndex)}
                                className="flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          {couleur.images.map((file, imgIndex) => (
                            <div key={`new-${imgIndex}`} className="flex gap-4 items-center p-4 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                              <div className="relative w-24 h-24 rounded overflow-hidden border flex-shrink-0">
                                <img src={URL.createObjectURL(file)} alt={`Preview ${imgIndex + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const updated = [...couleurs]
                                  updated[couleurIndex].images.splice(imgIndex, 1)
                                  setCouleurs(updated)
                                }}
                                className="flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          {couleur.imageUrls.length === 0 && couleur.images.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                              Aucune image ajoutée. Cliquez sur "Ajouter une image" pour commencer.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remove color button */}
                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCouleur(couleurIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Supprimer cette couleur
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {couleurs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                      Aucune couleur ajoutée. Cliquez sur "Ajouter une couleur" pour commencer.
                    </p>
                )}
              </div>
                </div>
              )}
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

        {/* Product Preview Modal */}
        <ProductPreviewModal
          formData={formData}
          couleurs={couleurs}
          imagesGenerales={imagesGenerales}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </div>

      {categorieSlug === 'tous' ? (
        <div className="space-y-8">
          {Object.entries(produitsParCategorie).map(([cat, prods]) => (
            <div key={cat}>
              <h2 className="text-2xl font-serif mb-4">{cat}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(prods as any[]).map((produit: any) => (
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
                        {/* Affichage du stock avec indicateur visuel */}
                        {(() => {
                          // Calculer le stock total pour les produits avec couleurs
                          let stockTotal = produit.stock || 0
                          if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs)) {
                            stockTotal = produit.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
                          }
                          
                          return (
                            <div className="mb-3">
                              <div className="flex items-center gap-2">
                          <Package className={`w-4 h-4 ${
                                  stockTotal === 0 
                              ? 'text-red-600' 
                                    : stockTotal <= 5 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                                  stockTotal === 0 
                              ? 'text-red-600' 
                                    : stockTotal <= 5 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                                  Stock total: {stockTotal}
                          </span>
                                {stockTotal === 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Rupture de stock
                            </span>
                          )}
                                {stockTotal > 0 && stockTotal <= 5 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Stock faible
                            </span>
                          )}
                        </div>
                              {produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {produit.couleurs.map((c: any, idx: number) => (
                                    <div key={idx} className="text-xs flex items-center gap-2">
                                      <span className="w-16 truncate">{c.nom}:</span>
                                      <span className={c.stock === 0 ? 'text-red-600' : c.stock <= 5 ? 'text-orange-600' : 'text-green-600'}>
                                        {c.stock || 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduit(produit)
                              setFormData({
                                nom: produit.nom || '',
                                description: produit.description || '',
                                prix: produit.prix ? produit.prix.toString() : '',
                                stock: produit.stock !== null && produit.stock !== undefined ? produit.stock.toString() : '',
                                categorie: produit.categorie || '',
                                vedette: produit.vedette === true,
                                image_url: produit.image_url || '',
                                taille: produit.taille || '',
                                has_colors: produit.has_colors === true,
                              })
                              
                              // Charger selon le type de produit
                              if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
                                // Produit AVEC couleurs
                                const couleursData = produit.couleurs.map((c: any) => ({
                                  nom: c.nom || '',
                                  code: c.code || '#000000',
                                  stock: c.stock !== null && c.stock !== undefined ? c.stock : 0,
                                  taille: c.taille || '',
                                  images: [],
                                  imageUrls: Array.isArray(c.images) ? c.images : [],
                                }))
                                setCouleurs(couleursData)
                                setImagesGenerales([])
                              } else if (produit.images && Array.isArray(produit.images) && produit.images.length > 0) {
                                // Produit SANS couleurs - images générales
                                const generales = produit.images.map((img: any) => ({
                                  file: null,
                                  url: typeof img === 'string' ? img : (img?.url || img),
                                }))
                                setImagesGenerales(generales)
                                setCouleurs([])
                              } else {
                                // Fallback: utiliser image_url si disponible
                                if (produit.image_url) {
                                  setImagesGenerales([{ file: null, url: produit.image_url }])
                                } else {
                                  setImagesGenerales([])
                                }
                                setCouleurs([])
                              }
                              setDialogOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProduitToDelete(produit.id)
                              setDeleteDialogOpen(true)
                            }}
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
                  {/* Affichage du stock avec indicateur visuel */}
                  {(() => {
                    // Calculer le stock total pour les produits avec couleurs
                    let stockTotal = produit.stock || 0
                    if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs)) {
                      stockTotal = produit.couleurs.reduce((sum: number, c: any) => sum + (c.stock || 0), 0)
                    }
                    
                    return (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                    <Package className={`w-4 h-4 ${
                            stockTotal === 0 
                        ? 'text-red-600' 
                              : stockTotal <= 5 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                            stockTotal === 0 
                        ? 'text-red-600' 
                              : stockTotal <= 5 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                            Stock total: {stockTotal}
                    </span>
                          {stockTotal === 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Rupture de stock
                      </span>
                    )}
                          {stockTotal > 0 && stockTotal <= 5 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Stock faible
                      </span>
                    )}
                  </div>
                        {produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {produit.couleurs.map((c: any, idx: number) => (
                              <div key={idx} className="text-xs flex items-center gap-2">
                                <span className="w-16 truncate">{c.nom}:</span>
                                <span className={c.stock === 0 ? 'text-red-600' : c.stock <= 5 ? 'text-orange-600' : 'text-green-600'}>
                                  {c.stock || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduit(produit)
                        setFormData({
                          nom: produit.nom || '',
                          description: produit.description || '',
                          prix: produit.prix ? produit.prix.toString() : '',
                          stock: produit.stock !== null && produit.stock !== undefined ? produit.stock.toString() : '',
                          categorie: produit.categorie || categorieNom,
                          vedette: produit.vedette === true,
                          image_url: produit.image_url || '',
                          taille: produit.taille || '',
                          has_colors: produit.has_colors === true,
                        })
                        
                        // Charger selon le type de produit
                        if (produit.has_colors && produit.couleurs && Array.isArray(produit.couleurs) && produit.couleurs.length > 0) {
                          // Produit AVEC couleurs
                          const couleursData = produit.couleurs.map((c: any) => ({
                            nom: c.nom || '',
                            code: c.code || '#000000',
                            stock: c.stock !== null && c.stock !== undefined ? c.stock : 0,
                            taille: c.taille || '',
                            images: [],
                            imageUrls: Array.isArray(c.images) ? c.images : [],
                          }))
                          setCouleurs(couleursData)
                          setImagesGenerales([])
                        } else if (produit.images && Array.isArray(produit.images) && produit.images.length > 0) {
                          // Produit SANS couleurs - images générales
                          const generales = produit.images.map((img: any) => ({
                            file: null,
                            url: typeof img === 'string' ? img : (img?.url || img),
                          }))
                          setImagesGenerales(generales)
                          setCouleurs([])
                        } else {
                          // Fallback: utiliser image_url si disponible
                          if (produit.image_url) {
                            setImagesGenerales([{ file: null, url: produit.image_url }])
                          } else {
                            setImagesGenerales([])
                          }
                          setCouleurs([])
                        }
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProduitToDelete(produit.id)
                        setDeleteDialogOpen(true)
                      }}
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

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
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

