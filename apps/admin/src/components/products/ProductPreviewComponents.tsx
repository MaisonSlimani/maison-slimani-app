import { cn } from '@maison/shared'
import { Button } from '@maison/ui'

interface GalleryProps {
  images: string[]
  selectedIndex: number
  onSelect: (i: number) => void
  showStars?: boolean
}

export function ProductPreviewGallery({ images, selectedIndex, onSelect, showStars }: GalleryProps) {
  const display = images[selectedIndex] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='
  return (
    <div className="relative">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border">
        <img src={display} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
        {showStars && <div className="absolute top-4 right-4 bg-dore text-charbon px-4 py-2 rounded-full font-serif font-semibold text-xs shadow-lg">⭐ En vedette</div>}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => onSelect(idx)} className={cn("relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0", selectedIndex === idx ? "border-dore shadow-md" : "border-border")}>
              <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface InfoProps {
  formData: { nom: string; description: string; prix: string; has_colors: boolean }
  couleurs: Array<{ nom: string; code: string; stock: number }>
  selectedColor: string
  onColorSelect: (c: string) => void
  stock: number
}

export function ProductPreviewInfo({ formData, couleurs, selectedColor, onColorSelect, stock }: InfoProps) {
  const prix = parseFloat(formData.prix) || 0
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-serif mb-2">{formData.nom || 'Produit'}</h1><p className="text-2xl font-bold text-dore">{prix.toFixed(2)} DH</p></div>
      {formData.has_colors && !!couleurs.length && (
        <div><h3 className="text-xs font-semibold mb-3 uppercase tracking-wider">Couleurs</h3>
          <div className="flex gap-2 flex-wrap">{couleurs.map(c => (
            <button key={c.nom} onClick={() => onColorSelect(c.nom)} style={{ backgroundColor: c.code }} className={cn("w-10 h-10 rounded-lg border-2", selectedColor === c.nom ? "border-charbon ring-1 ring-charbon ring-offset-2" : "border-gray-200")} title={c.nom} />
          ))}</div>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">{stock > 0 ? <><div className="w-2 h-2 bg-green-500 rounded-full" /><span>En stock ({stock})</span></> : <><div className="w-2 h-2 bg-red-500 rounded-full" /><span>Rupture de stock</span></>}</div>
      {formData.description && <div className="prose prose-sm max-w-none border-t pt-4"><div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: formData.description }} /></div>}
      <Button disabled={stock === 0} className={cn("w-full h-12 shadow-sm", stock > 0 ? "bg-dore text-charbon hover:bg-dore/90" : "bg-muted")}>{stock > 0 ? 'Ajouter au panier' : 'Rupture'}</Button>
    </div>
  )
}
