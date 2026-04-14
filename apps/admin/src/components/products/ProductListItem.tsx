import { Product } from '@maison/domain'
import { Card, Button } from '@maison/ui'
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { StockStatus } from './StockStatus'

interface ProductListItemProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductListItem({ product, onEdit, onDelete }: ProductListItemProps) {
  const stockTotal = product.hasColors && product.colors && Array.isArray(product.colors)
    ? product.colors.reduce((sum, c) => sum + (c.stock || 0), 0)
    : product.stock || 0

  return (
    <Card className="p-4 relative group hover:shadow-md transition-shadow h-full flex flex-col justify-between">
      {product.featured && (
        <div className="absolute -top-2 -right-2 bg-dore text-charbon px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm z-10">
          Vedette
        </div>
      )}
      <div className="flex gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-dore font-medium uppercase tracking-wider mb-0.5">
              {product.category || 'Sans catégorie'}
            </p>
            <h3 className="font-medium mb-1 truncate text-base leading-tight">{product.name}</h3>
            <p className="text-sm text-primary font-serif font-medium mb-2">
              {product.price.toLocaleString('fr-MA')} DH
            </p>

            <div className="mb-3">
              <StockStatus stock={stockTotal} />
              {product.hasColors && product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {product.colors.slice(0, 3).map((c, idx) => (
                    <div key={idx} className="text-[10px] flex items-center gap-2">
                      <div className="flex items-center gap-1 w-12">
                        <div className="w-1.5 h-1.5 rounded-full border border-border" style={{ backgroundColor: c.code || '#000' }} />
                        <span className="truncate">{c.name}:</span>
                      </div>
                      <span className={(c.stock || 0) === 0 ? 'text-red-600 font-medium' : (c.stock || 0) <= 5 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                        {c.stock || 0}
                      </span>
                    </div>
                  ))}
                  {product.colors.length > 3 && (
                    <p className="text-[10px] text-muted-foreground italic">+{product.colors.length - 3} autres...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
