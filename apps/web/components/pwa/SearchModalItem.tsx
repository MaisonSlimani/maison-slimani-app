'use client'

import Image from 'next/image'

interface SearchModalItemProps {
  product: { id: string; name: string; price: number; image_url?: string }
  onClick: () => void
}

export function SearchModalItem({ product, onClick }: SearchModalItemProps) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left">
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        <Image src={product.image_url || '/assets/placeholder.jpg'} alt={product.name} fill className="object-cover" sizes="64px" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-foreground line-clamp-2">{product.name}</h3>
        <p className="text-dore font-semibold text-sm mt-1">{product.price} MAD</p>
      </div>
    </button>
  )
}
