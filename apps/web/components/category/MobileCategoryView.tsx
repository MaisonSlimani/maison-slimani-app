'use client'

import React from 'react'
import Image from 'next/image'
import { Search, ShoppingCart, ArrowUp } from 'lucide-react'
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@maison/ui'
import ProductCard from '@/components/pwa/ProductCard'
import ProductFilter from '@/components/filters/ProductFilter'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useCart } from '@/lib/hooks/useCart'
import { CategoryViewData } from '@/types/views'
import { Product } from '@maison/domain'

export default function MobileCategoryView({ data }: { data: CategoryViewData }) {
  const { categoryInfo, loadingCategory, products, productsLoading } = data
  const { openDrawer } = useCartDrawer(); const { totalItems } = useCart()
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', sync); return () => window.removeEventListener('scroll', sync)
  }, [])

  if (loadingCategory || !categoryInfo) return <MobileSkeleton />

  return (
    <div className="w-full min-h-screen pb-20 bg-ecru/30">
      <Hero banner={categoryInfo} />
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 space-y-3">
        <SearchBar query={data.searchQuery} setQuery={data.setSearchQuery} total={totalItems} onOpen={openDrawer} />
        <Filters data={data} categoryName={categoryInfo.name} />
      </div>
      <div className="px-4 py-6">
        {productsLoading ? <div className="grid grid-cols-2 gap-4 max-w-md mx-auto"><ProductCardSkeleton count={6} /></div> : 
         products.length === 0 ? <div className="py-20 text-center text-muted-foreground font-serif">Aucun produit trouvé</div> :
         <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">{products.map((p: Product) => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
      {showScrollTop && <Button size="icon" className="fixed bottom-24 right-4 z-50 rounded-full bg-dore shadow-xl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp className="w-4 h-4" /></Button>}
    </div>
  )
}

function Hero({ banner }: { banner: { image: string; name: string } }) {
  return (
    <div className="relative h-56">
      <Image src={banner.image} alt={banner.name} fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6"><h1 className="text-4xl font-serif text-white">{banner.name}</h1></div>
    </div>
  )
}

function SearchBar({ query, setQuery, total, onOpen }: { query: string; setQuery: (q: string) => void; total: number; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="search" placeholder="Rechercher..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 h-10 bg-muted border-0 rounded-lg text-sm" /></div>
      <button onClick={onOpen} className="relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><ShoppingCart className="w-5 h-5" />{total > 0 && <span className="absolute -top-1 -right-1 bg-dore text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-background">{total}</span>}</button>
    </div>
  )
}

function Filters({ data, categoryName }: { data: CategoryViewData; categoryName: string }) {
  return (
    <div className="flex gap-2">
      <Select value={data.triPrice} onValueChange={data.setTriPrice}><SelectTrigger className="h-9 text-xs w-[140px] bg-muted border-0"><SelectValue placeholder="Trier" /></SelectTrigger><SelectContent><SelectItem value="price-asc">Prix croissant</SelectItem><SelectItem value="price-desc">Prix décroissant</SelectItem></SelectContent></Select>
      <ProductFilter onFilterChange={data.setFilters} currentFilters={data.filters} categoryName={categoryName} />
    </div>
  )
}

function MobileSkeleton() {
  return <div className="px-4 py-8 max-w-md mx-auto"><div className="h-48 bg-muted animate-pulse rounded-xl mb-6" /><div className="grid grid-cols-2 gap-4"><ProductCardSkeleton count={4} /></div></div>
}
