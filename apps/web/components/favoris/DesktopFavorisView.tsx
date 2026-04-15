'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { Button, Card } from '@maison/ui'
import OptimizedImage from '@/components/OptimizedImage'
import { FavorisViewData } from '@/types/views'
import { CartItem } from '@maison/domain'

export default function DesktopFavorisView({ data }: { data: FavorisViewData }) {
  const { items, removeItem, handleAddToCart, loadingProduct } = data

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <Header itemsCount={items.length} />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item: CartItem) => (
            <FavorisCard key={item.id} item={item} onRemove={removeItem} onAdd={handleAddToCart} loading={loadingProduct} />
          ))}
        </div>
      )}
      {items.length > 0 && <FooterCTA />}
    </div>
  )
}

function Header({ itemsCount }: { itemsCount: number }) {
  return (
    <div className="flex items-center justify-between mb-16">
      <div>
        <h1 className="text-6xl font-serif text-charbon mb-4 flex items-center gap-6"><Heart className="w-12 h-12 text-dore fill-dore" /> Mes <span className="text-dore">Favoris</span></h1>
        <p className="text-xl text-muted-foreground">Retrouvez les créations qui vous ont fait craquer.</p>
      </div>
      {itemsCount > 0 && <div className="text-2xl font-serif text-charbon/50 border-l border-charbon/10 pl-8">{itemsCount} Article{itemsCount > 1 ? 's' : ''}</div>}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="p-24 text-center bg-ecru/20 border-charbon/5 rounded-[3rem]">
      <Heart className="w-24 h-24 mx-auto text-charbon/10 mb-8" />
      <h2 className="text-3xl font-serif mb-6">Votre liste de favoris est vide</h2>
      <Button asChild size="lg" className="bg-charbon text-white rounded-2xl h-20 px-12 text-xl"><Link href="/boutique">Découvrir la collection</Link></Button>
    </Card>
  )
}

function FavorisCard({ item, onRemove, onAdd, loading }: { item: CartItem; onRemove: (id: string) => void; onAdd: (i: CartItem) => void; loading: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="group">
      <Card className="p-8 rounded-[2.5rem] border-charbon/5 hover:shadow-2xl transition-all h-full flex flex-col">
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-ecru">
          <OptimizedImage src={item.image_url || item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          <button onClick={() => onRemove(item.id)} className="absolute top-4 right-4 p-3 bg-white/90 rounded-xl text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"><Trash2 className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-2xl font-serif text-charbon mb-2 group-hover:text-dore transition-colors">{item.name}</h3>
          <p className="text-charbon/60 text-sm mb-6 uppercase tracking-widest">{item.category}</p>
          <div className="mt-auto flex items-center justify-between gap-6">
            <p className="text-3xl font-serif text-dore">{item.price.toLocaleString('fr-MA')} DH</p>
            <Button size="lg" className="rounded-2xl bg-charbon text-white hover:bg-dore hover:text-charbon h-16 w-16 p-0" onClick={() => onAdd(item)} disabled={loading}><ShoppingBag className="w-6 h-6" /></Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function FooterCTA() {
  return (
    <div className="mt-20 text-center">
      <Button asChild variant="outline" size="lg" className="h-20 rounded-2xl border-2 px-12 text-xl hover:border-dore hover:text-dore group">
        <Link href="/boutique" className="flex items-center gap-4">Continuer vers la Boutique <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></Link>
      </Button>
    </div>
  )
}
