# SEO Audit Report - Maison Slimani

## ✅ What's Already Good

1. **Root Layout** (`app/layout.tsx`):
   - ✅ Has basic metadata (title, description, keywords)
   - ✅ Has Open Graph tags
   - ✅ Has Twitter card tags
   - ✅ Has robots meta tag
   - ✅ Has metadataBase URL

2. **Product Page** (`app/produit/[id]/page.tsx`):
   - ✅ Dynamic meta tags (title, description, OG tags)
   - ✅ Structured data (JSON-LD Schema.org Product)
   - ✅ Descriptive alt texts on images
   - ✅ Image preloading for performance

3. **Image Alt Texts**:
   - ✅ Product cards have product names
   - ✅ Gallery images have descriptive alt texts

---

## ❌ What's Missing (Critical SEO Issues)

### 1. **Home Page** (`app/page.tsx`)
**Status:** ❌ Client component - No SEO metadata

**Missing:**
- ❌ Dynamic meta tags (uses only default from layout)
- ❌ Page-specific title and description
- ❌ Structured data (Organization, Website, BreadcrumbList)
- ❌ Open Graph image for home page
- ⚠️ Some alt texts are generic ("Chaussures luxe Maison Slimani")

**What to add:**
```typescript
// Needs to be converted to server component OR use useEffect to add meta tags
- Title: "Maison Slimani - Chaussures Homme Luxe Maroc | Accueil"
- Description: "Découvrez Maison Slimani, marque marocaine de chaussures homme haut de gamme. Collections exclusives, livraison gratuite."
- Structured data: Organization, Website, BreadcrumbList
```

---

### 2. **Boutique Page** (`app/boutique/page.tsx`)
**Status:** ❌ Client component - No SEO metadata

**Missing:**
- ❌ Dynamic meta tags
- ❌ Page-specific title
- ❌ Structured data (CollectionPage)
- ❌ Canonical URL

**What to add:**
```typescript
- Title: "Boutique - Nos Collections | Maison Slimani"
- Description: "Découvrez nos collections exclusives: Classiques, Cuirs Exotiques, Éditions Limitées et Nouveautés."
- Structured data: CollectionPage schema
```

---

### 3. **Category Pages** (`app/boutique/[categorie]/page.tsx`)
**Status:** ❌ Client component - No dynamic SEO metadata

**Missing:**
- ❌ Dynamic meta tags per category
- ❌ Category-specific title and description
- ❌ Structured data (CollectionPage with category info)
- ❌ Canonical URL per category
- ❌ Breadcrumb structured data

**What to add:**
```typescript
// For each category:
- Classiques: "Classiques - Chaussures Homme Luxe | Maison Slimani"
- Cuirs Exotiques: "Cuirs Exotiques - Chaussures Homme Luxe | Maison Slimani"
- etc.
- Structured data: CollectionPage, BreadcrumbList
```

---

### 4. **Cart Page** (`app/panier/page.tsx`)
**Status:** ❌ Should be NOINDEX (not for search engines)

**Missing:**
- ❌ robots: noindex, nofollow meta tag
- ❌ Should not be indexed by search engines
- ❌ No structured data needed

**What to add:**
```typescript
- robots: { index: false, follow: false }
- Or use <meta name="robots" content="noindex, nofollow" />
```

---

### 5. **Favoris Page** (`app/favoris/page.tsx`)
**Status:** ❌ Should be NOINDEX (user-specific)

**Missing:**
- ❌ robots: noindex, nofollow meta tag
- ❌ Should not be indexed (user-specific content)

---

### 6. **Checkout Page** (`app/checkout/page.tsx`)
**Status:** ❌ Should be NOINDEX (transactional)

**Missing:**
- ❌ robots: noindex, nofollow meta tag
- ❌ Should not be indexed (transactional page)

---

### 7. **Contact Page** (`app/contact/page.tsx`)
**Status:** ❌ Client component - No SEO metadata

**Missing:**
- ❌ Dynamic meta tags
- ❌ Page-specific title
- ❌ Structured data (ContactPage, LocalBusiness)
- ❌ Contact information in structured format

**What to add:**
```typescript
- Title: "Contact - Maison Slimani"
- Description: "Contactez Maison Slimani pour toute question sur nos chaussures homme haut de gamme."
- Structured data: ContactPage, LocalBusiness (if you have physical address)
```

---

### 8. **Maison Page** (`app/maison/page.tsx`)
**Status:** ❌ Client component - No SEO metadata

**Missing:**
- ❌ Dynamic meta tags
- ❌ Page-specific title
- ❌ Structured data (AboutPage)
- ⚠️ Alt text is good ("Artisans Maison Slimani")

