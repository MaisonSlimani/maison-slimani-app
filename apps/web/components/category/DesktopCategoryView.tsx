'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Search, ShoppingCart, ArrowUp } from 'lucide-react'
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@maison/ui'
import CarteProduit from '@/components/CarteProduit'
import ProductFilter from '@/components/filters/ProductFilter'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import { useCartDrawer } from '@/lib/contexts/CartDrawerContext'
import { useCart } from '@/lib/hooks/useCart'
import { CategoryViewData } from '@/types/views'
import { Product } from '@maison/domain'

export default function DesktopCategoryView({ data }: { data: CategoryViewData }) {
  const { categoryInfo, products, productsLoading } = data
  const { openDrawer } = useCartDrawer(); const { totalItems } = useCart()
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  React.useEffect(() => {
    const syncScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', syncScroll, { passive: true })
    return () => window.removeEventListener('scroll', syncScroll)
  }, [])

  if (!categoryInfo) return <CategorySkeleton />

  return (
    <div className="pb-0 pt-20">
      <CategoryBanner banner={categoryInfo} />
      <div className="container px-6 py-12 mx-auto">
        <ControlsSection data={data} total={totalItems} onOpenCart={openDrawer} />
        <ProduitGrid loading={productsLoading} list={products} />
      </div>
      {showScrollTop && <ScrollToTop />}
    </div>
  )
}

function CategoryBanner({ banner }: { banner: { image: string; name: string; description?: string | null } }) {
  return (
    <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
      <Image src={banner.image} alt={banner.name} fill className="object-cover" priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      <div className="relative z-10 text-center container px-6">
        <h1 className="text-7xl font-serif text-white mb-6 drop-shadow-2xl">{banner.name}</h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">{banner.description}</p>
      </div>
      <Link href="/boutique" className="absolute top-8 left-8 z-10">
        <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/20"><ArrowLeft className="w-4 h-4 mr-2" /> Retour boutique</Button>
      </Link>
    </section>
  )
}

function ControlsSection({ data, total, onOpenCart }: { data: CategoryViewData; total: number; onOpenCart: () => void }) {
  if (!data.categoryInfo) return null
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
      <div className="relative flex-1 w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder={`Rechercher...`} value={data.searchQuery} onChange={(e) => data.setSearchQuery(e.target.value)} className="pl-12 h-14 bg-secondary/20 border-0 text-lg rounded-xl" /></div>
      <div className="flex items-center gap-4">
        <Select value={data.triPrice} onValueChange={data.setTriPrice}><SelectTrigger className="h-14 w-[200px] rounded-xl"><SelectValue placeholder="Trier" /></SelectTrigger><SelectContent><SelectItem value="price-asc">Prix croissant</SelectItem><SelectItem value="price-desc">Prix décroissant</SelectItem></SelectContent></Select>
        <ProductFilter onFilterChange={data.setFilters} currentFilters={data.filters} categoryName={data.categoryInfo.name} />
        <Button onClick={onOpenCart} size="lg" variant="outline" className="h-14 w-14 p-0 rounded-xl relative"><ShoppingCart className="w-6 h-6" />{total > 0 && <span className="absolute -top-1 -right-1 bg-dore text-charbon text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">{total}</span>}</Button>
      </div>
    </div>
  )
}

function ProduitGrid({ loading, list }: { loading: boolean; list: Product[] }) {
  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-8"><ProductCardSkeleton count={6} /></div>
  if (list.length === 0) return <div className="py-32 text-center text-muted-foreground font-serif text-2xl">Aucun produit ne correspond à vos critères</div>
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">{list.map((p) => <CarteProduit key={p.id} product={p} showActions />)}</div>
}

function CategorySkeleton() {
  return (
    <div className="pt-20"><div className="h-[50vh] bg-muted animate-pulse" /><div className="container px-6 py-12 mx-auto"><div className="grid grid-cols-3 gap-8"><ProductCardSkeleton count={6} /></div></div></div>
  )
}

function ScrollToTop() {
  return (
    <Button size="icon" className="fixed bottom-10 right-10 z-50 rounded-full bg-charbon text-white h-14 w-14 shadow-2xl hover:scale-110 transition-all" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp className="w-6 h-6" /></Button>
  )
}
