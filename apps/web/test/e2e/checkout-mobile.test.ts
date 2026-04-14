import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'], browserName: 'chromium' });

test.describe('Mobile Checkout Flow', () => {
  test('should complete a guest checkout from mobile product page', async ({ page }) => {
    // 1. Visit Boutique
    await page.goto('/boutique/tous');

    // Wait for product links to appear
    const productLink = page.locator('a[href*="/boutique/"]:visible').first();
    await productLink.waitFor({ state: 'visible', timeout: 60000 });

    // 2. Navigate to Product Page
    const productUrl = await productLink.getAttribute('href');
    if (!productUrl) throw new Error('Could not find product URL');
    await page.goto(productUrl);

    // 3. Select color if available
    const colorSwatch = page.locator('button')
      .filter({ hasText: /NOIR|Marron|Bleu|Blanc|Tabac/i })
      .first();

    if (await colorSwatch.isVisible({ timeout: 5000 }).catch(() => false)) {
      await colorSwatch.click();
      await expect(colorSwatch).toHaveClass(/scale-110|border-charbon/, { timeout: 5000 });
    }

    // 4. Select size if available — wait for re-render after color
    const sizeButton = page.locator('button')
      .filter({ hasText: /^[0-9]{2,3}$/ })
      .filter({ has: page.locator(':not([disabled])') })
      .first();

    if (await sizeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sizeButton.click();
      await expect(sizeButton).toHaveClass(/bg-charbon/, { timeout: 5000 });
    }

    // 5. Click the ShoppingCart icon button (Buy Now) on mobile
    // On mobile, the "Achat Immédiat" button only shows a cart icon
    const buyNowButton = page
      .locator('button')
      .filter({ has: page.locator('.lucide-shopping-cart') })
      .first();

    await expect(buyNowButton).toBeVisible();
    await buyNowButton.click();

    // 6. Verify checkout page
    await page.waitForURL('**/checkout', { timeout: 30000 });
    await expect(page.locator('h1')).toHaveText(/Finaliser la commande/i);

    // 7. Fill Checkout Form
    await page.fill('#nom_client', 'Mobile User');
    await page.fill('#telephone', '0611111111');
    await page.fill('#adresse', '456 Mobile Road');
    await page.fill('#ville', 'Marrakech');

    // 8. Submit Order
    const submitButton = page.locator('button').filter({ hasText: /Confirmer la Commande/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 9. Verify Success
    await expect(page).toHaveURL(/.*confirme|.*success|.*confirmation/, { timeout: 30000 });
  });
});
