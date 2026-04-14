import { Category } from '@maison/domain'
import { Card, Button } from '@maison/ui'
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react'

interface CategoryCardProps {
  categorie: Category
  onEdit: (categorie: Category) => void
  onDelete: (id: string) => void
}

export function CategoryCard({ categorie, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="p-6 overflow-hidden">
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-border bg-muted">
        {categorie.image_url ? (
          <img src={categorie.image_url} alt={categorie.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-serif">{categorie.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categorie.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {categorie.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{categorie.description || 'Aucune description'}</p>
        <p className="text-xs text-muted-foreground">Slug: {categorie.slug}</p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(categorie)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(categorie.id)} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