**What to add:**
```typescript
- Title: "Notre Maison - L'Histoire de Maison Slimani"
- Description: "Découvrez l'histoire et les valeurs de Maison Slimani, marque marocaine de chaussures homme haut de gamme."
- Structured data: AboutPage
```

---

## 🔧 Technical SEO Issues

### 1. **All Pages Are Client Components**
**Problem:** `'use client'` directive prevents using Next.js `generateMetadata()` function

**Solutions:**
- **Option A:** Convert to server components where possible
- **Option B:** Use `useEffect` to dynamically add meta tags (what product page does)
- **Option C:** Create a wrapper component that handles metadata

### 2. **Missing Sitemap**
**Status:** ❌ Not found

**What to add:**
- Create `app/sitemap.ts` or `public/sitemap.xml`
- Include all indexable pages
- Update frequency for each page type

### 3. **Missing robots.txt**
**Status:** ❌ Not found

**What to add:**
- Create `app/robots.ts` or `public/robots.txt`
- Allow/disallow specific paths
- Point to sitemap

### 4. **Missing Canonical URLs**
**Status:** ❌ Not implemented

**What to add:**
- Add canonical URL to all pages
- Prevents duplicate content issues
- Especially important for category/product pages

### 5. **Image Optimization**
**Status:** ⚠️ Partially good

**Issues:**
- Some generic alt texts
- Missing lazy loading on some images
- Could add more descriptive alt texts with context

---

## 📊 SEO Best Practices Checklist

### Meta Tags (Per Page)
- [ ] Unique title tag (50-60 characters)
- [ ] Unique meta description (150-160 characters)
- [ ] Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Twitter Card tags
- [ ] Canonical URL
- [ ] Robots meta tag (index/noindex)

### Structured Data (Schema.org)
- [ ] Home: Organization, Website, BreadcrumbList
- [ ] Category: CollectionPage, BreadcrumbList
- [ ] Product: Product (✅ Already done)
- [ ] Contact: ContactPage, LocalBusiness
- [ ] About: AboutPage

### Technical
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Canonical URLs
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Semantic HTML (nav, main, article, section)

### Content
- [ ] Unique, descriptive alt texts for all images
- [ ] Internal linking between pages
- [ ] Descriptive URLs (✅ Already good)
- [ ] Fast page load times (✅ Working on it)

---

## 🎯 Priority Actions

### High Priority (Do First)
1. ✅ Add meta tags to all pages (use useEffect approach)
2. ✅ Add structured data to home, category, and contact pages
3. ✅ Add noindex to cart, favoris, checkout pages
4. ✅ Create sitemap.ts
5. ✅ Create robots.ts

### Medium Priority
1. Improve alt texts to be more descriptive
2. Add canonical URLs
3. Add breadcrumb structured data
4. Optimize images further

### Low Priority
1. Convert some pages to server components for better SEO
2. Add more internal linking
3. Add rich snippets for reviews (if applicable)

---

## 📝 How to Learn More

### Resources
1. **Next.js SEO Guide:** https://nextjs.org/docs/app/building-your-application/optimizing/metadata
2. **Schema.org Documentation:** https://schema.org/
3. **Google Search Central:** https://developers.google.com/search/docs
4. **Open Graph Protocol:** https://ogp.me/

### Key Concepts to Understand

1. **Meta Tags:** HTML tags that provide metadata about your page
   - `<title>`: Page title (shown in browser tab and search results)
   - `<meta name="description">`: Page description (shown in search results)
   - `<meta property="og:*">`: Open Graph tags (for social media sharing)

2. **Structured Data (JSON-LD):** Machine-readable data that helps search engines understand your content
   - Schema.org provides standard formats
   - Helps with rich snippets in search results

3. **Client vs Server Components:**
   - Server components can use `generateMetadata()` for SEO
   - Client components need to use `useEffect` to add meta tags dynamically

4. **Indexing:**
   - Some pages (cart, checkout) should NOT be indexed
   - Use `robots: noindex` for private/user-specific pages

5. **Sitemap:**
   - XML file listing all your pages
   - Helps search engines discover and crawl your site

---

## 💡 Quick Fixes You Can Do Now

1. **Add noindex to cart/favoris/checkout:**
   ```typescript
   useEffect(() => {
     const meta = document.createElement('meta')
     meta.name = 'robots'
     meta.content = 'noindex, nofollow'
     document.head.appendChild(meta)
   }, [])
   ```

2. **Add basic meta tags to each page:**
   ```typescript
   useEffect(() => {
     document.title = 'Page Title | Maison Slimani'
     // Add description, OG tags, etc.
   }, [])
   ```

3. **Create sitemap.ts:**
   ```typescript
   export default function sitemap() {
     return [
       { url: 'https://maisonslimani.com', lastModified: new Date() },
       // ... more URLs
     ]
   }
   ```

