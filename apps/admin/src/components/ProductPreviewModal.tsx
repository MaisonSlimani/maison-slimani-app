'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@maison/ui'
import { Monitor, Smartphone, Eye } from 'lucide-react'
import { ProductPreviewGallery, ProductPreviewInfo } from './products/ProductPreviewComponents'

interface ProductPreviewModalProps {
  formData: { nom: string; description: string; prix: string; stock: string; image_url: string; has_colors: boolean; vedette?: boolean }
  couleurs?: Array<{ nom: string; code: string; stock: number; imageUrls: string[] }>
  imagesGenerales?: Array<{ file: File | null; url: string | null }>
  isOpen: boolean
  onClose: () => void
}

export default function ProductPreviewModal({ formData, couleurs = [], imagesGenerales = [], isOpen, onClose }: ProductPreviewModalProps) {
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const getImages = () => {
    if (formData.has_colors && couleurs.length > 0) {
      const c = couleurs.find(x => x.nom === selectedColor) || couleurs[0]
      if (c?.imageUrls?.length) return c.imageUrls
    } else if (imagesGenerales.length > 0) {
      return imagesGenerales.map(img => img.url).filter(Boolean) as string[]
    }
    return formData.image_url ? [formData.image_url] : []
  }

  const images = getImages(); const stockValue = formData.has_colors ? couleurs.reduce((s, c) => s + (c.stock || 0), 0) : parseInt(formData.stock) || 0

  const PreviewContent = ({ mode }: { mode: 'desktop' | 'mobile' }) => (
    <div className={mode === 'desktop' ? "p-6 bg-muted/30" : "p-4 bg-muted/20"}>
      <div className={mode === 'desktop' ? "max-w-6xl mx-auto bg-background rounded-lg shadow-xl overflow-hidden" : "max-w-sm mx-auto bg-background rounded-2xl shadow-xl border overflow-hidden"}>
        <div className="h-12 bg-charbon text-ecru flex items-center justify-center border-b text-xs font-serif">Maison Slimani</div>
        <div className={mode === 'desktop' ? "p-8 grid md:grid-cols-2 gap-12" : "p-4 space-y-6"}>
          <ProductPreviewGallery images={images} selectedIndex={selectedImageIndex} onSelect={setSelectedImageIndex} showStars={formData.vedette} />
          <ProductPreviewInfo formData={formData} couleurs={couleurs} selectedColor={selectedColor} onColorSelect={(c: string) => { setSelectedColor(c); setSelectedImageIndex(0) }} stock={stockValue} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Aperçu du produit</DialogTitle>
          <DialogDescription>Visualisez le rendu final sur ordinateur et mobile.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList className="mx-6 mt-4"><TabsTrigger value="desktop"><Monitor className="w-4 h-4 mr-2" />Desktop</TabsTrigger><TabsTrigger value="mobile"><Smartphone className="w-4 h-4 mr-2" />Mobile</TabsTrigger></TabsList>
            <TabsContent value="desktop"><PreviewContent mode="desktop" /></TabsContent>
            <TabsContent value="mobile"><PreviewContent mode="mobile" /></TabsContent>
          </Tabs>
        </div>
        <div className="px-6 py-4 border-t flex justify-end shrink-0"><Button onClick={onClose} variant="outline">Fermer</Button></div>
      </DialogContent>
    </Dialog>
  )
}
