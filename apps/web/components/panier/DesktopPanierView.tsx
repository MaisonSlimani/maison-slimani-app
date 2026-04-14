'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { tracker } from '@/lib/mixpanel-tracker'
import { PanierEmpty } from './PanierEmpty'
import { PanierItem } from './PanierItem'
import { PanierSummary } from './PanierSummary'

export default function DesktopPanierView() {
  const { items, removeItem, updateQuantity, total, isLoaded } = useCart()

  useEffect(() => {
    if (isLoaded && items.length > 0) {
      tracker.trackCartViewed(items, total)
    }
  }, [isLoaded, items, total])

  if (!isLoaded) {
    return <div className="min-h-screen pt-40 pb-20 text-center text-xl font-serif">Chargement de votre panier...</div>
  }

  return (
    <div className="pb-24 pt-20">
      <div className="container px-6 py-8 mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-serif mb-12 flex items-center gap-4">
            <ShoppingBag className="w-10 h-10" /> Mon Panier
          </h1>

          {items.length === 0 ? <PanierEmpty /> : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                {items.map((item) => (
                  <PanierItem 
                    key={`${item.id}-${item.color || ''}-${item.size || ''}`} 
                    item={item} 
                    removeItem={removeItem} 
                    updateQuantity={updateQuantity} 
                  />
                ))}
              </div>
              <div className="lg:col-span-1">
                <PanierSummary total={total} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
