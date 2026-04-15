'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { Button, Card } from '@maison/ui'
import { CartItem } from '@maison/domain'
import { toast } from 'sonner'

interface MobilePanierItemProps {
  item: CartItem
  removeItem: (id: string, color?: string | null, size?: string | null) => void
  updateQuantity: (id: string, qty: number, color?: string | null, size?: string | null) => void
}

export function MobilePanierItem({ item, removeItem, updateQuantity }: MobilePanierItemProps) {
  const itemSlug = item.slug || item.id
  const catSlug = item.category || 'tous'
  const href = `/boutique/${catSlug}/${itemSlug}`

  const handleQtyUpdate = (newQty: number) => {
    try {
      updateQuantity(item.id, newQty, item.color, item.size)
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message)
    }
  }

  return (
    <Card className="p-4 overflow-hidden border-border/50">
      <div className="flex gap-4">
        <Link href={href} className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
          <Image src={item.image_url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="96px" />
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
          <div className="text-[10px] space-y-0.5 mb-2 text-muted-foreground/80 uppercase tracking-wider">
            {item.color && <p>Couleur: <span className="font-semibold">{item.color}</span></p>}
            {item.size && <p>Taille: <span className="font-semibold">{item.size}</span></p>}
          </div>
          <p className="font-serif text-dore font-bold text-base mb-3">{item.price.toLocaleString('fr-MA')} MAD</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button variant="ghost" size="icon" onClick={() => handleQtyUpdate(item.quantity - 1)} className="h-7 w-7 rounded-md"><Minus className="w-3 h-3" /></Button>
              <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => handleQtyUpdate(item.quantity + 1)} className="h-7 w-7 rounded-md"><Plus className="w-3 h-3" /></Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id, item.color, item.size)} className="h-8 w-8 text-destructive/70"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
