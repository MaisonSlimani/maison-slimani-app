'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export const PolicySection = ({ icon: Icon, title, children, delay }: { icon: LucideIcon; title: string; children: ReactNode; delay: number }) => (
  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} className="bg-card border border-border rounded-lg p-6">
    <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
      <Icon className="w-6 h-6 text-dore" />
      {title}
    </h2>
    <div className="text-muted-foreground leading-relaxed">{children}</div>
  </motion.section>
)
