import { ProductVariation } from '@maison/domain'
import { Button, Alert } from '@maison/ui'
import { Plus, Palette, AlertCircle } from 'lucide-react'
import { VariationItem } from './VariationItem'

export interface VariationImage {
  file: File | null
  url: string
}

interface CouleursFormProps {
  couleurs: (ProductVariation & { pendingImages?: VariationImage[] })[]
  onChange: (couleurs: (ProductVariation & { pendingImages?: VariationImage[] })[]) => void
}

export function CouleursForm({ couleurs, onChange }: CouleursFormProps) {
  const addCouleur = () => {
    onChange([...couleurs, { nom: '', code: '#000000', stock: 0, tailles: [], images: [], pendingImages: [] }])
  }

  const removeCouleur = (index: number) => {
    onChange(couleurs.filter((_, i) => i !== index))
  }

  const handleCouleurChange = (index: number, updated: ProductVariation & { pendingImages?: VariationImage[] }) => {
    const newCouleurs = [...couleurs]
    newCouleurs[index] = updated
    onChange(newCouleurs)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-dore" />
          <h3 className="font-serif text-lg">Variations de couleurs</h3>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addCouleur}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter une couleur
        </Button>
      </div>

      {couleurs.length === 0 && (
        <Alert variant="default" className="bg-muted/50 border-dashed">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm text-muted-foreground">Aucune couleur configurée. Ajoutez une couleur pour gérer les variations.</p>
        </Alert>
      )}

      <div className="space-y-6">
        {couleurs.map((variation, index) => (
          <VariationItem 
            key={index} 
            index={index} 
            variation={variation} 
            onChange={handleCouleurChange} 
            onRemove={removeCouleur} 
          />
        ))}
      </div>
    </div>
  )
}
