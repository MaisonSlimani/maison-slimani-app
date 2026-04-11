import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete a guest checkout successfully from product page', async ({ page }) => {
    // 1. Visit Boutique
    console.log('Navigating to boutique...');
    await page.goto('/boutique/tous');
    
    // Wait for products to load
    console.log('Waiting for products...');
    const firstProduct = page.locator('a[href*="/boutique/"]:visible').first();
    await firstProduct.waitFor({ state: 'visible', timeout: 60000 });
    
    // 2. Go to Product Page
    console.log('Navigating to product page...');
    await firstProduct.click({ force: true });
    
    // 3. Select options if available and click "Achat Immédiat"
    console.log('Handling product selection...');
    const colorButton = page.locator('button[style*="background-color"]:visible').first();
    if (await colorButton.isVisible()) {
      await colorButton.click({ timeout: 15000 }).catch(() => console.log('Color click timed out, but continuing...'));
    }

    const sizeButton = page.locator('button:has-text("41"), button:has-text("42"), button:has-text("40"), button:has-text("S"), button:has-text("M")').filter({ visible: true }).first();
    if (await sizeButton.isVisible()) {
      await sizeButton.click({ timeout: 15000 }).catch(() => console.log('Size click timed out, but continuing...'));
    }

    // Use "Achat Immédiat" to skip cart and go straight to checkout
    console.log('Clicking Instant Buy...');
    const instantBuy = page.locator('button').filter({ hasText: /Achat Immédiat/i }).first();
    await instantBuy.waitFor({ state: 'visible', timeout: 30000 });
    await instantBuy.click({ force: true });
    
    // 4. Verify Checkout Page
    console.log('Verifying checkout page...');
    await page.waitForURL('**/checkout', { timeout: 30000 });
    
    // 5. Fill Checkout Form
    console.log('Filling checkout form...');
    await page.fill('#nom_client', 'Test User');
    await page.fill('#telephone', '0600000000');
    await page.fill('#adresse', '123 Test Street');
    await page.fill('#ville', 'Casablanca');
    
    // 6. Submit Order
    console.log('Submitting order...');
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // 7. Verify Success
    console.log('Verifying completion...');
    // The exact success URL or message might vary, but we expect progress or a status page
    await expect(page).toHaveURL(/.*success|.*confirmation|.*thank-you|.*commandes/, { timeout: 30000 });
  });
});
