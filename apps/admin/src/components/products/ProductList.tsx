import { Product } from '@maison/domain'
import { Card, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@maison/ui'
import { Package } from 'lucide-react'
import { productRepo } from '@/lib/repositories'
import { toast } from 'sonner'
import { useState } from 'react'
import ProductListItem from './ProductListItem'

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onRefresh: () => void
}

export function ProductList({ products, onEdit, onRefresh }: ProductListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const result = await productRepo.delete(deleteId)
      if (result.success) {
        toast.success('Produit supprimé')
        onRefresh()
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur technique lors de la suppression')
    } finally {
      setDeleteId(null)
    }
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie.</p>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductListItem 
          key={product.id} 
          product={product} 
          onEdit={onEdit} 
          onDelete={setDeleteId} 
        />
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
