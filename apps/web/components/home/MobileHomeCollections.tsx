'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { hapticFeedback } from '@/lib/haptics'

export function MobileHomeCollections({ categories }: { categories: { lien: string; image: string; titre: string; id?: string }[] }) {
  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center mb-8">Collections</h2>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat, i: number) => (
          <motion.div key={cat.lien || cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link href={cat.lien} className="block group" onClick={() => hapticFeedback('light')}>
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                <Image src={cat.image} alt={cat.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="font-serif text-center text-sm">{cat.titre}</h3>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
