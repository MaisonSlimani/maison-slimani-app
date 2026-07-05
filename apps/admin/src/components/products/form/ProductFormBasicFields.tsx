import { Category, Product } from '@maison/domain'
import { Input, Label, Checkbox } from '@maison/ui'

interface ProductFormBasicFieldsProps {
  formData: Partial<Product>
  setFormData: (data: Partial<Product>) => void
  categories: Category[]
  errors?: Record<string, string>
}

function ProductBasicInfo({ formData, setFormData, errors = {} }: Omit<ProductFormBasicFieldsProps, 'categories'>) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const updates: Partial<Product> = { name: newName };
    if (!formData.slug) {
      updates.slug = newName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setFormData({ ...formData, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit *</Label>
        <Input 
          id="name" 
          value={formData.name || ''} 
          onChange={handleNameChange} 
          placeholder="ex: Beldi Mixte Premium" 
          className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input 
          id="slug" 
          value={formData.slug || ''} 
          onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} 
          placeholder="ex: beldi-mixte-premium" 
          className={errors.slug ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
        <p className="text-[10px] text-muted-foreground">Identifiant unique pour l'URL du produit</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (MAD) *</Label>
          <Input 
            id="price" 
            type="number" 
            value={formData.price || 0} 
            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} 
            className={errors.price ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>
        {!formData.hasColors && (
          <div className="space-y-2">
            <Label htmlFor="stock">Stock total</Label>
            <Input 
              id="stock" 
              type="number" 
              value={formData.stock || 0} 
              onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} 
              className={errors.stock ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCategoryAndFlags({ formData, setFormData, categories, errors = {} }: ProductFormBasicFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Catégorie *</Label>
        <select 
          className={`w-full h-10 rounded-md border px-3 py-2 text-sm focus-visible:outline-dore ${
            errors.category ? "border-red-500 focus-visible:ring-red-500" : "border-input bg-background"
          }`}
          value={formData.category || ''}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>
      <div className="flex gap-6 py-2 pt-6">
        <div className="flex items-center space-x-2">
          <Checkbox id="featured" checked={formData.featured || false} onCheckedChange={c => setFormData({ ...formData, featured: !!c })} />
          <Label htmlFor="featured" className="cursor-pointer text-sm font-medium">Afficher sur l'accueil</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="hasColors" checked={formData.hasColors || false} onCheckedChange={c => setFormData({ ...formData, hasColors: !!c })} />
          <Label htmlFor="hasColors" className="cursor-pointer text-sm font-medium">Gérer par couleurs</Label>
        </div>
      </div>
    </div>
  )
}

export function ProductFormBasicFields(props: ProductFormBasicFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProductBasicInfo formData={props.formData} setFormData={props.setFormData} errors={props.errors} />
      <ProductCategoryAndFlags {...props} />
    </div>
  )
}
