import { useState, useEffect } from 'react'
import { categoryRepo } from '@/lib/repositories'
import { Category } from '@maison/domain'
import { toast } from 'sonner'

export function useProductsCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const chargerCategories = async () => {
      try {
        const data = await categoryRepo.findAll()
        setCategories(data.filter(c => c.active !== false))
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Erreur lors du chargement des catégories')
      } finally {
        setLoading(false)
      }
    }
    chargerCategories()
  }, [])

  return { categories, loading }
}
