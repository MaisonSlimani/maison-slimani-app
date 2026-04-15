'use client'

import { useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { MobilePanierEmpty } from './MobilePanierEmpty'
import { MobilePanierItem } from './MobilePanierItem'
import { MobilePanierSummary } from './MobilePanierSummary'

export default function MobilePanierView() {
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen pb-20 px-4 py-8">
        <div className="text-center py-12 text-muted-foreground font-serif">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="h-14 px-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h1 className="text-xl font-serif">Mon Panier</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {items.length === 0 ? <MobilePanierEmpty /> : (
          <div className="space-y-4 max-w-md mx-auto">
            {items.map((item) => (
              <MobilePanierItem 
                key={`${item.id}-${item.color || ''}-${item.size || ''}`} 
                item={item} 
                removeItem={removeItem} 
                updateQuantity={updateQuantity} 
              />
            ))}
            <MobilePanierSummary total={total} />
          </div>
        )}
      </div>
    </div>
  )
}
