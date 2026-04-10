import { Button, Input, Label, Textarea } from '@maison/ui'
import { Upload } from 'lucide-react'
import { useCategoryForm } from '@/hooks/admin/useCategoryForm'

interface CategoryFormData { nom: string; slug: string; description: string; image_url: string; ordre: number; active: boolean }
interface CategoryFormProps { formData: CategoryFormData; setFormData: (data: CategoryFormData) => void; onSubmit: (e: React.FormEvent, url: string | null) => void; uploading: boolean; editing: boolean }

export function CategoryForm({ formData, setFormData, onSubmit, uploading, editing }: CategoryFormProps) {
  const { imagePreview, handleImageChange, handleLocalSubmit, generateSlug } = useCategoryForm(formData.image_url, onSubmit)

  return (
    <form onSubmit={(e) => handleLocalSubmit(e)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Nom *</Label>
          <Input required value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value, slug: editing ? formData.slug : generateSlug(e.target.value) })} />
        </div>
        <div><Label>Slug *</Label>
          <Input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
        </div>
      </div>
      <div><Label>Description</Label>
        <Textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div><Label>Ordre</Label>
        <Input type="number" value={formData.ordre} onChange={e => setFormData({ ...formData, ordre: parseInt(e.target.value) || 0 })} />
      </div>
      <div><Label>Image</Label>
        <div className="mt-2 space-y-3">
          <Button type="button" variant="default" size="sm" className="bg-dore text-charbon hover:bg-dore/90" onClick={() => (document.getElementById('image') as HTMLInputElement)?.click()}><Upload className="w-4 h-4 mr-2" /> Sélectionner</Button>
          <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          {(imagePreview || formData.image_url) && (
            <div className="mt-4"><img src={imagePreview || formData.image_url} alt="" className="w-full max-w-md h-40 object-cover rounded-lg border border-border" /></div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2"><input type="checkbox" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4" /><Label className="cursor-pointer">Catégorie active</Label></div>
      <Button type="submit" className="w-full" disabled={uploading}>{uploading ? 'Enregistrement...' : (editing ? 'Modifier' : 'Créer')}</Button>
    </form>
  )
}
