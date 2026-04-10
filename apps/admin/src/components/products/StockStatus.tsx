import { Package, AlertTriangle } from 'lucide-react'

interface StockStatusProps {
  stock: number
}

export function StockStatus({ stock }: StockStatusProps) {
  const isLowStock = stock > 0 && stock <= 5
  const isOutOfStock = stock === 0
  const colorClass = isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'

  return (
    <div className="flex items-center gap-2 mb-1.5">
      <Package className={`w-4 h-4 ${colorClass}`} />
      <span className={`text-sm font-medium ${colorClass}`}>
        Stock: {stock}
      </span>
      {isOutOfStock && (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full shrink-0">Rupture</span>
      )}
      {isLowStock && (
        <span className="px-2 py-0.5 text-[10px] font-medium bg-orange-100 text-orange-700 rounded-full flex items-center gap-1 shrink-0">
          <AlertTriangle className="w-3 h-3" /> Faible
        </span>
      )}
    </div>
  )
}
