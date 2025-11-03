'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AdminProduitsPage() {
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduit, setEditingProduit] = useState<any>(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorie: '',
    vedette: false,
    image_url: '',
  })

  useEffect(() => {
    chargerProduits()
  }, [])

  const chargerProduits = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .order('date_ajout', { ascending: false })

      if (error) throw error
      setProduits(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      
      const produitData = {
        ...formData,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        vedette: formData.vedette,
      }

      if (editingProduit) {
        const { error } = await supabase
          .from('produits')
          .update(produitData)
          .eq('id', editingProduit.id)

        if (error) throw error
        toast.success('Produit mis à jour')
      } else {
        const { error } = await supabase
          .from('produits')
          .insert(produitData)

        if (error) throw error
        toast.success('Produit créé')
      }

      setDialogOpen(false)
      setEditingProduit(null)
      setFormData({
        nom: '',
        description: '',
        prix: '',
        stock: '',
        categorie: '',
        vedette: false,
        image_url: '',
      })
      chargerProduits()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('produits')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Produit supprimé')
      chargerProduits()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2">Gestion des produits</h1>
          <p className="text-ecru/70">Créez et gérez vos produits</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduit(null)
              setFormData({
                nom: '',
                description: '',
                prix: '',
                stock: '',
                categorie: '',
                vedette: false,
                image_url: '',
              })
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
              </DialogTitle>
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
              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vedette"
                  checked={formData.vedette}
                  onChange={(e) => setFormData({ ...formData, vedette: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="vedette">Produit en vedette</Label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingProduit ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {produits.map((produit) => (
          <Card key={produit.id} className="p-6 bg-ecru/5 border-ecru/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-serif mb-2">{produit.nom}</h3>
                <p className="text-ecru/70 text-sm mb-4">{produit.description}</p>
                <div className="flex gap-6 text-sm">
                  <span className="text-ecru/70">
                    Prix: <span className="text-ecru">{produit.prix.toLocaleString('fr-MA')} DH</span>
                  </span>
                  <span className="text-ecru/70">
                    Stock: <span className="text-ecru">{produit.stock}</span>
                  </span>
                  <span className="text-ecru/70">
                    Catégorie: <span className="text-ecru">{produit.categorie}</span>
                  </span>
                  {produit.vedette && (
                    <span className="text-dore font-medium">⭐ Vedette</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingProduit(produit)
                    setFormData({
                      nom: produit.nom,
                      description: produit.description,
                      prix: produit.prix.toString(),
                      stock: produit.stock.toString(),
                      categorie: produit.categorie,
                      vedette: produit.vedette,
                      image_url: produit.image_url || '',
                    })
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(produit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

