import { useState } from 'react'
import {
  Card, Button,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  LuxuryLoading,
} from '@maison/ui'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryRepo } from '@/lib/repositories'
import { Category } from '@maison/domain'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoriesHeader } from '@/components/categories/CategoriesHeader'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ nom: '', slug: '', description: '', image_url: '', ordre: 0, active: true })
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => await categoryRepo.findAll(),
    staleTime: 300000,
  })

  const handleSubmit = async (e: React.FormEvent, imageUrl: string | null) => {
    e.preventDefault(); setUploading(true)
    try {
      const payload = { ...formData, description: formData.description || null, image_url: imageUrl || null, ordre: parseInt(formData.ordre.toString()) || 0 }
      const res = editingCategorie ? await categoryRepo.update(editingCategorie.id, payload) : await categoryRepo.create(payload)
      if (!res.success) throw new Error(res.error || 'Erreur')
      toast.success(editingCategorie ? 'Mis à jour' : 'Créé')
      setDialogOpen(false); setEditingCategorie(null); queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Erreur') 
    } finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await categoryRepo.delete(deleteId)
      if (!res.success) throw new Error(res.error || 'Erreur')
      toast.success('Supprimé'); queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setDeleteId(null)
    } catch (err: unknown) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    }
  }

  if (loading) return <LuxuryLoading fullScreen message="Chargement..." />

  return (
    <div className="space-y-8">
      <CategoriesHeader dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} editingCategorie={editingCategorie} setEditingCategorie={setEditingCategorie} formData={formData} setFormData={setFormData} categoriesCount={categories.length} onSubmit={handleSubmit} uploading={uploading} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c: Category) => (
          <CategoryCard key={c.id} categorie={c} onEdit={cat => { setEditingCategorie(cat); setFormData({ nom: cat.nom, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '', ordre: cat.ordre || 0, active: cat.active !== false }); setDialogOpen(true) }} onDelete={setDeleteId} />
        ))}
      </div>
      {categories.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground"><p>Aucune catégorie.</p><Button onClick={() => setDialogOpen(true)} className="mt-4"><Plus className="w-4 h-4 mr-2" /> Créer</Button></Card>
      )}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer ?</AlertDialogTitle><AlertDialogDescription>Action irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
