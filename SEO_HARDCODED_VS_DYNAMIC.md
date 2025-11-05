# SEO: Hardcoded vs Dynamic Elements

## ✅ **FULLY DYNAMIC** (Changes with Admin/Database)

### **Product Pages** (`/produit/[id]`)
**100% Dynamic - Everything from Database**

- ✅ Product name → `produit.nom` (database)
- ✅ Product description → `produit.description` (database)
- ✅ Product image → `produit.image_url` or `produit.images[0]` (database)
- ✅ Product price → `produit.prix` (database)
- ✅ Product stock → `produit.stock` (database)
- ✅ Meta title → `${produit.nom} | Maison Slimani`
- ✅ Meta description → First 160 chars of `produit.description`
- ✅ OG image → From product image in database
- ✅ Structured data → All product data from database
- ✅ Canonical URL → Dynamic from current URL

**Admin Changes**: ✅ Automatically updates all SEO elements

---

### **Sitemap** (`/sitemap.xml`)
**100% Dynamic - Fetches from Database**

- ✅ Product URLs → Fetched from database
- ✅ Product last modified → `produit.date_ajout` (database)
- ✅ Auto-updates when products are added/updated

**Admin Changes**: ✅ New products automatically appear in sitemap

---

### **Category Pages** (`/boutique/[categorie]`)
**Structure is Dynamic, Content is Hardcoded**

- ✅ Meta title → `${categorieInfo.nom} - Chaussures Homme Luxe | Maison Slimani` (dynamic structure)
- ✅ Meta description → `${categorieInfo.description} + text` (dynamic structure)
- ✅ OG image → From `categorieInfo.image` (dynamic structure)
- ✅ Structured data → Uses category info (dynamic structure)
- ✅ Canonical URL → Dynamic from current URL
- ✅ Breadcrumbs → Dynamic structure

**BUT**: Category names/descriptions/images are hardcoded in `categoriesConfig` (see below)

---

## 🟡 **HARDCODED** (Needs Code Changes)

### **1. Category Names/Descriptions** 
**File**: `app/boutique/[categorie]/page.tsx` (lines 18-44)

```typescript
const categoriesConfig = {
  classiques: {
    nom: 'Classiques',  // ⚠️ HARDCODED
    description: "L'essence de l'élégance quotidienne...",  // ⚠️ HARDCODED
    image: '/assets/categorie-classiques.jpg',  // ⚠️ HARDCODED
  },
  'cuirs-exotiques': {
    nom: 'Cuirs Exotiques',  // ⚠️ HARDCODED
    description: 'Le luxe dans sa forme la plus rare...',  // ⚠️ HARDCODED
    image: '/assets/categorie-exotiques.jpg',  // ⚠️ HARDCODED
  },
  // ... other categories
}
```

**Impact**: 
- ❌ Admin cannot change category names/descriptions via admin panel
- ❌ Requires code changes to update category SEO
- ✅ SEO structure is dynamic (uses these hardcoded values)

**To Make Dynamic**: Create `categories` table in Supabase and fetch from database

---

### **2. Home Page Description**
**File**: `app/page.tsx` (line 45)

```typescript
const description = 'Découvrez Maison Slimani, marque marocaine de chaussures homme haut de gamme. Collections exclusives de chaussures en cuir, livraison gratuite sur tout le Maroc.'
```

**Impact**: 
- ❌ Requires code changes to update
- ✅ Other SEO elements (URLs, structured data) are dynamic

---

### **3. Contact Page Description**
**File**: `app/contact/page.tsx` (line 39)

```typescript
const description = 'Contactez Maison Slimani pour toute question sur nos chaussures homme haut de gamme. Service client disponible pour vous accompagner.'
```

**Impact**: 
- ❌ Requires code changes to update
- ⚠️ Less critical (static page)

---

### **4. Maison Page Description**
**File**: `app/maison/page.tsx` (line 25)

```typescript
const description = "Découvrez l'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme. Un savoir-faire transmis de génération en génération."
```

**Impact**: 
- ❌ Requires code changes to update
- ⚠️ Less critical (static page)

---

## 📊 Summary Table

| Element | Source | Dynamic? | Admin Can Change? |
|---------|--------|----------|-------------------|
| **Product Name** | Database | ✅ Yes | ✅ Yes |
| **Product Description** | Database | ✅ Yes | ✅ Yes |
| **Product Image** | Database | ✅ Yes | ✅ Yes |
| **Product Price** | Database | ✅ Yes | ✅ Yes |
| **Product Stock** | Database | ✅ Yes | ✅ Yes |
| **Category Name** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Category Description** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Category Image** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Home Description** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Contact Description** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Maison Description** | Code (hardcoded) | ❌ No | ❌ No (needs code) |
| **Sitemap Products** | Database | ✅ Yes | ✅ Yes (auto-updates) |
| **URLs (canonical, OG)** | Dynamic | ✅ Yes | N/A |
| **Structured Data** | Database/Config | ✅ Yes | ✅ Yes (for products) |

---

## 🎯 What Changes with Admin Changes

### ✅ **Automatically Updates** (No Code Needed)
1. **Product Pages**: All SEO elements update when admin changes product data
2. **Sitemap**: Auto-updates when products are added/updated/deleted

### ❌ **Requires Code Changes**
1. **Category Names/Descriptions**: Update `categoriesConfig` in code
2. **Home/Contact/Maison Descriptions**: Update description strings in code

---

## 💡 To Make Everything Fully Dynamic

1. **Create `categories` table** in Supabase
2. **Add admin interface** to manage categories
3. **Fetch categories from database** in category pages
4. **Create `site_settings` table** for home/contact/maison descriptions
5. **Fetch site settings from database** in respective pages

