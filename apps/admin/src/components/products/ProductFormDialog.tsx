import { Product, Category } from '@maison/domain'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Label, DialogDescription, Alert } from '@maison/ui'
import { AlertCircle } from 'lucide-react'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { GeneralImagesForm } from './form/GeneralImagesForm'
import { VariationsForm } from './form/VariationsForm'
import { ProductFormBasicFields } from './form/ProductFormBasicFields'
import { useProductForm } from '@/hooks/admin/useProductForm'
import { useEditorImageUpload } from '@/hooks/admin/useEditorImageUpload'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: Category[]
  onSuccess: () => void
  defaultCategory?: string
}

export function ProductFormDialog({ open, onOpenChange, product, categories, onSuccess, defaultCategory }: ProductFormDialogProps) {
  const { 
    loading, 
    errors,
    formData, 
    setFormData, 
    generalImages, 
    setGeneralImages, 
    colors, 
    setColors, 
    handleSubmit 
  } = useProductForm({
    product, 
    defaultCategory, 
    onSuccess, 
    onOpenChange
  })

  const uploadImage = useEditorImageUpload()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier' : 'Nouveau'} produit</DialogTitle>
          <DialogDescription>Gérez les informations du produit.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <h5 className="font-semibold text-sm">Formulaire invalide</h5>
                <p className="text-xs">Veuillez corriger les erreurs signalées dans les sections ci-dessous.</p>
              </div>
            </Alert>
          )}

          <ProductFormBasicFields formData={formData} setFormData={setFormData} categories={categories} errors={errors} />
          
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="border rounded-lg p-1 bg-muted/10">
              <RichTextEditor 
                content={formData.description || ''} 
                onChange={html => setFormData({ ...formData, description: html })} 
                onImageUpload={uploadImage}
              />
            </div>
          </div>
          
          {formData.hasColors ? (
            <VariationsForm colors={colors} onChange={setColors} errors={errors} />
          ) : (
            <GeneralImagesForm images={generalImages} onChange={setGeneralImages} />
          )}
          
          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Enregistrement...' : (product ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
