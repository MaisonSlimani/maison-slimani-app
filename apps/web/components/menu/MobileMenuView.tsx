'use client'

import React from 'react'
import { Mail, HelpCircle, FileText, Heart } from 'lucide-react'
import { MenuItemCard } from './MenuItemCard'
import { MenuSocialLinks } from './MenuSocialLinks'
import { WishlistItem } from '@/lib/hooks/useWishlist'

interface MenuData {
  socials: { facebook?: string; instagram?: string }
  wishlistItems: WishlistItem[]
  wishlistLoaded: boolean
}

export default function MobileMenuView({ data }: { data: MenuData }) {
  const { socials, wishlistItems, wishlistLoaded } = data

  const menuItems = [
    {
      href: '/favoris',
      icon: Heart,
      title: 'Mes Favoris',
      description: `${wishlistLoaded ? wishlistItems.length : '...'} article${wishlistItems.length > 1 ? 's' : ''} favoris`,
      gradient: 'from-pink-500/20 to-red-600/20',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-500',
      badge: wishlistLoaded ? wishlistItems.length : undefined,
    },
    { href: '/contact', icon: Mail, title: 'Contact', description: 'Contactez notre équipe', gradient: 'from-blue-500/20 to-blue-600/20', borderColor: 'border-blue-500/30', iconColor: 'text-blue-500' },
    { href: '/faq', icon: HelpCircle, title: 'FAQ', description: 'Questions fréquentes', gradient: 'from-dore/20 to-dore/30', borderColor: 'border-dore/30', iconColor: 'text-dore' },
    { href: '/politiques', icon: FileText, title: 'Politique de Retour', description: 'Conditions et procédures', gradient: 'from-purple-500/20 to-purple-600/20', borderColor: 'border-purple-500/30', iconColor: 'text-purple-500' }
  ]

  return (
    <div className="w-full min-h-screen pb-20 bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-2xl font-serif text-foreground">Menu</h1>
      </div>
      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {menuItems.map((item, index) => <MenuItemCard key={item.href} item={item} index={index} />)}
        <MenuSocialLinks socials={socials} index={menuItems.length} />
      </div>
    </div>
  )
}
