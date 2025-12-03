'use client'

import { Mail, HelpCircle, FileText, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PWAMenuPage() {
  const menuItems = [
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
              key={item.href}
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
                    `}>
                      <Icon className="w-6 h-6" />
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
      </div>
    </div>
  )
}

