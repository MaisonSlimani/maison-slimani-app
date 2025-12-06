'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Monitor, Smartphone, Eye } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductPreviewModalProps {
  formData: {
    nom: string
    description: string
    prix: string
    stock: string
    image_url: string
    taille?: string
    has_colors: boolean
    vedette?: boolean
  }
  couleurs?: Array<{
    nom: string
    code: string
    stock: number
    taille: string
    imageUrls: string[]
  }>
  imagesGenerales?: Array<{
    file: File | null
    url: string | null
  }>
  isOpen: boolean
  onClose: () => void
}

export default function ProductPreviewModal({
  formData,
  couleurs = [],
  imagesGenerales = [],
  isOpen,
  onClose,
}: ProductPreviewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Get images to display
  const getImages = () => {
    if (formData.has_colors && couleurs.length > 0) {
      const color = couleurs.find(c => c.nom === selectedColor) || couleurs[0]
      if (color?.imageUrls && color.imageUrls.length > 0) {
        return color.imageUrls
      }
    } else if (imagesGenerales.length > 0) {
      return imagesGenerales.map(img => img.url).filter(Boolean) as string[]
    }
    return formData.image_url ? [formData.image_url] : []
  }

  const images = getImages()
  // Use data URI for placeholder to avoid 404 errors
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='
  const displayImage = images[selectedImageIndex] || formData.image_url || placeholderImage
  const prix = parseFloat(formData.prix) || 0
  const stock = formData.has_colors && couleurs.length > 0
    ? couleurs.reduce((sum, c) => sum + (c.stock || 0), 0)
    : parseInt(formData.stock) || 0

  // Parse HTML description for preview
  const parseDescription = (html: string) => {
    if (!html) return ''
    // Remove script tags and sanitize
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.innerHTML
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Aperçu du produit
          </DialogTitle>
          <DialogDescription>
            Visualisez comment votre produit apparaîtra sur mobile et desktop
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile
            </TabsTrigger>
          </TabsList>

          {/* Desktop Preview */}
          <TabsContent value="desktop" className="mt-0 overflow-y-auto max-h-[calc(95vh-180px)]">
            <div className="p-6 bg-muted/30">
              <div className="max-w-7xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden">
                {/* Desktop Header (simulated) */}
                <div className="h-16 bg-charbon text-ecru flex items-center justify-center border-b">
                  <div className="text-sm font-serif">Maison Slimani - Aperçu Desktop</div>
                </div>

                {/* Desktop Product Page */}
                <div className="container max-w-7xl mx-auto px-6 py-12">
                  <div className="grid md:grid-cols-[35%_65%] gap-12 lg:gap-16">
                    {/* Image Gallery - Desktop */}
                    <div className="relative">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                        {displayImage ? (
                          <Image
                            src={displayImage}
                            alt={formData.nom || 'Produit'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <div className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-lg mx-auto mb-2"></div>
                              <p className="text-sm">Aucune image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Thumbnails */}
                      {images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={cn(
                                "relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0",
                                selectedImageIndex === idx ? "border-dore" : "border-border"
                              )}
                            >
                              <Image
                                src={img}
                                alt={`${formData.nom} ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Vedette Badge */}
                      {formData.vedette && (
                        <div className="absolute top-4 right-4 bg-dore text-charbon px-4 py-2 rounded-full text-sm font-serif font-semibold shadow-lg">
                          ⭐ En vedette
                        </div>
                      )}
                    </div>

                    {/* Product Info - Desktop */}
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-4xl font-serif mb-4">{formData.nom || 'Nom du produit'}</h1>
                        <div className="text-3xl font-bold text-dore mb-6">
                          {prix.toFixed(2)} DH
                        </div>
                      </div>

                      {/* Color Selection */}
                      {formData.has_colors && couleurs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Couleur</h3>
                          <div className="flex gap-3 flex-wrap">
                            {couleurs.map((couleur) => (
                              <button
                                key={couleur.nom}
                                onClick={() => {
                                  setSelectedColor(couleur.nom)
                                  setSelectedImageIndex(0)
                                }}
                                className={cn(
                                  "relative w-12 h-12 rounded-lg border-2 transition-all",
                                  selectedColor === couleur.nom || (!selectedColor && couleurs[0]?.nom === couleur.nom)
                                    ? "border-charbon shadow-lg ring-2 ring-charbon ring-offset-2 scale-110"
                                    : "border-gray-300 hover:border-dore"
                                )}
                                style={{ backgroundColor: couleur.code || '#000000' }}
                                title={couleur.nom}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size Selection */}
                      {formData.taille && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Taille</h3>
                          <div className="flex gap-2 flex-wrap">
                            {formData.taille.split(',').map((t) => (
                              <button
                                key={t.trim()}
                                className="px-4 py-2 border border-border rounded-lg hover:border-dore hover:bg-dore/10 transition-colors"
                              >
                                {t.trim()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stock Info */}
                      <div className="flex items-center gap-2 text-sm">
                        {stock > 0 ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600 font-medium">En stock ({stock} disponible{stock > 1 ? 's' : ''})</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-600 font-medium">Rupture de stock</span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      {formData.description && (
                        <div className="prose prose-sm max-w-none">
                          <h3 className="text-lg font-semibold mb-3">Description</h3>
                          <div
                            className="text-muted-foreground leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol_li]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul_li]:my-2 [&_li_p]:m-0 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h1]:text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3 [&_h2]:text-foreground [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground"
                            dangerouslySetInnerHTML={{ __html: parseDescription(formData.description) }}
                          />
                          <style jsx>{`
                            div :global([style*="font-family"]) {
                              font-family: unset !important;
                            }
                            div :global([style*="font-family"]) * {
                              font-family: inherit !important;
                            }
                          `}</style>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <div className="pt-4">
                        <button
                          disabled={stock === 0}
                          className={cn(
                            "w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all",
                            stock > 0
                              ? "bg-dore text-charbon hover:bg-dore/90"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          )}
                        >
                          {stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mobile Preview */}
          <TabsContent value="mobile" className="mt-0 overflow-y-auto max-h-[calc(95vh-180px)]">
            <div className="p-6 bg-muted/30">
              <div className="max-w-sm mx-auto bg-background rounded-lg shadow-lg overflow-hidden">
                {/* Mobile Header (simulated) */}
                <div className="h-14 bg-charbon text-ecru flex items-center justify-center border-b px-4">
                  <div className="text-xs font-serif">Maison Slimani</div>
                </div>

                {/* Mobile Product Page */}
                <div className="px-4 pt-4 pb-20">
                  {/* Image Gallery - Mobile */}
                  <div className="relative mb-6">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                      {displayImage ? (
                        <Image
                          src={displayImage}
                          alt={formData.nom || 'Produit'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <div className="w-12 h-12 border-2 border-dashed border-muted-foreground rounded-lg mx-auto mb-2"></div>
                            <p className="text-xs">Aucune image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails - Mobile */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={cn(
                              "relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0",
                              selectedImageIndex === idx ? "border-dore" : "border-border"
                            )}
                          >
                            <Image
                              src={img}
                              alt={`${formData.nom} ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Vedette Badge - Mobile */}
                    {formData.vedette && (
                      <div className="absolute top-4 right-4 bg-dore text-charbon px-3 py-1.5 rounded-full text-xs font-serif font-semibold shadow-lg">
                        ⭐ En vedette
                      </div>
                    )}
                  </div>

                  {/* Product Info - Mobile */}
                  <div className="space-y-5">
                    <div>
                      <h1 className="text-2xl font-serif mb-3">{formData.nom || 'Nom du produit'}</h1>
                      <div className="text-2xl font-bold text-dore mb-4">
                        {prix.toFixed(2)} DH
                      </div>
                    </div>

                    {/* Description - Mobile (moved directly under price) */}
                    {formData.description && (
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="text-muted-foreground leading-relaxed text-sm [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol_li]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul_li]:my-2 [&_li_p]:m-0 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:text-foreground [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-foreground"
                          dangerouslySetInnerHTML={{ __html: parseDescription(formData.description) }}
                        />
                        <style jsx>{`
                          div :global([style*="font-family"]) {
                            font-family: unset !important;
                          }
                          div :global([style*="font-family"]) * {
                            font-family: inherit !important;
                          }
                        `}</style>
                      </div>
                    )}

                    {/* Color Selection - Mobile */}
                    {formData.has_colors && couleurs.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Couleur</h3>
                        <div className="flex gap-2 flex-wrap">
                          {couleurs.map((couleur) => (
                            <button
                              key={couleur.nom}
                              onClick={() => {
                                setSelectedColor(couleur.nom)
                                setSelectedImageIndex(0)
                              }}
                              className={cn(
                                "relative w-10 h-10 rounded-lg border-2 transition-all",
                                selectedColor === couleur.nom || (!selectedColor && couleurs[0]?.nom === couleur.nom)
                                  ? "border-charbon shadow-lg ring-2 ring-charbon ring-offset-1 scale-110"
                                  : "border-gray-300 hover:border-dore"
                              )}
                              style={{ backgroundColor: couleur.code || '#000000' }}
                              title={couleur.nom}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Selection - Mobile */}
                    {formData.taille && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Taille</h3>
                        <div className="flex gap-2 flex-wrap">
                          {formData.taille.split(',').map((t) => (
                            <button
                              key={t.trim()}
                              className="px-3 py-1.5 border border-border rounded-lg hover:border-dore hover:bg-dore/10 transition-colors text-sm"
                            >
                              {t.trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stock Info - Mobile */}
                    <div className="flex items-center gap-2 text-sm">
                      {stock > 0 ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">En stock ({stock} disponible{stock > 1 ? 's' : ''})</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600 font-medium">Rupture de stock</span>
                        </>
                      )}
                    </div>

                    {/* Add to Cart Button - Mobile */}
                    <div className="pt-4 sticky bottom-0 bg-background pb-4">
                      <button
                        disabled={stock === 0}
                        className={cn(
                          "w-full py-3 px-6 rounded-lg font-semibold transition-all",
                          stock > 0
                            ? "bg-dore text-charbon hover:bg-dore/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="px-6 py-4 border-t flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

