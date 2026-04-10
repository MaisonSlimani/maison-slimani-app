'use client'

import { ShoppingCart, Search } from 'lucide-react'
import { Button, Input } from '@maison/ui'
import { cn } from '@maison/shared'
import { useCart } from '@/lib/hooks/useCart'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { BoutiqueHeaderProps } from '@/types/views'

export function BoutiqueHeader({ searchQuery, setSearchQuery, onFocus, categorie, categories, router }: BoutiqueHeaderProps) {
  const { items, isLoaded } = useCart()
  const { openDrawer } = useCartDrawer()
  const totalItems = isLoaded ? items.length : 0

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
      <div className="h-14 px-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input type="search" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={onFocus} className="pl-10 h-10 bg-muted border-0" />
        </div>
        <Button variant="ghost" size="icon" onClick={openDrawer} className="relative w-10 h-10 bg-muted rounded-lg">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-dore rounded-full">{totalItems > 99 ? '99+' : totalItems}</span>}
        </Button>
      </div>
      {(categorie !== 'tous' || searchQuery) && !!categories.length && (
        <div className="px-4 py-2 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => router.push('/boutique?categorie=tous')} className={cn("flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap", categorie === 'tous' ? "bg-dore text-charbon" : "bg-muted text-muted-foreground")}>Tous</button>
            {categories.map((cat: { nom: string; slug: string }) => (
              <button key={cat.slug} onClick={() => router.push(`/boutique?categorie=${cat.slug}`)} className={cn("flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap", categorie === cat.slug ? "bg-dore text-charbon" : "bg-muted text-muted-foreground")}>{cat.nom}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
