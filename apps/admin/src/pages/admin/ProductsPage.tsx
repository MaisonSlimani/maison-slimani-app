import { Button } from '@maison/ui'
import { Card } from '@maison/ui'
import { Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { LuxuryLoading } from '@maison/ui'
import { useProductsCategories } from '@/hooks/admin/useProductsCategories'
import { CategoryCard } from '@/components/products/CategoryCard'

export default function ProductsPage() {
  const navigate = useNavigate()
  const { categories, loading } = useProductsCategories()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-primary">Gestion des produits</h1>
          <p className="text-muted-foreground">Sélectionnez une catégorie pour gérer les produits</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/categories">
            <Settings className="w-4 h-4 mr-2" /> Gérer les catégories
          </Link>
        </Button>
      </div>

      {loading ? (
        <LuxuryLoading message="Chargement des catégories..." />
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground mb-4">Aucune catégorie active</p>
          <Button asChild>
            <Link to="/categories">
              <Settings className="w-4 h-4 mr-2" /> Créer une catégorie
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((categorie, index) => (
            <CategoryCard key={categorie.id} category={categorie} index={index} />
          ))}
        </div>
      )}

      <Card className="p-8 bg-muted/30 border-dashed text-center">
        <p className="text-muted-foreground mb-4 text-sm font-medium">
          Vous souhaitez voir tous les produits en même temps ?
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/produits/tous')}
          className="border-primary/20 hover:bg-primary/5"
        >
          Voir tous les produits
        </Button>
      </Card>
    </div>
  )
}
