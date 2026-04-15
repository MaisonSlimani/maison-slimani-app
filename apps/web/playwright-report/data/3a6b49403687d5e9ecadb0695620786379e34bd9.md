# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.test.ts >> Checkout Flow >> should complete a guest checkout successfully from product page
- Location: test/e2e/checkout.test.ts:4:3

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
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "Maison Slimani Maison Slimani" [ref=e4] [cursor=pointer]:
        - /url: /
        - img "Maison Slimani" [ref=e6]
        - heading "Maison Slimani" [level=1] [ref=e7]
      - generic [ref=e8]:
        - link "Accueil" [ref=e9] [cursor=pointer]:
          - /url: /
          - text: Accueil
        - link "Boutique" [ref=e10] [cursor=pointer]:
          - /url: /boutique
          - text: Boutique
        - link "La Maison" [ref=e11] [cursor=pointer]:
          - /url: /maison
          - text: La Maison
        - link "Contact" [ref=e12] [cursor=pointer]:
          - /url: /contact
          - text: Contact
      - generic [ref=e13]:
        - button "Rechercher" [ref=e14] [cursor=pointer]:
          - img
        - generic [ref=e15]:
          - button "Favoris" [ref=e16] [cursor=pointer]:
            - img
            - generic [ref=e17]: Favoris
          - button "Panier" [ref=e18] [cursor=pointer]:
            - img
            - generic [ref=e19]: Panier
  - main [ref=e20]:
    - main [ref=e21]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - img "Produit" [ref=e30]
              - button [ref=e31] [cursor=pointer]:
                - img [ref=e32]
              - button [ref=e34] [cursor=pointer]:
                - img [ref=e35]
            - generic [ref=e37]:
              - button "Miniature 1" [ref=e38] [cursor=pointer]:
                - img "Miniature 1" [ref=e39]
              - button "Miniature 2" [ref=e40] [cursor=pointer]:
                - img "Miniature 2" [ref=e41]
              - button "Miniature 3" [ref=e42] [cursor=pointer]:
                - img "Miniature 3" [ref=e43]
              - button "Miniature 4" [ref=e44] [cursor=pointer]:
                - img "Miniature 4" [ref=e45]
              - button "Miniature 5" [ref=e46] [cursor=pointer]:
                - img "Miniature 5" [ref=e47]
              - button "Miniature 6" [ref=e48] [cursor=pointer]:
                - img "Miniature 6" [ref=e49]
              - button "Miniature 7" [ref=e50] [cursor=pointer]:
                - img "Miniature 7" [ref=e51]
              - button "Miniature 8" [ref=e52] [cursor=pointer]:
                - img "Miniature 8" [ref=e53]
              - button "Miniature 9" [ref=e54] [cursor=pointer]:
                - img "Miniature 9" [ref=e55]
              - button "Miniature 10" [ref=e56] [cursor=pointer]:
                - img "Miniature 10" [ref=e57]
          - generic [ref=e58]:
            - generic [ref=e59]:
              - text: Bottes & Bottines
              - heading "Monarch" [level=1] [ref=e60]
              - paragraph [ref=e61]: 320 DH
              - generic [ref=e62]:
                - heading [level=1]
                - paragraph [ref=e63]:
                  - strong [ref=e64]: MONARCH
                  - text: est une botte en
                  - strong [ref=e65]: cuir véritable
                  - text: au design moderne et raffiné, conçue pour offrir confort et style au quotidien.
                  - text: Sa
                  - strong [ref=e66]: semelle EVA ultra-légère
                  - text: assure une marche souple, amortie et agréable, tout en garantissant une excellente durabilité.
                - paragraph [ref=e67]:
                  - text: Disponible en
                  - strong [ref=e68]: Noir
                  - text: et
                  - strong [ref=e69]: Marron
                  - text: ", ce modèle allie élégance masculine, qualité premium et finition soignée."
            - generic [ref=e70]:
              - generic [ref=e71]:
                - text: Couleurs disponibles
                - generic [ref=e72]:
                  - button "NOIR" [ref=e73] [cursor=pointer]:
                    - generic [ref=e75]: NOIR
                  - button "Marron" [ref=e76] [cursor=pointer]:
                    - generic [ref=e78]: Marron
              - generic [ref=e79]:
                - generic [ref=e80]:
                  - generic [ref=e81]: Tailles
                  - button "Guide des tailles" [ref=e82] [cursor=pointer]
                - generic [ref=e83]:
                  - button "39" [ref=e84] [cursor=pointer]
                  - button "40" [ref=e85] [cursor=pointer]
                  - button "41" [ref=e86] [cursor=pointer]
                  - button "42" [ref=e87] [cursor=pointer]
                  - button "43" [ref=e88] [cursor=pointer]
                  - button "44" [ref=e89] [cursor=pointer]
                  - button "45" [ref=e90] [cursor=pointer]
              - generic [ref=e91]:
                - button "Ajouter au panier" [ref=e92] [cursor=pointer]:
                  - generic [ref=e93]:
                    - img
                    - generic [ref=e94]: Ajouter au panier
                - button [ref=e95] [cursor=pointer]:
                  - img
                - button "Achat Immédiat" [active] [ref=e96] [cursor=pointer]:
                  - img
                  - generic [ref=e97]: Achat Immédiat
            - generic [ref=e98]:
              - generic [ref=e99]:
                - img [ref=e100]
                - generic [ref=e104]: Artisanat Marocain
              - generic [ref=e105]:
                - generic [ref=e106]: 24h
                - generic [ref=e107]: Livraison express
              - generic [ref=e108]:
                - generic [ref=e109]: 100%
                - generic [ref=e110]: Cuir véritable
        - generic [ref=e111]:
          - heading "Produits similaires" [level=2] [ref=e112]
          - generic [ref=e113]:
            - generic [ref=e114]:
              - heading "Découvrez aussi" [level=2] [ref=e115]
              - paragraph [ref=e116]: D'autres créations de la même catégorie
            - link "Voir toute la catégorie Bottes & Bottines" [ref=e118] [cursor=pointer]:
              - /url: /boutique/bottes-bottines
  - contentinfo [ref=e120]:
    - generic [ref=e121]:
      - generic [ref=e122]:
        - generic [ref=e123]:
          - heading "Maison Slimani" [level=3] [ref=e124]
          - paragraph [ref=e125]: L'excellence de la vannerie marocaine, entre tradition et modernité.
        - generic [ref=e126]:
          - heading "Navigation" [level=4] [ref=e127]
          - navigation [ref=e128]:
            - link "Accueil" [ref=e129] [cursor=pointer]:
              - /url: /
            - link "Boutique" [ref=e130] [cursor=pointer]:
              - /url: /boutique
            - link "La Maison" [ref=e131] [cursor=pointer]:
              - /url: /la-maison
            - link "Contact" [ref=e132] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e133]:
          - heading "Informations" [level=4] [ref=e134]
          - navigation [ref=e135]:
            - link "FAQ" [ref=e136] [cursor=pointer]:
              - /url: /faq
            - link "Politique de Retour" [ref=e137] [cursor=pointer]:
              - /url: /politiques
        - generic [ref=e138]:
          - heading "Contact" [level=4] [ref=e139]
          - paragraph [ref=e140]: Informations de contact à venir
          - paragraph [ref=e141]: Livraison gratuite dans tout le Maroc
          - paragraph [ref=e142]: "Politique de retour : 7 jours"
      - generic [ref=e143]: © 2026 Maison Slimani. Tous droits réservés.
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e149] [cursor=pointer]:
    - img [ref=e150]
  - alert [ref=e153]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Checkout Flow', () => {
  4  |   test('should complete a guest checkout successfully from product page', async ({ page }) => {
  5  |     // 1. Visit Boutique
  6  |     await page.goto('/boutique/tous');
  7  |     
  8  |     // Wait for product links to load
  9  |     const firstProduct = page.locator('a[href*="/boutique/"]:visible').first();
  10 |     await firstProduct.waitFor({ state: 'visible', timeout: 60000 });
  11 |     
  12 |     // 2. Navigate to Product Page
  13 |     const productUrl = await firstProduct.getAttribute('href');
  14 |     if (!productUrl) throw new Error('Could not find product URL');
  15 |     
  16 |     await page.goto(productUrl);
  17 |     await page.waitForURL('**/boutique/*/*', { timeout: 30000 });
  18 | 
  19 |     // 3. Select color if required
  20 |     const colorSwatch = page.locator('button').filter({ hasText: /NOIR|Marron|Bleu|Blanc|Tabac/i }).first();
  21 |     if (await colorSwatch.isVisible({ timeout: 5000 }).catch(() => false)) {
  22 |       await colorSwatch.click();
  23 |       // Wait for the color to be visually selected (scale-110 is the selected indicator)
  24 |       await expect(colorSwatch).toHaveClass(/scale-110/, { timeout: 5000 });
  25 |     }
  26 | 
  27 |     // 4. Select size if required — wait for size buttons to re-render after color
  28 |     const sizeButton = page.locator('button').filter({ hasText: /^[0-9]{2,3}$/ })
  29 |       .filter({ has: page.locator(':not([disabled])') })
  30 |       .first();
  31 |     
  32 |     if (await sizeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
  33 |       await sizeButton.click();
  34 |       // Confirm the size button now has the selected style
  35 |       await expect(sizeButton).toHaveClass(/bg-charbon/, { timeout: 5000 });
  36 |     }
  37 | 
  38 |     // 5. Click "Achat Immédiat" (Buy Now)
  39 |     const buyNowButton = page
  40 |       .locator('button')
  41 |       .filter({ hasText: /Achat Immédiat/i })
  42 |       .first();
  43 |     
  44 |     await expect(buyNowButton).toBeVisible();
  45 |     await buyNowButton.click();
  46 | 
  47 |     // 6. Verify navigation to checkout
> 48 |     await page.waitForURL('**/checkout', { timeout: 30000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  49 |     await expect(page.locator('h1')).toHaveText(/Finaliser votre commande/i);
  50 | 
  51 |     // 7. Fill Checkout Form
  52 |     await page.fill('#nom_client', 'Test User');
  53 |     await page.fill('#telephone', '0600000000');
  54 |     await page.fill('#adresse', '123 Test Street');
  55 |     await page.fill('#ville', 'Casablanca');
  56 | 
  57 |     // 8. Submit Order
  58 |     const submitButton = page.locator('button').filter({ hasText: /Confirmer la commande/i });
  59 |     await expect(submitButton).toBeEnabled();
  60 |     await submitButton.click();
  61 | 
  62 |     // 9. Verify Success — redirects to confirmation page
  63 |     await expect(page).toHaveURL(/.*confirme|.*success|.*confirmation/, { timeout: 30000 });
  64 |   });
  65 | });
  66 | 
```