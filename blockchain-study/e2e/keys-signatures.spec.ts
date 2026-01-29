import { test, expect } from '@playwright/test';

test.describe('Keys & Signatures Playground', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the section where Keys & Signatures component is located
        // Assuming it's on the main page, we might need to scroll to it or it's visible
        await page.goto('/');

        // Wait for the specific heading to ensure component is loaded
        await expect(page.getByRole('heading', { name: 'Keys & Signatures' })).toBeVisible();

        // Scroll the component into view to ensure clean screenshots
        await page.getByRole('heading', { name: 'Keys & Signatures' }).scrollIntoViewIfNeeded();
    });

    test('should look correct appropriately on initial load', async ({ page }) => {
        // The component auto-generates keys on mount, so we wait for keys to be populated
        await expect(page.locator('label', { hasText: 'Private Key' })).toBeVisible();
        // Public key format check (ensure it starts with 0x)
        await expect(page.locator('text=Public Key').locator('..').locator('.font-mono')).toContainText('0x');

        // Take a screenshot of the initial loaded state
        await expect(page.locator('.flex.flex-col.lg\\:flex-row')).toHaveScreenshot('initial-state.png', {
            maxDiffPixelRatio: 0.02 // Allow minor rendering differences
        });
    });

    test('should generate new identity', async ({ page }) => {
        // Get initial public key text
        const initialKey = await page.locator('text=Public Key').locator('..').locator('.font-mono').innerText();

        // Click Generate New ID
        await page.getByRole('button', { name: 'Generate New ID' }).click();

        // Wait for animation
        await page.waitForTimeout(500);

        // Wait for key to change (simple check that it's not "Generating...")
        await expect(page.locator('text=Public Key').locator('..').locator('.font-mono')).not.toHaveText('Generating...');

        // Take screenshot of new identity state
        await expect(page.locator('.flex.flex-col.lg\\:flex-row')).toHaveScreenshot('new-identity.png', {
            maxDiffPixelRatio: 0.02
        });
    });

    test('should add a new message', async ({ page }) => {
        // Click Create New Message
        await page.getByRole('button', { name: 'Create New Message' }).click();

        // Wait for animation
        await page.waitForTimeout(500);

        // assert message input appears
        await expect(page.getByPlaceholder('Type message...')).toBeVisible();

        // Take screenshot with new message
        await expect(page.locator('.flex.flex-col.lg\\:flex-row')).toHaveScreenshot('added-message.png', {
            maxDiffPixelRatio: 0.02
        });
    });

    test('should sign a message successfully', async ({ page }) => {
        // Ensure at least one message exists (there might be defaults or we add one)
        // Based on code, user must click add, but let's check if there are messsages first.
        // Actually the code initializes with empty messages array.
        await page.getByRole('button', { name: 'Create New Message' }).click();
        await page.waitForTimeout(500); // Wait for add animation

        // Click Sign button
        await page.getByRole('button', { name: 'Sign', exact: true }).click();

        // Wait for animation
        await page.waitForTimeout(500);

        // Expect "Signed" status
        await expect(page.getByText('Signed', { exact: true })).toBeVisible();

        // Take screenshot of signed state
        await expect(page.locator('.flex.flex-col.lg\\:flex-row')).toHaveScreenshot('signed-message.png', {
            maxDiffPixelRatio: 0.02
        });
    });
});
