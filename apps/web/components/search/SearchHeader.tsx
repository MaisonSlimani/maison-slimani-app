'use client'

import React from 'react'
import { Search, X } from 'lucide-react'

interface SearchHeaderProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  onClose: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onSubmit: (e: React.FormEvent) => void
}

export const SearchHeader = ({
  searchQuery,
  setSearchQuery,
  onClose,
  onKeyDown,
  inputRef,
  onSubmit
}: SearchHeaderProps) => {
  return (
    <div className="p-4 border-b border-border space-y-3">
      <form onSubmit={onSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher des produits, catégories..."
            className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border-2 border-transparent focus:border-dore focus:outline-none text-base transition-colors"
            autoComplete="off"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-dore hover:bg-dore/90 transition-colors text-charbon"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
