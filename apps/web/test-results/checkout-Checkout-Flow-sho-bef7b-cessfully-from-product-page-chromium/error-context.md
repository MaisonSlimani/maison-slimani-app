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
- generic [active] [ref=e1]:
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
          - generic [ref=e46]:
            - generic [ref=e47]:
              - text: Bottes & Bottines
              - heading "Monarch" [level=1] [ref=e48]
              - paragraph [ref=e49]: 320 DH
              - generic [ref=e50]:
                - heading [level=1]
                - paragraph [ref=e51]:
                  - strong [ref=e52]: MONARCH
                  - text: est une botte en
                  - strong [ref=e53]: cuir véritable
                  - text: au design moderne et raffiné, conçue pour offrir confort et style au quotidien.
                  - text: Sa
                  - strong [ref=e54]: semelle EVA ultra-légère
                  - text: assure une marche souple, amortie et agréable, tout en garantissant une excellente durabilité.
                - paragraph [ref=e55]:
                  - text: Disponible en
                  - strong [ref=e56]: Noir
                  - text: et
                  - strong [ref=e57]: Marron
                  - text: ", ce modèle allie élégance masculine, qualité premium et finition soignée."
            - generic [ref=e58]:
              - generic [ref=e59]:
                - text: Couleurs disponibles
                - generic [ref=e60]:
                  - button "NOIR" [ref=e61] [cursor=pointer]:
                    - generic [ref=e63]: NOIR
                  - button "Marron" [ref=e64] [cursor=pointer]:
                    - generic [ref=e66]: Marron
              - generic [ref=e67]:
                - generic [ref=e68]:
                  - generic [ref=e69]: Tailles
                  - button "Guide des tailles" [ref=e70] [cursor=pointer]
                - generic [ref=e71]:
                  - button "39" [ref=e72] [cursor=pointer]
                  - button "40" [ref=e73] [cursor=pointer]
                  - button "41" [ref=e74] [cursor=pointer]
                  - button "42" [ref=e75] [cursor=pointer]
                  - button "43" [ref=e76] [cursor=pointer]
                  - button "44" [ref=e77] [cursor=pointer]
                  - button "45" [ref=e78] [cursor=pointer]
              - generic [ref=e79]:
                - button "Ajouter au panier" [ref=e80] [cursor=pointer]:
                  - generic [ref=e81]:
                    - img
                    - generic [ref=e82]: Ajouter au panier
                - button [ref=e83] [cursor=pointer]:
                  - img
                - button "Achat Immédiat" [ref=e84] [cursor=pointer]:
                  - img
                  - generic [ref=e85]: Achat Immédiat
            - generic [ref=e86]:
              - generic [ref=e87]:
                - img [ref=e88]
                - generic [ref=e92]: Artisanat Marocain
              - generic [ref=e93]:
                - generic [ref=e94]: 24h
                - generic [ref=e95]: Livraison express
              - generic [ref=e96]:
                - generic [ref=e97]: 100%
                - generic [ref=e98]: Cuir véritable
        - generic [ref=e99]:
          - heading "Produits similaires" [level=2] [ref=e100]
          - generic [ref=e101]:
            - generic [ref=e102]:
              - heading "Découvrez aussi" [level=2] [ref=e103]
              - paragraph [ref=e104]: D'autres créations de la même catégorie
            - link "Voir toute la catégorie Bottes & Bottines" [ref=e106] [cursor=pointer]:
              - /url: /boutique/bottes-bottines
  - contentinfo [ref=e108]:
    - generic [ref=e109]:
      - generic [ref=e110]:
        - generic [ref=e111]:
          - heading "Maison Slimani" [level=3] [ref=e112]
          - paragraph [ref=e113]: L'excellence de la vannerie marocaine, entre tradition et modernité.
        - generic [ref=e114]:
          - heading "Navigation" [level=4] [ref=e115]
          - navigation [ref=e116]:
            - link "Accueil" [ref=e117] [cursor=pointer]:
              - /url: /
            - link "Boutique" [ref=e118] [cursor=pointer]:
              - /url: /boutique
            - link "La Maison" [ref=e119] [cursor=pointer]:
              - /url: /la-maison
            - link "Contact" [ref=e120] [cursor=pointer]:
              - /url: /contact
        - generic [ref=e121]:
          - heading "Informations" [level=4] [ref=e122]
          - navigation [ref=e123]:
            - link "FAQ" [ref=e124] [cursor=pointer]:
              - /url: /faq
            - link "Politique de Retour" [ref=e125] [cursor=pointer]:
              - /url: /politiques
        - generic [ref=e126]:
          - heading "Contact" [level=4] [ref=e127]
          - paragraph [ref=e128]: Informations de contact à venir
          - paragraph [ref=e129]: Livraison gratuite dans tout le Maroc
          - paragraph [ref=e130]: "Politique de retour : 7 jours"
      - generic [ref=e131]: © 2026 Maison Slimani. Tous droits réservés.
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e137] [cursor=pointer]:
    - img [ref=e138]
  - alert [ref=e141]
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