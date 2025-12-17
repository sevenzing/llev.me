import { test, expect } from '@playwright/test';

test.describe('Blockchain Playground (Large Blocks)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for hydration
        await page.waitForLoadState('networkidle');
    });

    test('should show initial blockchain state with large blocks', async ({ page }) => {
        const blockchain = page.locator('#chain');
        await expect(blockchain).toBeVisible();

        // Check for Large Block dimensions
        // Large blocks are typically wider (w-80) than small ones (w-64)
        // We rely on visual snapshot to verify exact 422px height if content fills it

        // Take screenshot of entire section
        await expect(blockchain).toHaveScreenshot('blockchain-initial.png', {
            maxDiffPixelRatio: 0.05
        });
    });


});
