# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-mobile.test.ts >> Mobile Checkout Flow >> should complete a guest checkout from mobile product page
- Location: test/e2e/checkout-mobile.test.ts:6:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/checkout" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Maison Slimani Maison Slimani" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Maison Slimani" [ref=e7]
        - heading "Maison Slimani" [level=1] [ref=e8]
      - generic [ref=e9]:
        - link "Favoris" [ref=e10] [cursor=pointer]:
          - /url: /favoris
          - img
          - generic [ref=e11]: Favoris
        - button "Panier" [ref=e12] [cursor=pointer]:
          - img
          - generic [ref=e13]: Panier
  - main [ref=e14]:
    - main [ref=e15]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]:
              - img "Produit" [ref=e22]
              - button [ref=e23] [cursor=pointer]:
                - img [ref=e24]
              - button [ref=e26] [cursor=pointer]:
                - img [ref=e27]
            - generic [ref=e29]:
              - button "Miniature 1" [ref=e30] [cursor=pointer]:
                - img "Miniature 1" [ref=e31]
              - button "Miniature 2" [ref=e32] [cursor=pointer]:
                - img "Miniature 2" [ref=e33]
              - button "Miniature 3" [ref=e34] [cursor=pointer]:
                - img "Miniature 3" [ref=e35]
              - button "Miniature 4" [ref=e36] [cursor=pointer]:
                - img "Miniature 4" [ref=e37]
              - button "Miniature 5" [ref=e38] [cursor=pointer]:
                - img "Miniature 5" [ref=e39]
              - button "Miniature 6" [ref=e40] [cursor=pointer]:
                - img "Miniature 6" [ref=e41]
              - button "Miniature 7" [ref=e42] [cursor=pointer]:
                - img "Miniature 7" [ref=e43]
              - button "Miniature 8" [ref=e44] [cursor=pointer]:
                - img "Miniature 8" [ref=e45]
              - button "Miniature 9" [ref=e46] [cursor=pointer]:
                - img "Miniature 9" [ref=e47]
              - button "Miniature 10" [ref=e48] [cursor=pointer]:
                - img "Miniature 10" [ref=e49]
          - button [ref=e50] [cursor=pointer]:
            - img [ref=e51]
        - generic [ref=e53]:
          - generic [ref=e54]:
            - heading "Monarch" [level=1] [ref=e55]
            - paragraph [ref=e56]: 320 DH
          - generic [ref=e57]:
            - heading [level=1]
            - paragraph [ref=e58]:
              - strong [ref=e59]: MONARCH
              - text: est une botte en
              - strong [ref=e60]: cuir véritable
              - text: au design moderne et raffiné, conçue pour offrir confort et style au quotidien.
              - text: Sa
              - strong [ref=e61]: semelle EVA ultra-légère
              - text: assure une marche souple, amortie et agréable, tout en garantissant une excellente durabilité.
            - paragraph [ref=e62]:
              - text: Disponible en
              - strong [ref=e63]: Noir
              - text: et
              - strong [ref=e64]: Marron
              - text: ", ce modèle allie élégance masculine, qualité premium et finition soignée."
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: "Couleur: NOIR"
              - generic [ref=e68]:
                - button [ref=e69] [cursor=pointer]
                - button [ref=e71] [cursor=pointer]
            - generic [ref=e73]:
              - text: Taille
              - generic [ref=e74]:
                - button "39" [ref=e75] [cursor=pointer]
                - button "40" [ref=e76] [cursor=pointer]
                - button "41" [ref=e77] [cursor=pointer]
                - button "42" [ref=e78] [cursor=pointer]
                - button "43" [ref=e79] [cursor=pointer]
                - button "44" [ref=e80] [cursor=pointer]
                - button "45" [ref=e81] [cursor=pointer]
            - generic [ref=e82]:
              - button "Ajouter au panier" [ref=e83] [cursor=pointer]:
                - generic [ref=e84]:
                  - img
                  - generic [ref=e85]: Ajouter au panier
              - button [active] [ref=e86] [cursor=pointer]:
                - img
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "Découvrez aussi" [level=2] [ref=e89]
            - paragraph [ref=e90]: D'autres créations de la même catégorie
          - link "Voir toute la catégorie Bottes & Bottines" [ref=e92] [cursor=pointer]:
            - /url: /boutique/bottes-bottines
  - navigation [ref=e93]:
    - generic [ref=e96]:
      - link "Accueil" [ref=e97] [cursor=pointer]:
        - /url: /
        - img [ref=e99]
        - generic [ref=e102]: Accueil
      - link "Collections" [ref=e103] [cursor=pointer]:
        - /url: /boutique
        - img [ref=e105]
        - generic [ref=e108]: Collections
      - link [ref=e109] [cursor=pointer]:
        - /url: /boutique/tous
        - img [ref=e111]
      - link "Panier" [ref=e116] [cursor=pointer]:
        - /url: /panier
        - img [ref=e118]
        - generic [ref=e122]: Panier
      - link "Menu" [ref=e123] [cursor=pointer]:
        - /url: /menu
        - img [ref=e125]
        - generic [ref=e126]: Menu
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e132] [cursor=pointer]:
    - img [ref=e133]
  - alert [ref=e136]
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({ ...devices['iPhone 13'], browserName: 'chromium' });
  4  | 
  5  | test.describe('Mobile Checkout Flow', () => {
  6  |   test('should complete a guest checkout from mobile product page', async ({ page }) => {
  7  |     // 1. Visit Boutique
  8  |     await page.goto('/boutique/tous');
  9  | 
  10 |     // Wait for product links to appear
  11 |     const productLink = page.locator('a[href*="/boutique/"]:visible').first();
  12 |     await productLink.waitFor({ state: 'visible', timeout: 60000 });
  13 | 
  14 |     // 2. Navigate to Product Page
  15 |     const productUrl = await productLink.getAttribute('href');
  16 |     if (!productUrl) throw new Error('Could not find product URL');
  17 |     await page.goto(productUrl);
  18 | 
  19 |     // 3. Select color if available
  20 |     const colorSwatch = page.locator('button')
  21 |       .filter({ hasText: /NOIR|Marron|Bleu|Blanc|Tabac/i })
  22 |       .first();
  23 | 
  24 |     if (await colorSwatch.isVisible({ timeout: 5000 }).catch(() => false)) {
  25 |       await colorSwatch.click();
  26 |       await expect(colorSwatch).toHaveClass(/scale-110|border-charbon/, { timeout: 5000 });
  27 |     }
  28 | 
  29 |     // 4. Select size if available — wait for re-render after color
  30 |     const sizeButton = page.locator('button')
  31 |       .filter({ hasText: /^[0-9]{2,3}$/ })
  32 |       .filter({ has: page.locator(':not([disabled])') })
  33 |       .first();
  34 | 
  35 |     if (await sizeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
  36 |       await sizeButton.click();
  37 |       await expect(sizeButton).toHaveClass(/bg-charbon/, { timeout: 5000 });
  38 |     }
  39 | 
  40 |     // 5. Click the ShoppingCart icon button (Buy Now) on mobile
  41 |     // On mobile, the "Achat Immédiat" button only shows a cart icon
  42 |     const buyNowButton = page
  43 |       .locator('button')
  44 |       .filter({ has: page.locator('.lucide-shopping-cart') })
  45 |       .first();
  46 | 
  47 |     await expect(buyNowButton).toBeVisible();
  48 |     await buyNowButton.click();
  49 | 
  50 |     // 6. Verify checkout page
> 51 |     await page.waitForURL('**/checkout', { timeout: 30000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  52 |     await expect(page.locator('h1')).toHaveText(/Finaliser la commande/i);
  53 | 
  54 |     // 7. Fill Checkout Form
  55 |     await page.fill('#nom_client', 'Mobile User');
  56 |     await page.fill('#telephone', '0611111111');
  57 |     await page.fill('#adresse', '456 Mobile Road');
  58 |     await page.fill('#ville', 'Marrakech');
  59 | 
  60 |     // 8. Submit Order
  61 |     const submitButton = page.locator('button').filter({ hasText: /Confirmer la Commande/i });
  62 |     await expect(submitButton).toBeEnabled();
  63 |     await submitButton.click();
  64 | 
  65 |     // 9. Verify Success
  66 |     await expect(page).toHaveURL(/.*confirme|.*success|.*confirmation/, { timeout: 30000 });
  67 |   });
  68 | });
  69 | 
```