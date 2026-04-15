import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete a guest checkout successfully from product page', async ({ page }) => {
    // 1. Visit Boutique
    await page.goto('/boutique/tous');
    
    // Wait for product links to load
    const firstProduct = page.locator('a[href*="/boutique/"]:visible').first();
    await firstProduct.waitFor({ state: 'visible', timeout: 60000 });
    
    // 2. Navigate to Product Page
    const productUrl = await firstProduct.getAttribute('href');
    if (!productUrl) throw new Error('Could not find product URL');
    
    await page.goto(productUrl);
    await page.waitForURL('**/boutique/*/*', { timeout: 30000 });

    // 3. Select color if required
    const colorSwatch = page.locator('button').filter({ hasText: /NOIR|Marron|Bleu|Blanc|Tabac/i }).first();
    if (await colorSwatch.isVisible({ timeout: 5000 }).catch(() => false)) {
      await colorSwatch.click();
      // Wait for the color to be visually selected (scale-110 is the selected indicator)
      await expect(colorSwatch).toHaveClass(/scale-110/, { timeout: 5000 });
    }

    // 4. Select size if required — wait for size buttons to re-render after color
    const sizeButton = page.locator('button').filter({ hasText: /^[0-9]{2,3}$/ })
      .filter({ has: page.locator(':not([disabled])') })
      .first();
    
    if (await sizeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await sizeButton.click();
      // Confirm the size button now has the selected style
      await expect(sizeButton).toHaveClass(/bg-charbon/, { timeout: 5000 });
    }

    // 5. Click "Achat Immédiat" (Buy Now)
    const buyNowButton = page
      .locator('button')
      .filter({ hasText: /Achat Immédiat/i })
      .first();
    
    await expect(buyNowButton).toBeVisible();
    await buyNowButton.click();

    // 6. Verify navigation to checkout
    await page.waitForURL('**/checkout', { timeout: 30000 });
    await expect(page.locator('h1')).toHaveText(/Finaliser votre commande/i);

    // 7. Fill Checkout Form
    await page.fill('#nom_client', 'Test User');
    await page.fill('#telephone', '0600000000');
    await page.fill('#adresse', '123 Test Street');
    await page.fill('#ville', 'Casablanca');

    // 8. Submit Order
    const submitButton = page.locator('button').filter({ hasText: /Confirmer la commande/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 9. Verify Success — redirects to confirmation page
    await expect(page).toHaveURL(/.*confirme|.*success|.*confirmation/, { timeout: 30000 });
  });
});
