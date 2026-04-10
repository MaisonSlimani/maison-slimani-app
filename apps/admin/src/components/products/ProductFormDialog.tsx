import { Product, Category } from '@maison/domain'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Label, DialogDescription } from '@maison/ui'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { GeneralImagesForm } from './form/GeneralImagesForm'
import { CouleursForm } from './form/VariationsForm'
import { ProductFormBasicFields } from './form/ProductFormBasicFields'
import { useProductForm } from '@/hooks/admin/useProductForm'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: Category[]
  onSuccess: () => void
  defaultCategory?: string
}

export function ProductFormDialog({ open, onOpenChange, product, categories, onSuccess, defaultCategory }: ProductFormDialogProps) {
  const { loading, formData, setFormData, imagesGenerales, setImagesGenerales, couleurs, setCouleurs, handleSubmit } = useProductForm({
    product, defaultCategory, onSuccess, onOpenChange
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? 'Modifier' : 'Nouveau'} produit</DialogTitle>
          <DialogDescription>Gérez les informations du produit.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <ProductFormBasicFields formData={formData} setFormData={setFormData} categories={categories} />
          <div className="space-y-2"><Label>Description</Label>
            <div className="border rounded-lg p-1 bg-muted/10">
              <RichTextEditor content={formData.description || ''} onChange={html => setFormData({ ...formData, description: html })} />
            </div>
          </div>
          {formData.has_colors ? <CouleursForm couleurs={couleurs} onChange={setCouleurs} /> : <GeneralImagesForm images={imagesGenerales} onChange={setImagesGenerales} />}
          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">{loading ? 'Enregistrement...' : (product ? 'Mettre à jour' : 'Créer')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
