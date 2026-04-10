'use client'

import { cn } from '@maison/shared'
import SearchOverlay from '@/components/search/SearchOverlay'
import { useNavigationState } from '@/hooks/useNavigationState'
import { NavLogo, NavItems } from './navigation/NavComponents'
import { NavActions } from './navigation/NavActions'

const NavigationDesktop = () => {
  const { pathname, scrolled, isSearchOpen, setIsSearchOpen, cartCount, wishlistCount, isHomePage } = useNavigationState()

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:block',
      (isHomePage ? scrolled : true) ? 'bg-background/98 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
    )}>
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <NavLogo isHomePage={isHomePage} scrolled={scrolled} />
        <NavItems pathname={pathname} isHomePage={isHomePage} scrolled={scrolled} />
        <NavActions isHomePage={isHomePage} scrolled={scrolled} cartCount={cartCount} wishlistCount={wishlistCount} onSearchClick={() => setIsSearchOpen(true)} />
      </nav>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} basePath="" />
    </header>
  )
}

export default NavigationDesktop
