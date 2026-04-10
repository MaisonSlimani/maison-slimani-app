import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, LuxuryLoading } from '@maison/ui'
import { ArrowLeft, Plus } from 'lucide-react'
import { productRepo, categoryRepo } from '@/lib/repositories'
import { Product, Category } from '@maison/domain'
import { toast } from 'sonner'
import { ProductList, ProductFormDialog } from '@/components/products'

export default function CategoryProductsPage() {
  const { categorySlug = 'tous' } = useParams<{ categorySlug: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<{ p: Product[]; c: Category[]; curr: Category | null }>({ p: [], c: [], curr: null })
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null })

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [allP, allC] = await Promise.all([productRepo.findAll(), categoryRepo.findAll()])
      const cats = allC.filter(c => c.active !== false)
      let curr: Category | null = null; let p = allP
      if (categorySlug !== 'tous') {
        curr = cats.find(c => c.slug === categorySlug) || null
        if (curr) p = allP.filter(x => x.categorie === curr?.nom)
      }
      setData({ p, c: cats, curr })
    } catch { toast.error('Erreur chargement') } finally { setLoading(false) }
  }, [categorySlug])

  useEffect(() => { fetch() }, [fetch])

  const openEdit = (p: Product | null) => setDialog({ open: true, product: p })

  if (loading) return <LuxuryLoading fullScreen message="Chargement..." />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/produits')}><ArrowLeft className="w-4 h-4" /></Button>
          <div><h1 className="text-3xl font-serif mb-2">{data.curr ? data.curr.nom : 'Tous les produits'}</h1>
            <p className="text-muted-foreground">{data.p.length} produit{data.p.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button onClick={() => openEdit(null)}><Plus className="w-4 h-4 mr-2" /> Nouveau</Button>
      </div>
      <ProductList products={data.p} onEdit={openEdit} onRefresh={fetch} />
      <ProductFormDialog open={dialog.open} onOpenChange={o => setDialog({ ...dialog, open: o })} product={dialog.product} categories={data.c} onSuccess={fetch} defaultCategory={data.curr?.nom} />
    </div>
  )
}
