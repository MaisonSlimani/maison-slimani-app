# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout.test.ts >> Checkout Flow >> should complete a guest checkout successfully from product page
- Location: test/e2e/checkout.test.ts:4:3

# Error details

```
Error: locator.waitFor: Test ended.
Call log:
  - waiting for locator('button').filter({ hasText: /Achat Immédiat/i }).first() to be visible

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Checkout Flow', () => {
  4  |   test('should complete a guest checkout successfully from product page', async ({ page }) => {
  5  |     // 1. Visit Boutique
  6  |     console.log('Navigating to boutique...');
  7  |     await page.goto('/boutique/tous');
  8  |     
  9  |     // Wait for products to load
  10 |     console.log('Waiting for products...');
  11 |     const firstProduct = page.locator('a[href*="/boutique/"]:visible').first();
  12 |     await firstProduct.waitFor({ state: 'visible', timeout: 60000 });
  13 |     
  14 |     // 2. Go to Product Page
  15 |     console.log('Navigating to product page...');
  16 |     await firstProduct.click({ force: true });
  17 |     
  18 |     // 3. Select options if available and click "Achat Immédiat"
  19 |     console.log('Handling product selection...');
  20 |     const colorButton = page.locator('button[style*="background-color"]:visible').first();
  21 |     if (await colorButton.isVisible()) {
  22 |       await colorButton.click({ timeout: 15000 }).catch(() => console.log('Color click timed out, but continuing...'));
  23 |     }
  24 | 
  25 |     const sizeButton = page.locator('button:has-text("41"), button:has-text("42"), button:has-text("40"), button:has-text("S"), button:has-text("M")').filter({ visible: true }).first();
  26 |     if (await sizeButton.isVisible()) {
  27 |       await sizeButton.click({ timeout: 15000 }).catch(() => console.log('Size click timed out, but continuing...'));
  28 |     }
  29 | 
  30 |     // Use "Achat Immédiat" to skip cart and go straight to checkout
  31 |     console.log('Clicking Instant Buy...');
  32 |     const instantBuy = page.locator('button').filter({ hasText: /Achat Immédiat/i }).first();
> 33 |     await instantBuy.waitFor({ state: 'visible', timeout: 30000 });
     |                      ^ Error: locator.waitFor: Test ended.
  34 |     await instantBuy.click({ force: true });
  35 |     
  36 |     // 4. Verify Checkout Page
  37 |     console.log('Verifying checkout page...');
  38 |     await page.waitForURL('**/checkout', { timeout: 30000 });
  39 |     
  40 |     // 5. Fill Checkout Form
  41 |     console.log('Filling checkout form...');
  42 |     await page.fill('#nom_client', 'Test User');
  43 |     await page.fill('#telephone', '0600000000');
  44 |     await page.fill('#adresse', '123 Test Street');
  45 |     await page.fill('#ville', 'Casablanca');
  46 |     
  47 |     // 6. Submit Order
  48 |     console.log('Submitting order...');
  49 |     const submitButton = page.locator('button[type="submit"]');
  50 |     await expect(submitButton).toBeEnabled();
  51 |     await submitButton.click();
  52 |     
  53 |     // 7. Verify Success
  54 |     console.log('Verifying completion...');
  55 |     // The exact success URL or message might vary, but we expect progress or a status page
  56 |     await expect(page).toHaveURL(/.*success|.*confirmation|.*thank-you|.*commandes/, { timeout: 30000 });
  57 |   });
  58 | });
  59 | 
```