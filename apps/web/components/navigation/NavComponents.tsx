'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@maison/shared'

export function NavLogo({ isHomePage, scrolled }: { isHomePage: boolean; scrolled: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image src="/assets/logos/logo_nobg.png" alt="Maison Slimani" fill className="object-contain" sizes="40px" priority unoptimized />
      </div>
      <h1 className={cn("text-2xl font-serif tracking-tight transition-colors", isHomePage && !scrolled ? "text-[#f8f5f0] drop-shadow-lg" : "text-foreground")}>
        Maison <span className="text-[#d4a574]">Slimani</span>
      </h1>
    </Link>
  )
}

export function NavItems({ pathname, isHomePage, scrolled }: { pathname: string; isHomePage: boolean; scrolled: boolean }) {
  const items = [{ href: '/', label: 'Accueil' }, { href: '/boutique', label: 'Boutique' }, { href: '/maison', label: 'La Maison' }, { href: '/contact', label: 'Contact' }]
  return (
    <div className="flex items-center gap-8">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} className={cn('relative text-sm font-medium transition-all duration-300 group px-2 py-1', isHomePage && !scrolled ? (isActive ? 'text-[#f8f5f0] drop-shadow-md' : 'text-[#f8f5f0]/90 hover:text-[#f8f5f0] drop-shadow-md') : (isActive ? 'text-charbon font-semibold' : 'text-charbon/90 hover:text-charbon'))}>
            {item.label}
            <span className={cn("absolute -bottom-1 left-2 right-2 h-0.5 bg-[#d4a574] transition-all duration-300", isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
          </Link>
        )
      })}
    </div>
  )
}
