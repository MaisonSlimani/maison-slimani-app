import { Plus } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@maison/ui'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { Category } from '@maison/domain'

interface CategoriesHeaderProps {
  dialogOpen: boolean
  setDialogOpen: (o: boolean) => void
  editingCategorie: Category | null
  setEditingCategorie: (c: Category | null) => void
  formData: { name: string; slug: string; description: string; image_url: string; order: number; isActive: boolean }
  setFormData: (d: { name: string; slug: string; description: string; image_url: string; order: number; isActive: boolean }) => void
  categoriesCount: number
  onSubmit: (e: React.FormEvent, url: string | null) => void
  uploading: boolean
}

export function CategoriesHeader({
  dialogOpen, setDialogOpen, editingCategorie, setEditingCategorie, formData, setFormData, categoriesCount, onSubmit, uploading
}: CategoriesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-serif mb-2">Gestion des catégories</h1>
        <p className="text-muted-foreground">Créez et gérez les catégories de produits</p>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setEditingCategorie(null)
            setFormData({ name: '', slug: '', description: '', image_url: '', order: categoriesCount, isActive: true })
          }}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle catégorie
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto admin-scroll">
          <DialogHeader>
            <DialogTitle>{editingCategorie ? 'Modifier' : 'Nouvelle'} catégorie</DialogTitle>
            <DialogDescription>{editingCategorie ? 'Modifiez' : 'Remplissez'} les informations.</DialogDescription>
          </DialogHeader>
          <CategoryForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} uploading={uploading} editing={!!editingCategorie} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
