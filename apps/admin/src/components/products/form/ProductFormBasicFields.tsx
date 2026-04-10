import { Category, Product } from '@maison/domain'
import { Input, Label, Checkbox } from '@maison/ui'

interface ProductFormBasicFieldsProps {
  formData: Partial<Product>
  setFormData: (data: Partial<Product>) => void
  categories: Category[]
}

export function ProductFormBasicFields({ formData, setFormData, categories }: ProductFormBasicFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du produit *</Label>
          <Input 
            id="nom" 
            value={formData.nom} 
            onChange={e => setFormData({ ...formData, nom: e.target.value })} 
            required 
            placeholder="ex: Beldi Mixte Premium"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prix">Prix (MAD) *</Label>
            <Input 
              id="prix" 
              type="number" 
              value={formData.prix} 
              onChange={e => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })} 
              required 
            />
          </div>
          {!formData.has_colors && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stock total</Label>
              <Input 
                id="stock" 
                type="number" 
                value={formData.stock || 0} 
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} 
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Catégorie *</Label>
          <select 
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-dore"
            value={formData.categorie || ''}
            onChange={e => setFormData({ ...formData, categorie: e.target.value })}
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.nom}>{cat.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6 py-2 pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="vedette" 
              checked={formData.vedette || false} 
              onCheckedChange={checked => setFormData({ ...formData, vedette: !!checked })} 
            />
            <Label htmlFor="vedette" className="cursor-pointer text-sm font-medium">Afficher sur l'accueil</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="has_colors" 
              checked={formData.has_colors || false} 
              onCheckedChange={checked => setFormData({ ...formData, has_colors: !!checked })} 
            />
            <Label htmlFor="has_colors" className="cursor-pointer text-sm font-medium">Gérer par couleurs</Label>
          </div>
        </div>
      </div>
    </div>
  )
}
