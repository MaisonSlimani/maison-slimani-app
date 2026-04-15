import { ProductVariation } from '@maison/domain'
import { Button, Alert } from '@maison/ui'
import { Plus, Palette, AlertCircle } from 'lucide-react'
import { VariationItem } from './VariationItem'

export interface VariationImage {
  file: File | null
  url: string
}

interface VariationsFormProps {
  colors: (ProductVariation & { pendingImages?: VariationImage[] })[]
  onChange: (colors: (ProductVariation & { pendingImages?: VariationImage[] })[]) => void
}

export function VariationsForm({ colors, onChange }: VariationsFormProps) {
  const addColor = () => {
    onChange([...colors, { name: '', code: '#000000', stock: 0, sizes: [], images: [], pendingImages: [] }])
  }

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index))
  }

  const handleColorChange = (index: number, updated: ProductVariation & { pendingImages?: VariationImage[] }) => {
    const newColors = [...colors]
    newColors[index] = updated
    onChange(newColors)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-dore" />
          <h3 className="font-serif text-lg">Variations de couleurs</h3>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addColor}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter une couleur
        </Button>
      </div>

      {colors.length === 0 && (
        <Alert variant="default" className="bg-muted/50 border-dashed">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm text-muted-foreground">Aucune couleur configurée. Ajoutez une couleur pour gérer les variations.</p>
        </Alert>
      )}

      <div className="space-y-6">
        {colors.map((variation, index) => (
          <VariationItem 
            key={index} 
            index={index} 
            variation={variation} 
            onChange={handleColorChange} 
            onRemove={removeColor} 
          />
        ))}
      </div>
    </div>
  )
}
