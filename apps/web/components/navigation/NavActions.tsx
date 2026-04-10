'use client'

import { ShoppingBag, Heart, Search } from 'lucide-react'
import { Button } from '@maison/ui'
import { cn } from '@maison/shared'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useWishlistDrawer } from '@/lib/contexts/WishlistDrawerContext'

interface NavActionsProps { isHomePage: boolean; scrolled: boolean; cartCount: number; wishlistCount: number; onSearchClick: () => void }

export function NavActions({ isHomePage, scrolled, cartCount, wishlistCount, onSearchClick }: NavActionsProps) {
  const { openDrawer: openCartDrawer } = useCartDrawer()
  const { openDrawer: openWishlistDrawer } = useWishlistDrawer()

  interface ActionButtonProps {
    onClick: () => void
    icon: React.ComponentType<{ className?: string }>
    count: number
    sr: string
  }

  const ActionButton = ({ onClick, icon: Icon, count, sr }: ActionButtonProps) => (
    <Button variant="ghost" size="icon" onClick={onClick} className={cn("transition-colors relative", isHomePage && !scrolled && "text-[#f8f5f0] hover:text-[#d4a574] drop-shadow-md")}>
      <Icon className={cn("w-5 h-5", count > 0 && Icon === Heart && "fill-current")} />
      {count > 0 && <span className={cn("absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold", isHomePage && !scrolled ? "bg-[#d4a574] text-[#f8f5f0]" : "bg-dore text-charbon")}>{count > 99 ? '99+' : count}</span>}
      <span className="sr-only">{sr}</span>
    </Button>
  )

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onSearchClick} className={cn("transition-colors", isHomePage && !scrolled && "text-[#f8f5f0] hover:text-[#d4a574] drop-shadow-md")} aria-label="Rechercher"><Search className="w-5 h-5" /></Button>
      <div className="flex items-center gap-4">
        <ActionButton onClick={openWishlistDrawer} icon={Heart} count={wishlistCount} sr="Favoris" />
        <ActionButton onClick={openCartDrawer} icon={ShoppingBag} count={cartCount} sr="Panier" />
      </div>
    </div>
  )
}
