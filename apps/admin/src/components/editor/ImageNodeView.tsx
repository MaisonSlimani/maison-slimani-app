import React from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Trash2, RotateCcw, Plus, Minus, MoveHorizontal } from 'lucide-react'
import { cn } from '@maison/shared'

export function ImageNodeView(props: NodeViewProps) {
  const { node, updateAttributes, deleteNode, selected } = props
  const { src, alt, width } = node.attrs

  // Helpers to parse values
  const getWidthPercent = (): number => {
    if (!width) return 100
    const parsed = parseInt(width, 10)
    return isNaN(parsed) ? 100 : parsed
  }

  // Stepper Handlers for Width
  const handleWidthChange = (direction: 'increment' | 'decrement') => {
    const current = getWidthPercent()
    const next = direction === 'increment'
      ? Math.min(100, current + 10)
      : Math.max(10, current - 10)
    updateAttributes({ width: `${next}%` })
  }

  const handleReset = () => {
    updateAttributes({ width: '100%' })
  }

  return (
    <NodeViewWrapper className="relative my-8 group select-none">
      {/* 1. Main Toolbar - rendered above the image, spans full editor width, only shown when selected */}
      {selected && (
        <div className="mb-3 bg-background border border-border rounded-xl p-2 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-4">
            {/* Width Stepper */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <MoveHorizontal className="w-3.5 h-3.5" /> Largeur :
              </span>
              <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/40">
                <button
                  type="button"
                  onClick={() => handleWidthChange('decrement')}
                  className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-all"
                  title="Diminuer la largeur"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-semibold px-2 min-w-[44px] text-center">
                  {width || '100%'}
                </span>
                <button
                  type="button"
                  onClick={() => handleWidthChange('increment')}
                  className="p-1 hover:bg-background rounded text-muted-foreground hover:text-foreground transition-all"
                  title="Augmenter la largeur"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions (Reset & Trash) */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-border/50">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Réinitialiser la taille"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Réinitialiser</span>
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Supprimer l'image"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Supprimer</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Image Render Container */}
      <div 
        className={cn(
          "relative rounded-xl overflow-hidden border border-border/40 transition-all mx-auto bg-muted/5",
          selected ? "ring-2 ring-dore shadow-md" : "hover:border-dore/40"
        )}
        style={{ 
          width: width || '100%', 
          height: 'auto',
          maxWidth: '100%' 
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto rounded-xl pointer-events-none"
        />
      </div>
    </NodeViewWrapper>
  )
}
