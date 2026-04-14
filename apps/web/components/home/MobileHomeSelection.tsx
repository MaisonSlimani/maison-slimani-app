'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import ProductCard from '@/components/pwa/ProductCard'
import { Product } from '@maison/domain'

export function MobileHomeSelection({ products }: { products: Product[] }) {
  return (
    <section className="py-12 px-4">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-serif">Sélection</h2>
        <Link href="/boutique" className="text-dore text-sm font-medium">Voir tout {" >"}</Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.slice(0, 4).map((p, i: number) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
