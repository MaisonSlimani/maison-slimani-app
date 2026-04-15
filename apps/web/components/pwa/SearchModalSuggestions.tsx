'use client'

export function SearchModalSuggestions({ onSelect }: { onSelect: (s: string) => void }) {
  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground mb-2">Suggestions</p>
      <div className="flex flex-wrap gap-2">
        {['Chaussures', 'Cuir', 'Luxe', 'Classique'].map((s) => (
          <button key={s} onClick={() => onSelect(s)} className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors">{s}</button>
        ))}
      </div>
    </div>
  )
}
