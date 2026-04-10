import { Button, Label } from '@maison/ui'
import { ImageIcon, X, Upload } from 'lucide-react'

export interface GeneralImage {
  file: File | null
  url: string | null
}

interface GeneralImagesFormProps {
  images: GeneralImage[]
  onChange: (images: GeneralImage[]) => void
}

export function GeneralImagesForm({ images, onChange }: GeneralImagesFormProps) {
  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      const newImages = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
      onChange([...images, ...newImages])
    }
    input.click()
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
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
          size="sm"
          className="bg-dore text-charbon hover:bg-dore/90"
          onClick={addImage}
        >
          <Upload className="w-4 h-4 mr-2" />
          Sélectionner des images
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {images.map((img, index) => (
          <div key={index} className="relative group border rounded-lg overflow-hidden bg-muted/50 aspect-square">
            <img src={img.url || ''} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
              onClick={() => removeImage(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune image ajoutée</p>
          </div>
        )}
      </div>
    </div>
  )
}
