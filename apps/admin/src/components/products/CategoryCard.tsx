import { motion } from 'framer-motion'
import { Card } from '@maison/ui'
import { Button } from '@maison/ui'
import { Package, ArrowRight } from 'lucide-react'
import { cn } from '@maison/shared'
import { Category } from '@maison/domain'
import { useNavigate } from 'react-router-dom'

const colorSchemes = [
  { color: 'from-blue-50 to-blue-100', borderColor: 'border-blue-200' },
  { color: 'from-amber-50 to-amber-100', borderColor: 'border-amber-200' },
  { color: 'from-purple-50 to-purple-100', borderColor: 'border-purple-200' },
  { color: 'from-green-50 to-green-100', borderColor: 'border-green-200' },
  { color: 'from-pink-50 to-pink-100', borderColor: 'border-pink-200' },
  { color: 'from-indigo-50 to-indigo-100', borderColor: 'border-indigo-200' },
]

interface CategoryCardProps {
  category: Category
  index: number
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  const navigate = useNavigate()
  const scheme = colorSchemes[index % colorSchemes.length]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card
        className={cn(
          'p-6 cursor-pointer transition-all hover:shadow-xl border-2 overflow-hidden group',
          `bg-gradient-to-br ${scheme.color} ${scheme.borderColor} hover:scale-105`
        )}
        onClick={() => navigate(`/produits/${category.slug}`)}
      >
        <div className="flex gap-6 items-start">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white/50 flex-shrink-0 shadow-lg">
            <img
              src={category.image_url || '/assets/categorie-default.jpg'}
              alt={category.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-2xl font-serif mb-2 text-primary">{category.nom}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {category.description || 'Aucune description'}
                </p>
              </div>
              <Package className="w-6 h-6 text-dore flex-shrink-0 mt-1" />
            </div>
            <Button
              variant="outline"
              className="mt-4 group-hover:bg-white group-hover:text-primary"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/produits/${category.slug}`)
              }}
            >
              Gérer les produits
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
