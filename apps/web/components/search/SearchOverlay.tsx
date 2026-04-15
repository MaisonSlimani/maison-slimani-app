'use client'

import { Clock, TrendingUp, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchOverlay } from '@/hooks/use-search-overlay'
import { RecentSearch } from '@/hooks/use-recent-searches'
import { slugify } from '@/lib/utils/product-urls'
import { SearchHeader } from './SearchHeader'
import { SearchResultItem } from './SearchResultItem'

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  basePath?: string
}

export default function SearchOverlay({ isOpen, onClose, basePath = '' }: SearchOverlayProps) {
  const {
    searchQuery, setSearchQuery, debouncedQuery, inputRef,
    results, isLoading, recentSearches, clearAll, handleSearch
  } = useSearchOverlay(isOpen, onClose, basePath)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-0 inset-x-0 bg-background border-b shadow-xl max-h-[85vh] overflow-hidden flex flex-col z-[70]">
            <SearchHeader
              searchQuery={searchQuery} setSearchQuery={setSearchQuery} onClose={onClose}
              inputRef={inputRef} onSubmit={(e) => { e.preventDefault(); handleSearch() }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            />
            <div className="flex-1 overflow-y-auto p-4">
              {debouncedQuery.trim() ? (
                isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-dore" /></div> :
                  (results && results.length > 0) ? (
                    <div className="space-y-4">
                      <h3 className="text-xs font-medium uppercase text-muted-foreground">Produits</h3>
                      {results.map((p) => (
                        <SearchResultItem
                          key={p.id}
                          product={{ name: p.name, image_url: p.image_url, price: p.price }}
                          productHref={`${basePath}/boutique/${slugify(p.category || 'v')}/${p.slug}`}
                          isActive={false}
                          onClick={onClose}
                        />
                      ))}
                    </div>
                  ) : <div className="text-center py-12 text-muted-foreground">Aucun résultat</div>
              ) : (
                <SearchEmptyState recentSearches={recentSearches} setSearchQuery={setSearchQuery} onClear={clearAll} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SearchEmptyState({ recentSearches, setSearchQuery, onClear }: { recentSearches: RecentSearch[], setSearchQuery: (q: string) => void, onClear: () => void }) {
  return (
    <div className="space-y-6">
      {recentSearches.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Récent
            </h3>
            <button onClick={onClear} className="text-xs text-muted-foreground">Effacer</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(s => (
              <button key={s.query} onClick={() => setSearchQuery(s.query)} className="px-3 py-1 bg-muted rounded-full text-sm">
                {s.query}
              </button>
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" /> Populaire
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Mocassins', 'Luxe', 'Cuir', 'Nouveautés'].map(s => (
            <button key={s} onClick={() => setSearchQuery(s)} className="px-3 py-1 bg-muted rounded-full text-sm">
              {s}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
