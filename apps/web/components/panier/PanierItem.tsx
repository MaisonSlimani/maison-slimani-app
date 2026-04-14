'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus } from 'lucide-react'
import { Button, Card } from '@maison/ui'
import { tracker } from '@/lib/mixpanel-tracker'
import { CartItem } from '@maison/domain'
import { toast } from 'sonner'

interface PanierItemProps {
  item: CartItem
  removeItem: (id: string, color?: string | null, size?: string | null) => void
  updateQuantity: (id: string, qty: number, color?: string | null, size?: string | null) => void
}

export function PanierItem({ item, removeItem, updateQuantity }: PanierItemProps) {
  const itemSlug = item.slug || item.id
  const catSlug = item.category || 'tous'
  const href = `/boutique/${catSlug}/${itemSlug}`

  const handleQtyUpdate = (newQty: number) => {
    try {
      const oldVal = item.quantity
      updateQuantity(item.id, newQty, item.color, item.size)
      tracker.trackCartQuantityUpdated({ id: item.id, name: item.name }, oldVal, newQty)
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message)
    }
  }

  return (
    <Card className="p-6 transition-all hover:shadow-md">
      <div className="flex gap-8">
        <Link href={href} className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90">
          <Image src={item.image_url || '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="128px" />
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <Link href={href}>
              <h3 className="text-xl font-medium hover:text-dore">{item.name}</h3>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => { tracker.trackRemoveFromCart({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }); removeItem(item.id, item.color, item.size); }} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mb-4 flex gap-4">
            {item.color && <p>Couleur: <span className="font-semibold text-foreground">{item.color}</span></p>}
            {item.size && <p>Taille: <span className="font-semibold text-foreground">{item.size}</span></p>}
          </div>
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-4 bg-muted/30 rounded-full p-1 px-2 border border-border/50">
              <Button variant="ghost" size="icon" onClick={() => handleQtyUpdate(item.quantity - 1)} className="h-8 w-8 rounded-full"><Minus className="w-4 h-4" /></Button>
              <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => handleQtyUpdate(item.quantity + 1)} className="h-8 w-8 rounded-full"><Plus className="w-4 h-4" /></Button>
            </div>
            <p className="text-2xl font-serif text-charbon font-bold">{item.price.toLocaleString('fr-MA')} MAD</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
