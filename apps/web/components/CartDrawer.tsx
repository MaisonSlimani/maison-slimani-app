'use client'

import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@maison/ui'
import { Button } from '@maison/ui'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { CartItem } from './cart/CartItem'
import { CartEmptyState } from './cart/CartEmptyState'
import { useCartStockValidation } from '@/lib/hooks/useCartStockValidation'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()
  const stockErrors = useCartStockValidation(items, open)

  const handleCheckout = () => {
    onOpenChange(false)
    router.push('/checkout')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85vw] sm:w-[500px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-serif flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Mon Panier
          </SheetTitle>
          <SheetDescription>{items.length} articles</SheetDescription>
        </SheetHeader>

        {!isLoaded ? (
          <div className="flex-1 flex items-center justify-center">Chargement...</div>
        ) : items.length === 0 ? (
          <CartEmptyState onClose={() => onOpenChange(false)} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => {
                const key = `${item.id}-${item.couleur || ''}-${item.taille || ''}`
                return (
                  <CartItem 
                    key={key} item={item} error={stockErrors[key]}
                    productUrl={`/boutique/${item.categorySlug || 'cat'}/${item.slug || 'slug'}`}
                    onQuantityChange={(i, q) => updateQuantity(i.id, q, i.couleur, i.taille)}
                    onRemove={(i) => removeItem(i.id, i.couleur, i.taille)}
                    onClose={() => onOpenChange(false)}
                  />
                )
              })}
            </div>

            <div className="border-t p-6 space-y-4 bg-background">
              <div className="flex justify-between text-lg font-medium">
                <span>Total</span>
                <span className="text-dore font-serif text-2xl">{total.toLocaleString('fr-MA')} DH</span>
              </div>
              <Button onClick={handleCheckout} className="w-full bg-dore text-charbon h-12 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" /> Passer commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
