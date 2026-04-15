'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag, LucideIcon } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import SearchOverlay from '@/components/search/SearchOverlay'
import { hapticFeedback } from '@/lib/haptics'
import { cn } from '@maison/shared'

export default function HeaderMobile() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const { openDrawer } = useCartDrawer()

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-area-top w-full">
        <div className="h-16 px-4 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0"
            onClick={() => hapticFeedback('light')}
          >
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/assets/logos/logo_nobg.png"
                alt="Maison Slimani"
                fill
                className="object-contain"
                sizes="36px"
                priority
                unoptimized
              />
            </div>
            <h1 className="text-xl font-serif tracking-tight">
              Maison <span className="text-dore">Slimani</span>
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <HeaderIconButton 
              icon={Search} 
              onClick={() => { hapticFeedback('light'); setIsSearchOpen(true); }}
              label="Rechercher"
            />
            
            <HeaderIconButton 
              icon={ShoppingBag} 
              onClick={() => { hapticFeedback('light'); openDrawer(); }}
              label="Panier"
              badgeCount={totalItems}
            />
          </div>
        </div>
      </header>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        basePath=""
      />
    </>
  )
}

function HeaderIconButton({ 
    icon: Icon, 
    onClick, 
    label, 
    badgeCount = 0,
    active = false 
}: { 
    icon: LucideIcon, 
    onClick?: () => void, 
    label: string, 
    badgeCount?: number,
    active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
      aria-label={label}
    >
      <Icon className={cn("w-5 h-5", active && "fill-dore text-dore", !active && "text-foreground")} />
      {badgeCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-dore rounded-full">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  )
}
