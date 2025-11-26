'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import SearchModal from './SearchModal'
import { cn } from '@/lib/utils'

export default function StickyHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { openDrawer } = useCartDrawer()

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-top w-full max-w-full">
        <div className="h-14 px-4 flex items-center justify-between gap-3 w-full max-w-full">
          {/* Logo */}
          <Link href="/pwa" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/assets/logos/logo_nobg.png"
                alt="Maison Slimani"
                fill
                className="object-contain"
                sizes="32px"
                priority
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.parentElement) {
                    target.parentElement.style.display = 'none'
                  }
                }}
              />
            </div>
            <h1 className="text-lg font-serif tracking-tight whitespace-nowrap">
              Maison <span className="text-dore">Slimani</span>
            </h1>
          </Link>

          {/* Search, Wishlist and Cart */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>

            {/* Wishlist Button */}
            <Link
              href="/pwa/favoris"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Favoris"
            >
              <Heart className={cn("w-5 h-5", wishlistItems.length > 0 && "fill-current text-dore")} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-dore rounded-full">
                  {wishlistItems.length > 99 ? '99+' : wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-dore rounded-full">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

