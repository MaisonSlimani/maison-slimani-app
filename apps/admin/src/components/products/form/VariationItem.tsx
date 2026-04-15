import { ProductVariation } from '@maison/domain'
import { Button, Input, Label, Card } from '@maison/ui'
import { Trash2, Plus, Image as ImageIcon, X } from 'lucide-react'
import { VariationImage } from './VariationsForm'

type VariationWithPending = ProductVariation & { pendingImages?: VariationImage[] }

interface VariationItemProps {
  variation: VariationWithPending
  index: number
  onChange: (index: number, updated: VariationWithPending) => void
  onRemove: (index: number) => void
}

function VariationHeader({ 
  variation, 
  onUpdate, 
  onRemove 
}: { 
  variation: VariationWithPending; 
  onUpdate: (u: VariationWithPending) => void; 
  onRemove: () => void 
}) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div className="space-y-2">
          <Label>Couleur</Label>
          <Input 
            value={variation.name} 
            onChange={e => onUpdate({ ...variation, name: e.target.value })} 
            placeholder="ex: Noir" 
          />
        </div>
        <div className="space-y-2">
          <Label>Code Hex</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              value={variation.code || '#000000'} 
              onChange={e => onUpdate({ ...variation, code: e.target.value })} 
              className="w-12 p-1 h-10" 
            />
            <Input 
              value={variation.code || ''} 
              onChange={e => onUpdate({ ...variation, code: e.target.value })} 
              placeholder="#000000" 
            />
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRemove} 
        className="text-red-600 hover:bg-red-50 ml-2"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

function SizeGrid({ 
  variation, 
  onUpdate 
}: { 
  variation: VariationWithPending; 
  onUpdate: (u: VariationWithPending) => void 
}) {
  const handleSizeChange = (i: number, name: string, stock: number) => {
    const s = [...(variation.sizes || [])]
    s[i] = { name, stock }
    onUpdate({ ...variation, sizes: s })
  }
  
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tailles & Stock</Label>
      <div className="grid grid-cols-1 gap-2 mt-2">
        {(variation.sizes || []).map((t, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input 
              placeholder="Taille" 
              value={t.name} 
              onChange={e => handleSizeChange(i, e.target.value, t.stock)} 
              className="flex-1" 
            />
            <Input 
              type="number" 
              value={t.stock} 
              onChange={e => handleSizeChange(i, t.name, parseInt(e.target.value) || 0)} 
              className="w-24" 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onUpdate({ 
                ...variation, 
                sizes: (variation.sizes || []).filter((_, idx) => idx !== i) 
              })} 
              className="h-8 w-8"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => onUpdate({ 
            ...variation, 
            sizes: [...(variation.sizes || []), { name: '', stock: 0 }] 
          })} 
          className="w-full border-dashed h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" /> Ajouter une taille
        </Button>
      </div>
    </div>
  )
}

export function VariationItem({ variation, index, onChange, onRemove }: VariationItemProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const p = Array.from(e.target.files).map(f => ({ file: f, url: URL.createObjectURL(f) }))
    onChange(index, { ...variation, pendingImages: [...(variation.pendingImages || []), ...p] })
  }

  return (
    <Card className="p-4 bg-muted/20 border-dashed">
      <VariationHeader variation={variation} onUpdate={u => onChange(index, u)} onRemove={() => onRemove(index)} />
      <div className="space-y-4">
        <SizeGrid variation={variation} onUpdate={u => onChange(index, u)} />
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Images</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(variation.images || []).map((url, i) => (
              <div key={i} className="relative w-16 h-16 rounded border overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => onChange(index, { 
                    ...variation, 
                    images: variation.images?.filter((_, idx) => idx !== i) 
                  })} 
                  className="absolute top-0 right-0 bg-red-600 text-white p-0.5 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {(variation.pendingImages || []).map((img, i) => (
              <div key={`p-${i}`} className="relative w-16 h-16 rounded border overflow-hidden bg-dore/5 border-dore/30">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => onChange(index, { 
                    ...variation, 
                    pendingImages: variation.pendingImages?.filter((_, idx) => idx !== i) 
                  })} 
                  className="absolute top-0 right-0 bg-charbon text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-16 h-16 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </Card>
  )
}
