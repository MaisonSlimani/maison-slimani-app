'use client'

import { Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchModal, type SearchProduct } from '@/hooks/useSearchModal'
import { SearchModalItem } from './SearchModalItem'
import { SearchModalSuggestions } from './SearchModalSuggestions'

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const s = useSearchModal(isOpen, onClose)
  const showResults = s.debouncedQuery.trim().length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
            <div className="px-4 py-3">
              <form onSubmit={s.handleSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input ref={s.inputRef} type="text" value={s.searchQuery} onChange={(e) => s.setSearchQuery(e.target.value)} placeholder="Rechercher..." className="w-full h-12 pl-10 pr-4 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-dore" />
                  {s.isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />}
                </div>
                <button type="button" onClick={onClose} className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted" aria-label="Fermer"><X className="w-5 h-5 text-foreground" /></button>
              </form>

              {showResults && (
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  {s.isSearching && !s.hasResults ? <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" /><span>Recherche...</span></div> :
                    s.hasResults ? <div className="space-y-2">
                      {s.products.map((p: SearchProduct) => (
                        <SearchModalItem 
                          key={p.id} 
                          product={{ id: p.id, name: p.name, price: p.price, image_url: p.image_url }} 
                          onClick={() => s.handleProductClick(p)} 
                        />
                      ))}
                      {s.products.length >= 10 && <Link href={`/pwa/boutique?search=${encodeURIComponent(s.debouncedQuery)}`} onClick={onClose} className="block w-full text-center py-3 text-dore font-medium">Voir tous</Link>}
                    </div> : <div className="flex flex-col items-center justify-center py-8 text-muted-foreground"><Search className="w-12 h-12 mb-3 opacity-50" /><p className="text-sm">Aucun résultat</p></div>}
                </div>
              )}
              {!showResults && <SearchModalSuggestions onSelect={(v) => { s.setSearchQuery(v); s.setDebouncedQuery(v) }} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
