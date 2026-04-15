'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import CategoryCardSkeleton from '@/components/skeletons/CategoryCardSkeleton'
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton'
import Link from 'next/link'
import ProductCard from '@/components/pwa/ProductCard'
import CarteCategorie from '@/components/CarteCategorie'
import { Button } from '@maison/ui'
import { ArrowUp } from 'lucide-react'
import SearchOverlay from '@/components/search/SearchOverlay'
import { useBoutiqueData } from '@/hooks/useBoutiqueData'
import { useBoutiqueUI } from '@/hooks/useBoutiqueUI'
import { BoutiqueHeader } from './BoutiqueHeader'
import { Category } from '@maison/domain'
import { BoutiqueViewData } from '@/types/views'

export interface MobileBoutiqueViewProps { 
  initialCategorie?: string; 
  initialSearch?: string;
  initialCategories?: Category[];
}

export default function MobileBoutiqueView({ 
  initialCategorie = 'tous', 
  initialSearch = '',
  initialCategories
}: MobileBoutiqueViewProps) {
  const searchParams = useSearchParams(); const router = useRouter()
  const categorySlug = searchParams.get('categorie') || initialCategorie
  const search = searchParams.get('search') || initialSearch
  const { showScrollTop, searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen, scrollToTop, clearSearch } = useBoutiqueUI(search)
  
  const { products, loadingProducts, categories, categoriesWithImages, loadingCategories }: BoutiqueViewData = useBoutiqueData(categorySlug, search, initialCategories)
  
  const showCategoriesView = categorySlug === 'tous' && !search

  return (
    <div className="w-full min-h-screen pb-20 bg-background">
      <BoutiqueHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        onFocus={() => setIsSearchOverlayOpen(true)} 
        category={categorySlug} 
        categories={categories} 
        router={router} 
      />
      <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} basePath="/boutique" />
      
      {showCategoriesView ? (
        <div className="px-4 py-8">
          {loadingCategories ? <CategoryCardSkeleton count={4} /> : (
            <div className="space-y-6">
              <div className="text-center mb-10"><h1 className="text-3xl font-serif mb-3">Nos Collections</h1><p className="text-sm text-muted-foreground">L'excellence du cuir marocain</p></div>
              <div className="grid gap-6">
                {categoriesWithImages.map((cat, idx) => (
                  <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <CarteCategorie {...cat} priority={idx < 2} />
                  </motion.div>
                ))}
              </div>
              <div className="text-center pt-8 border-t border-border/50">
                <h2 className="text-xl font-serif mb-4">Voir tous nos produits</h2>
                <Button asChild className="bg-dore text-charbon hover:bg-dore/90 px-8">
                  <Link href="/boutique/tous">Découvrir la collection</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-6">
          {loadingProducts ? <div className="grid grid-cols-2 gap-4"><ProductCardSkeleton count={6} /></div> : products.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground mb-4">Aucun produit trouvé</p>{search && <Button variant="outline" onClick={clearSearch}>Effacer la recherche</Button>}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((p, idx) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <ProductCard product={p} priority={idx === 0} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {showScrollTop && <Button size="icon" className="fixed bottom-24 right-4 z-50 rounded-full bg-dore text-charbon" onClick={scrollToTop}><ArrowUp className="h-4 w-4" /></Button>}
    </div>
  )
}
