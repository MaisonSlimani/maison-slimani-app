'use client'

import { Mail, HelpCircle, FileText, ArrowLeft, Facebook, Instagram, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useWishlist } from '@/lib/hooks/useWishlist'

export default function PWAMenuPage() {
  const [socials, setSocials] = useState<{ facebook?: string; instagram?: string }>({})
  const { items: wishlistItems, isLoaded: wishlistLoaded } = useWishlist()

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSocials({
              facebook: result.data.facebook,
              instagram: result.data.instagram,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching socials:', error)
      }
    }
    fetchSocials()
  }, [])

  const menuItems = [
    {
      href: '/pwa/favoris',
      icon: Heart,
      title: 'Mes Favoris',
      description: `${wishlistLoaded ? wishlistItems.length : '...'} article${wishlistItems.length > 1 ? 's' : ''} dans vos favoris`,
      gradient: 'from-pink-500/20 to-red-600/20',
      borderColor: 'border-pink-500/30',
      iconColor: 'text-pink-500',
      badge: wishlistLoaded ? wishlistItems.length : undefined,
    },
    {
      href: '/contact',
      icon: Mail,
      title: 'Contact',
      description: 'Contactez notre équipe',
      gradient: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-500'
    },
    {
      href: '/faq',
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Questions fréquentes',
      gradient: 'from-dore/20 to-dore/30',
      borderColor: 'border-dore/30',
      iconColor: 'text-dore'
    },
    {
      href: '/politiques',
      icon: FileText,
      title: 'Politique de Retour',
      description: 'Conditions et procédures',
      gradient: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-500'
    }
  ]

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-2xl font-serif text-foreground">Menu</h1>
      </div>

      <div className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          
          return (
            <motion.div
              key={item.href || item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className="block group"
              >
                <div className={`
                  bg-gradient-to-br ${item.gradient}
                  border ${item.borderColor}
                  rounded-xl p-6
                  transition-all duration-300
                  group-hover:scale-[1.02]
                  group-active:scale-[0.98]
                  shadow-lg group-hover:shadow-xl
                `}>
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-lg
                      bg-background/50
                      backdrop-blur-sm
                      ${item.iconColor}
                      relative
                    `}>
                      <Icon className="w-6 h-6" />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-pink-500 rounded-full">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-serif mb-1 text-foreground group-hover:text-dore transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-dore transition-colors rotate-180" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {/* Social Links */}
        {(socials.facebook || socials.instagram) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: menuItems.length * 0.1 }}
            className="pt-4 border-t border-border"
          >
            <h3 className="text-lg font-serif mb-4 text-foreground">Suivez-nous</h3>
            <div className="flex gap-4">
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-500 hover:scale-[1.02] transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-500 hover:scale-[1.02] transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="font-medium">Instagram</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

