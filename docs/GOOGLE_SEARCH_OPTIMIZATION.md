# Google Search Optimization Guide

## 🖼️ Product Images in Search Results

### How Google Shows Product Images

Google automatically displays product images in search results when:
1. Your product pages have proper **Product structured data (Schema.org)**
2. Images are high-quality and properly formatted
3. Images are accessible (not blocked by robots.txt)
4. Your site has good authority/trust

### What We've Implemented

✅ **Enhanced Product Schema** - Both `/produit/[id]` and `/produits/[slug]` pages now include:
- Multiple product images (array format)
- Absolute image URLs (required by Google)
- Product SKU, category, brand information
- Offer details (price, currency, availability, condition)
- Price validity date

### How to Verify

1. **Test with Google Rich Results Test:**
   - Go to: https://search.google.com/test/rich-results
   - Enter your product page URL
   - Check for "Product" structured data

2. **Check Google Search Console:**
   - Go to: https://search.google.com/search-console
   - Navigate to "Enhancements" > "Products"
   - See which products are detected

3. **View Page Source:**
   - Look for `<script type="application/ld+json">` with `@type: "Product"`
   - Verify images are absolute URLs (starting with `https://`)

### Tips to Improve Image Display

1. **Image Quality:**
   - Use high-resolution images (at least 1200x1200px)
   - Optimize file size (use WebP format when possible)
   - Ensure images load quickly

2. **Image Content:**
   - Use clear product photos on white/neutral backgrounds
   - Show product from multiple angles
   - Include lifestyle images if relevant

3. **Image URLs:**
   - Always use absolute URLs in structured data
   - Ensure images are publicly accessible
   - Don't block images in robots.txt

4. **Multiple Images:**
   - Include 3-5 product images in the schema
   - Google may choose the best one to display

---

## 🔗 Sitelinks (Links Under Main Search Result)

### What Are Sitelinks?

Sitelinks are the indented links that appear under your main search result (like in the Adidas example). They help users navigate directly to important pages.

### Important: You Cannot Directly Control Sitelinks

Google **automatically generates** sitelinks based on:
- Site structure and navigation
- Internal linking patterns
- Page importance and authority
- User behavior data
- XML sitemap structure

### How to Influence Sitelinks

While you can't control which links appear, you can **influence** them:

#### 1. **Clear Site Structure** ✅
- We have a clear navigation menu with main pages:
  - `/` (Accueil)
  - `/boutique` (Boutique)
  - `/maison` (La Maison)
  - `/contact` (Contact)

#### 2. **XML Sitemap** ✅
- We have `app/sitemap.ts` that includes:
  - All static pages with priorities
  - All product pages
  - Proper `lastModified` dates
  - Change frequencies

#### 3. **Internal Linking**
- Ensure important pages are linked from:
  - Main navigation
  - Footer
  - Homepage
  - Category pages

#### 4. **Breadcrumbs** ✅
- We have BreadcrumbList structured data on:
  - Homepage
  - Category pages
  - Product pages (via navigation)

#### 5. **Page Hierarchy**
- Use clear URL structure:
  - `/boutique` (main category)
  - `/boutique/classiques` (subcategory)
  - `/produits/[slug]` (product)

#### 6. **Site Authority**
- Build domain authority through:
  - Quality content
  - Backlinks
  - Consistent updates
  - Good user experience

### What Pages Typically Get Sitelinks

Google usually shows sitelinks for:
- Main navigation items (Home, Shop, About, Contact)
- Popular category pages
- Important sub-pages
- Pages with high traffic

### How Long Does It Take?

- Sitelinks typically appear **after your site gains trust**
- Usually takes **weeks to months** of consistent performance
- Not guaranteed - depends on Google's algorithm

### How to Check

1. **Google Search Console:**
   - Go to "Performance" report
   - Look for "Sitelinks" in search results

2. **Manual Search:**
   - Search for "site:maison-slimani.com" on Google
   - Check if sitelinks appear under your main result

3. **Rich Results Test:**
   - Test your homepage
   - Check for "Sitelinks Search Box" structured data (optional)

---

## 📋 Checklist for Better Search Results

### Product Images
- [x] Product structured data with multiple images
- [x] Absolute image URLs
- [ ] Verify with Rich Results Test
- [ ] Monitor Google Search Console
- [ ] Optimize image file sizes
- [ ] Add alt text to all product images

### Sitelinks
- [x] Clear navigation structure
- [x] XML sitemap with priorities
- [x] Breadcrumb structured data
- [ ] Internal linking from homepage
- [ ] Footer links to important pages
- [ ] Consistent URL structure
- [ ] Build domain authority

---

## 🚀 Next Steps

1. **Submit sitemap to Google Search Console:**
   - Add property: `https://maison-slimani.com`
   - Submit sitemap: `https://maison-slimani.com/sitemap.xml`

2. **Monitor Rich Results:**
   - Check Google Search Console regularly
   - Fix any structured data errors
   - Monitor which products show images

3. **Build Authority:**
   - Create quality content
   - Get backlinks from reputable sites
   - Maintain consistent updates
   - Ensure fast page load times

4. **Be Patient:**
   - Product images may appear within days/weeks
   - Sitelinks typically take longer (weeks/months)
   - Google needs to crawl and index your site

---

## 📚 Resources

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)
- [Product Structured Data Guide](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Sitelinks Best Practices](https://developers.google.com/search/docs/appearance/sitelinks)

