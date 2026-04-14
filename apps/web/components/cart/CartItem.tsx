'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@maison/ui'
import { Trash2, Plus, Minus, AlertTriangle } from 'lucide-react'
import { cn } from '@maison/shared'

import { CartItem as CartItemType } from '@maison/domain'

interface CartItemProps {
  item: CartItemType
  productUrl: string
  error?: string
  onQuantityChange: (item: CartItemType, qty: number) => void
  onRemove: (item: CartItemType) => void
  onClose: () => void
}

export const CartItem = ({
  item,
  productUrl,
  error,
  onQuantityChange,
  onRemove,
  onClose
}: CartItemProps) => {
  const imageUrl = item.image_url || item.image || '/placeholder.jpg'

  return (
    <div className={cn(
      "flex gap-4 p-4 border border-border rounded-lg hover:border-dore/50 transition-colors relative",
      error && "bg-red-50 dark:bg-red-950/20 border-red-200"
    )}>
      <Link
        href={productUrl}
        className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-muted"
        onClick={onClose}
      >
        <Image src={imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {error && (
            <div className="mb-2 flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <Link href={productUrl} onClick={onClose}>
            <h4 className="font-medium hover:text-dore transition-colors truncate">{item.name}</h4>
          </Link>
          <p className="text-sm text-muted-foreground">
            {item.color && <span>{item.color}</span>}
            {item.color && item.size && <span> • </span>}
            {item.size && <span>{item.size}</span>}
          </p>
          <p className="text-dore font-semibold mt-1">{item.price.toLocaleString('fr-MA')} DH</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(item, item.quantity - 1)}><Minus/></Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(item, item.quantity + 1)}><Plus/></Button>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 border-red-200" onClick={() => onRemove(item)}><Trash2/></Button>
        </div>
      </div>
    </div>
  )
}
