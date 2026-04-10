'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Facebook, Instagram } from 'lucide-react'

interface Socials {
  facebook?: string
  instagram?: string
}

export function MenuSocialLinks({ socials, index }: { socials: Socials; index: number }) {
  if (!socials.facebook && !socials.instagram) return null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="pt-4 border-t border-border">
      <h3 className="text-lg font-serif mb-4 text-foreground">Suivez-nous</h3>
      <div className="flex gap-4">
        {socials.facebook && (
          <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 text-blue-500 hover:scale-[1.02] transition-all">
            <Facebook className="w-5 h-5" />
            <span className="font-medium">Facebook</span>
          </a>
        )}
        {socials.instagram && (
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-pink-500 hover:scale-[1.02] transition-all">
            <Instagram className="w-5 h-5" />
            <span className="font-medium">Instagram</span>
          </a>
        )}
      </div>
    </motion.div>
  )
}
