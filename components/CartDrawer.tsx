'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()
  
  const isPWA = pathname?.startsWith('/pwa') || false

  const handleCheckout = () => {
    onOpenChange(false)
    router.push(isPWA ? '/pwa/checkout' : '/checkout')
  }

  const handleQuantityChange = (item: typeof items[0], newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        removeItem(item.id, item.couleur, item.taille)
        toast.success('Article retiré du panier')
      } else {
        updateQuantity(item.id, newQuantity, item.couleur, item.taille)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-2xl font-serif flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Mon Panier
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? 'Votre panier est vide' 
              : `${items.length} article${items.length > 1 ? 's' : ''} dans votre panier`
            }
          </SheetDescription>
        </SheetHeader>

        {!isLoaded ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dore mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-serif mb-2">Votre panier est vide</h3>
            <p className="text-muted-foreground text-center mb-6">
              Découvrez notre collection de chaussures haut de gamme
            </p>
            <Button asChild onClick={() => onOpenChange(false)}>
              <Link href={isPWA ? '/pwa/boutique' : '/boutique'}>
                Voir la collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const imageUrl = item.image_url || item.image || '/placeholder.jpg'
                  return (
                    <div key={`${item.id}-${item.couleur || ''}-${item.taille || ''}`} className="flex gap-4 pb-4 border-b last:border-0">
                      <Link
                        href={`${isPWA ? '/pwa' : ''}/produit/${item.id}`}
                        className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity bg-muted"
                        onClick={() => onOpenChange(false)}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.nom}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`${isPWA ? '/pwa' : ''}/produit/${item.id}`}
                          onClick={() => onOpenChange(false)}
                          className="block"
                        >
                          <h4 className="font-medium mb-1 hover:text-dore transition-colors line-clamp-2">
                            {item.nom}
                          </h4>
                        </Link>
                        {(item.couleur || item.taille) && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.couleur && <span>Couleur: {item.couleur}</span>}
                            {item.couleur && item.taille && <span> • </span>}
                            {item.taille && <span>Taille: {item.taille}</span>}
                          </p>
                        )}
                        <p className="text-lg font-serif text-dore mb-3">
                          {item.prix.toLocaleString('fr-MA')} DH
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item, item.quantite - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantite}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const maxStock = item.stock || 999
                                if (item.quantite < maxStock) {
                                  handleQuantityChange(item, item.quantite + 1)
                                } else {
                                  toast.error(`Stock maximum: ${maxStock}`)
                                }
                              }}
                              disabled={item.stock !== undefined && item.quantite >= item.stock}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              removeItem(item.id, item.couleur, item.taille)
                              toast.success('Article retiré du panier')
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="border-t bg-background px-6 py-4 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-medium">Total</span>
                <span className="font-serif text-2xl text-dore">
                  {total.toLocaleString('fr-MA')} DH
                </span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full bg-dore text-charbon hover:bg-dore/90 h-12 text-base font-medium"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Passer la commande
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link href={isPWA ? '/pwa/panier' : '/panier'}>
                  Voir le panier complet
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

