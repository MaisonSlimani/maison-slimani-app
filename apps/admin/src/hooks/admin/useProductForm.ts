import { useState, useEffect, useCallback } from 'react'
import { Product, ProductVariation } from '@maison/domain'
import { productRepo, storageRepo } from '@/lib/repositories'
import { toast } from 'sonner'
import { GeneralImage } from '@/components/products/form/GeneralImagesForm'
import { VariationImage } from '@/components/products/form/VariationsForm'
import { optimizeImage } from '@/lib/utils/image-optimizer'
import { z } from 'zod'

interface UseProductFormParams {
  product: Product | null; defaultCategory?: string; onSuccess: () => void; onOpenChange: (open: boolean) => void
}

type VariationWithPending = ProductVariation & { pendingImages?: VariationImage[] }

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom du produit est requis").max(100, "Le nom est trop long"),
  slug: z.string().trim().min(1, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets (sans espaces)"),
  price: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Le prix doit être un nombre" }).nonnegative("Le prix ne peut pas être négatif")
  ),
  category: z.string().trim().min(1, "La catégorie est requise"),
  description: z.string().optional().nullable(),
  featured: z.boolean().optional().nullable(),
  hasColors: z.boolean().optional().nullable(),
  stock: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : Number(val)),
    z.number().int("Le stock doit être un nombre entier").nonnegative("Le stock ne peut pas être négatif")
  ).optional().nullable(),
})

/**
 * Hook to manage product form state and submission
 */
export function useProductForm({ product, defaultCategory, onSuccess, onOpenChange }: UseProductFormParams) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormDataInternal] = useState<Partial<Product>>({ 
    name: '', 
    price: 0, 
    description: '', 
    category: defaultCategory || '', 
    stock: 0, 
    featured: false, 
    hasColors: false 
  })
  const [generalImages, setGeneralImages] = useState<GeneralImage[]>([])
  const [colors, setColorsInternal] = useState<VariationWithPending[]>([])

  const setFormData = useCallback((value: Partial<Product> | ((prev: Partial<Product>) => Partial<Product>)) => {
    setFormDataInternal(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      // Clear errors for keys that have changed
      setErrors(errs => {
        const nextErrs = { ...errs };
        let changed = false;
        Object.keys(next).forEach(key => {
          const typedKey = key as keyof Product;
          if (next[typedKey] !== prev[typedKey] && nextErrs[key]) {
            delete nextErrs[key];
            changed = true;
          }
        });
        return changed ? nextErrs : errs;
      });
      return next;
    });
  }, []);

  const setColors = useCallback((value: VariationWithPending[] | ((prev: VariationWithPending[]) => VariationWithPending[])) => {
    setColorsInternal(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      // Clear colors-related errors on change
      setErrors(errs => {
        const nextErrs = { ...errs };
        let changed = false;
        if (nextErrs.colors) {
          delete nextErrs.colors;
          changed = true;
        }
        Object.keys(nextErrs).forEach(key => {
          if (key.startsWith('color_')) {
            delete nextErrs[key];
            changed = true;
          }
        });
        return changed ? nextErrs : errs;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    setErrors({})
    if (product) {
      setFormDataInternal(product)
      if (product.hasColors && product.colors) {
        setColorsInternal((product.colors as ProductVariation[]).map(c => ({ 
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
        setColorsInternal([])
      }
    } else {
      setFormDataInternal({ 
        name: '', 
        price: 0, 
        description: '', 
        category: defaultCategory || '', 
        stock: 0, 
        featured: false, 
        hasColors: false 
      })
      setGeneralImages([]); setColorsInternal([])
    }
  }, [product, defaultCategory])

  const uploadImages = async (list: { file: File | null; url: string | null }[]) => {
    const urls = []
    for (const img of list) {
      if (img.file) {
        // Optimize image before upload to save space and Vercel costs
        const optimizedBlob = await optimizeImage(img.file);
        const fileName = img.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${Date.now()}-${fileName.split('.')[0]}.webp`;
        
        await storageRepo.uploadImage(path, optimizedBlob as File, 'image/webp')
        urls.push(storageRepo.getPublicUrl(path))
      } else if (img.url) urls.push(img.url)
    }
    return urls
  }

  const buildPayload = useCallback(async () => {
    const uploadedGeneral = await uploadImages(generalImages)
    const finalColors = []
    for (const c of colors) {
      const uploadedColorImages = [...(c.images || []), ...(await uploadImages(c.pendingImages || []))]
      const calStock = c.sizes?.reduce((sum, t) => sum + (t.stock || 0), 0) || c.stock || 0
      finalColors.push({ name: c.name, code: c.code, stock: calStock, sizes: c.sizes, images: uploadedColorImages })
    }
    const stockValue = formData.hasColors ? finalColors.reduce((sum, c) => sum + (c.stock || 0), 0) : formData.stock
    return {
      ...formData,
      images: formData.hasColors ? null : (uploadedGeneral.length > 0 ? uploadedGeneral : (formData.images || null)),
      image_url: formData.hasColors 
        ? (finalColors[0]?.images?.[0] || null) 
        : (uploadedGeneral[0] || formData.image_url || null),
      colors: formData.hasColors ? finalColors : null,
      stock: stockValue ?? 0,
      totalStock: stockValue ?? 0,
    } as Product
  }, [formData, generalImages, colors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Run local validation first
    const newErrors: Record<string, string> = {}
    
    const basicResult = productFormSchema.safeParse(formData)
    if (!basicResult.success) {
      basicResult.error.issues.forEach(issue => {
        const path = issue.path[0] as string
        newErrors[path] = issue.message
      })
    }
    
    if (formData.hasColors) {
      if (!colors || colors.length === 0) {
        newErrors.colors = "Veuillez ajouter au moins une variation de couleur."
      } else {
        colors.forEach((c, idx) => {
          if (!c.name.trim()) {
            newErrors[`color_${idx}_name`] = "Le nom de la couleur est requis."
          }
          if (c.sizes && c.sizes.length > 0) {
            c.sizes.forEach((s, sIdx) => {
              if (!s.name.trim()) {
                newErrors[`color_${idx}_size_${sIdx}_name`] = "Le nom de la taille est requis."
              }
              if (s.stock === undefined || Number.isNaN(s.stock) || s.stock < 0) {
                newErrors[`color_${idx}_size_${sIdx}_stock`] = "Le stock doit être supérieur ou égal à 0."
              }
            })
          } else {
            if (c.stock === undefined || Number.isNaN(c.stock) || c.stock < 0) {
              newErrors[`color_${idx}_stock`] = "Le stock doit être supérieur ou égal à 0."
            }
          }
        })
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Veuillez corriger les erreurs du formulaire.")
      return
    }
    
    setErrors({})
    setLoading(true)
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
        if (res.error?.includes('unique') || res.error?.includes('already exists') || res.error?.includes('duplicate key')) {
          setErrors({ slug: "Ce slug est déjà utilisé par un autre produit." })
          toast.error("Veuillez corriger les erreurs du formulaire.")
        } else {
          throw new Error(res.error || 'Erreur')
        }
      }
    } catch (err: unknown) { 
      toast.error(err instanceof Error ? err.message : 'Erreur') 
    } finally { 
      setLoading(false) 
    }
  }

  return { 
    loading, 
    errors,
    formData, 
    setFormData, 
    generalImages, 
    setGeneralImages, 
    colors, 
    setColors, 
    handleSubmit 
  }
}
