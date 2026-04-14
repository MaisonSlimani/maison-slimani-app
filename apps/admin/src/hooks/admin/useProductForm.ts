import { useState, useEffect, useCallback } from 'react'
import { Product, ProductVariation } from '@maison/domain'
import { productRepo, storageRepo } from '@/lib/repositories'
import { toast } from 'sonner'
import { GeneralImage } from '@/components/products/form/GeneralImagesForm'
import { VariationImage } from '@/components/products/form/VariationsForm'

interface UseProductFormParams {
  product: Product | null; defaultCategory?: string; onSuccess: () => void; onOpenChange: (open: boolean) => void
}

type VariationWithPending = ProductVariation & { pendingImages?: VariationImage[] }

export function useProductForm({ product, defaultCategory, onSuccess, onOpenChange }: UseProductFormParams) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({ name: '', price: 0, description: '', category: defaultCategory || '', stock: 0, featured: false, hasColors: false })
  const [imagesGenerales, setImagesGenerales] = useState<GeneralImage[]>([])
  const [couleurs, setCouleurs] = useState<VariationWithPending[]>([])

  useEffect(() => {
    if (product) {
      setFormData(product)
      if (product.hasColors && product.colors) {
        setCouleurs((product.colors as ProductVariation[]).map(c => ({ 
          ...c, name: c.name || '', code: c.code || '#000000', 
          stock: c.stock || 0, sizes: c.sizes || [], 
          images: c.images || [], pendingImages: [] 
        })))
        setImagesGenerales([])
      } else if (!product.hasColors && product.images) {
        setImagesGenerales(product.images.map(url => ({ file: null, url })))
        setCouleurs([])
      }
    } else {
      setFormData({ name: '', price: 0, description: '', category: defaultCategory || '', stock: 0, featured: false, hasColors: false })
      setImagesGenerales([]); setCouleurs([])
    }
  }, [product, defaultCategory])

  const uploadImages = async (list: { file: File | null; url: string | null }[]) => {
    const urls = []
    for (const img of list) {
      if (img.file) {
        const path = `${Date.now()}-${img.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        await storageRepo.uploadImage(path, img.file, img.file.type)
        urls.push(storageRepo.getPublicUrl(path))
      } else if (img.url) urls.push(img.url)
    }
    return urls
  }

  const buildPayload = useCallback(async () => {
    const uploadedGeneral = await uploadImages(imagesGenerales)
    const finalColors = []
    for (const c of couleurs) {
      const uploadedColorImages = [...(c.images || []), ...(await uploadImages(c.pendingImages || []))]
      const calStock = c.sizes?.reduce((sum, t) => sum + (t.stock || 0), 0) || c.stock || 0
      finalColors.push({ name: c.name, code: c.code, stock: calStock, sizes: c.sizes, images: uploadedColorImages })
    }
    const stockValue = formData.hasColors ? finalColors.reduce((sum, c) => sum + (c.stock || 0), 0) : formData.stock
    return { 
      ...formData, 
      images: formData.hasColors ? null : uploadedGeneral, 
      image_url: formData.hasColors ? null : (uploadedGeneral[0] || null), 
      colors: formData.hasColors ? finalColors : null, 
      stock: stockValue, 
      totalStock: stockValue 
    } as unknown as Product
  }, [formData, imagesGenerales, couleurs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const p = await buildPayload()
      const res = product?.id 
        ? await productRepo.update(product.id, p as unknown as Parameters<typeof productRepo.update>[1]) 
        : await productRepo.create(p as unknown as Parameters<typeof productRepo.create>[0])
      if (res.success) { toast.success(product ? 'Mis à jour' : 'Créé'); onSuccess(); onOpenChange(false) }
      else throw new Error(res.error || 'Erreur')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur') } finally { setLoading(false) }
  }

  return { loading, formData, setFormData, imagesGenerales, setImagesGenerales, couleurs, setCouleurs, handleSubmit }
}
