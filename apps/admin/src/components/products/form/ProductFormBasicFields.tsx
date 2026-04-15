import { Category, Product } from '@maison/domain'
import { Input, Label, Checkbox } from '@maison/ui'

interface ProductFormBasicFieldsProps {
  formData: Partial<Product>
  setFormData: (data: Partial<Product>) => void
  categories: Category[]
}

function ProductBasicInfo({ formData, setFormData }: Omit<ProductFormBasicFieldsProps, 'categories'>) {
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
        <Input id="name" value={formData.name || ''} onChange={handleNameChange} required placeholder="ex: Beldi Mixte Premium" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <Input id="slug" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required placeholder="ex: beldi-mixte-premium" />
        <p className="text-[10px] text-muted-foreground">Identifiant unique pour l'URL du produit</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (MAD) *</Label>
          <Input id="price" type="number" value={formData.price || 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
        </div>
        {!formData.hasColors && (
          <div className="space-y-2">
            <Label htmlFor="stock">Stock total</Label>
            <Input id="stock" type="number" value={formData.stock || 0} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCategoryAndFlags({ formData, setFormData, categories }: ProductFormBasicFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Catégorie *</Label>
        <select 
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-dore"
          value={formData.category || ''}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
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
      <ProductBasicInfo formData={props.formData} setFormData={props.setFormData} />
      <ProductCategoryAndFlags {...props} />
    </div>
  )
}
