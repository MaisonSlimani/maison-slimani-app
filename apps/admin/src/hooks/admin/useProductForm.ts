import { useState, useEffect, useCallback } from 'react'
import { Product, ProductVariation } from '@maison/domain'
import { productRepo, storageRepo } from '@/lib/repositories'
import { toast } from 'sonner'
import { GeneralImage } from '@/components/products/form/GeneralImagesForm'
import { VariationImage } from '@/components/products/form/VariationsForm'
import { optimizeImage } from '@/lib/utils/image-optimizer'

interface UseProductFormParams {
  product: Product | null; defaultCategory?: string; onSuccess: () => void; onOpenChange: (open: boolean) => void
}

type VariationWithPending = ProductVariation & { pendingImages?: VariationImage[] }

/**
 * Hook to manage product form state and submission
 */
export function useProductForm({ product, defaultCategory, onSuccess, onOpenChange }: UseProductFormParams) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>({ 
    name: '', 
    price: 0, 
    description: '', 
    category: defaultCategory || '', 
    stock: 0, 
    featured: false, 
    hasColors: false 
  })
  const [generalImages, setGeneralImages] = useState<GeneralImage[]>([])
  const [colors, setColors] = useState<VariationWithPending[]>([])

  useEffect(() => {
    if (product) {
      initializeWithProduct(product, setFormData, setColors, setGeneralImages)
    } else {
      resetForm(defaultCategory, setFormData, setGeneralImages, setColors)
    }
  }, [product, defaultCategory])


  const buildPayload = useCallback(async () => {
    const uploadedGeneral = await uploadImages(generalImages)
    const finalColors = await Promise.all(colors.map(buildColorPayload))
    
    const stockValue = formData.hasColors 
      ? finalColors.reduce((sum, c) => sum + (c.stock || 0), 0) 
      : formData.stock
      
    const payload: Product = {
      ...formData as Product,
      stock: stockValue ?? 0,
      totalStock: stockValue ?? 0,
    }

    if (formData.hasColors) {
      payload.colors = finalColors
      payload.images = null
      payload.image_url = null
    } else {
      payload.colors = null
      payload.images = uploadedGeneral.length > 0 ? uploadedGeneral : (formData.images || null)
      payload.image_url = uploadedGeneral[0] || formData.image_url || null
    }

    return payload
  }, [formData, generalImages, colors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const p = await buildPayload()
      const res = product?.id
        ? await productRepo.update(product.id, p)
        : await productRepo.create(p)
      if (res.success) { 
        toast.success(product ? 'Mis à jour' : 'Créé')
        onSuccess()
        onOpenChange(false) 
      } else {
        throw new Error(res.error || 'Erreur')
      }
    } catch (err: unknown) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    } finally { 
      setLoading(false) 
    }
  }

  return { 
    loading, 
    formData, 
    setFormData, 
    generalImages, 
    setGeneralImages, 
    colors, 
    setColors, 
    handleSubmit 
  }
}

// --- Helpers ---

function initializeWithProduct(
  product: Product, 
  setFormData: (p: Partial<Product>) => void,
  setColors: (c: VariationWithPending[]) => void,
  setGeneralImages: (i: GeneralImage[]) => void
) {
  setFormData(product)
  if (product.hasColors && product.colors) {
    setColors((product.colors as ProductVariation[]).map(c => ({ 
      ...c, 
      name: c.name || '', 
      code: c.code || '#000000', 
      stock: c.stock || 0, 
      sizes: c.sizes || [], 
      images: c.images || [], 
      pendingImages: [] 
    })))
    setGeneralImages([])
  } else if (!product.hasColors && product.images) {
    setGeneralImages(product.images.map(url => ({ file: null, url })))
    setColors([])
  }
}

function resetForm(
  defaultCategory: string | undefined,
  setFormData: (p: Partial<Product>) => void,
  setGeneralImages: (i: GeneralImage[]) => void,
  setColors: (c: VariationWithPending[]) => void
) {
  setFormData({ 
    name: '', price: 0, description: '', 
    category: defaultCategory || '', 
    stock: 0, featured: false, hasColors: false 
  })
  setGeneralImages([]); setColors([])
}

async function uploadImages(list: { file: File | null; url: string | null }[]) {
  const urls: string[] = []
  for (const img of list) {
    if (img.file) {
      const optimizedBlob = await optimizeImage(img.file)
      const fileName = img.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `${Date.now()}-${fileName.split('.')[0]}.webp`
      await storageRepo.uploadImage(path, optimizedBlob as File, 'image/webp')
      urls.push(storageRepo.getPublicUrl(path))
    } else if (img.url) {
      urls.push(img.url)
    }
  }
  return urls
}

async function buildColorPayload(c: VariationWithPending) {
  const pending = await uploadImages(c.pendingImages || [])
  const images = [...(c.images || []), ...pending]
  const stock = c.sizes?.reduce((sum, t) => sum + (t.stock || 0), 0) || c.stock || 0
  return { name: c.name, code: c.code, stock, sizes: c.sizes, images }
}
