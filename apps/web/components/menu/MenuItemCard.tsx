'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'

interface MenuItemCardProps {
  item: {
    href: string
    icon: LucideIcon
    title: string
    description: string
    gradient: string
    borderColor: string
    iconColor: string
    badge?: number
  }
  index: number
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  const Icon = item.icon
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
      <Link href={item.href} className="block group">
        <div className={`bg-gradient-to-br ${item.gradient} border ${item.borderColor} rounded-xl p-6 shadow-lg group-hover:shadow-xl group-hover:scale-[1.02] transition-all`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-background/50 backdrop-blur-sm ${item.iconColor} relative`}>
              <Icon className="w-6 h-6" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium text-white bg-pink-500 rounded-full">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif mb-1 text-foreground group-hover:text-dore transition-colors">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-dore transition-colors rotate-180" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
