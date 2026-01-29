import { test, expect } from '@playwright/test';

test.describe('Network Playground', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the section
        await page.goto('/');
        // Wait for hydration
        await page.waitForTimeout(1000); // Give it a sec for animations/hydration

        // Scroll to network section
        const networkSection = page.locator('#network');
        await networkSection.scrollIntoViewIfNeeded();
        await expect(networkSection).toBeVisible();
    });

    test('should show initial network state', async ({ page }) => {
        const network = page.locator('#network');

        // Check for 4 nodes inside the network graph container
        // Nodes have rounded-full and text-lg font-bold
        const graph = network.locator('.sticky'); // The graph container is sticky
        await expect(graph.getByText('A', { exact: true })).toBeVisible();
        await expect(graph.getByText('B', { exact: true })).toBeVisible();
        await expect(graph.getByText('C', { exact: true })).toBeVisible();
        await expect(graph.getByText('D', { exact: true })).toBeVisible();

        // Take screenshot of the network section
        await expect(network).toHaveScreenshot('network-initial.png', {
            maxDiffPixelRatio: 0.05
        });
    });

    test('should select a node and show details', async ({ page }) => {
        const network = page.locator('#network');

        // Select Node B
        // Use the graph container to ensure we don't click text elsewhere
        await network.locator('.sticky').getByText('B', { exact: true }).click();

        // Check finding specific header
        await expect(network.getByRole('heading', { name: "Node B's Blockchain" })).toBeVisible();

        // Wait a bit for selection animation
        await page.waitForTimeout(500);

        await expect(network).toHaveScreenshot('network-node-b-selected.png', {
            maxDiffPixelRatio: 0.05
        });
    });

    test('should add and mine a block on a node', async ({ page }) => {
        const network = page.locator('#network');

        // Select Node A
        await network.locator('.sticky').getByText('A', { exact: true }).click();
        await page.waitForTimeout(500);

        // Click Add Block (ghost block)
        // Find it specifically inside the network section
        // It's a div with dashed border and a Plus icon
        await network.locator('.border-dashed').filter({ has: page.locator('svg') }).click();
        await page.waitForTimeout(500); // Animation

        // Check we have 2 blocks now (Block #1)
        // Scope to network section
        await expect(network.getByText('Block #1', { exact: true })).toBeVisible();

        // Take screenshot of unmined state
        await expect(network).toHaveScreenshot('network-node-a-added-block.png', {
            maxDiffPixelRatio: 0.05
        });

        // Click Mine on Block #1
        // Block #1 container:
        const block1 = network.locator('[data-test-key*=":1"]');
        await block1.getByRole('button', { name: 'Mine' }).click();

        // 1. Verify and Screenshot: Mining In Progress
        // Button should say "Mining..."
        await expect(block1.getByText('Mining...')).toBeVisible();
        await expect(network).toHaveScreenshot('network-node-a-mining-progress.png', {
            maxDiffPixelRatio: 0.05
        });

        // 2. Verify and Screenshot: Mining Complete
        // Button should go back to "Mine Block"
        // And block should be Valid
        await expect(block1.getByRole('button', { name: 'Mine Block' })).toBeVisible({ timeout: 15000 });
        await expect(block1.getByText('✓ Valid')).toBeVisible();

        // Wait a bit more for background green transition to fully settle
        await page.waitForTimeout(1000);

        await expect(network).toHaveScreenshot('network-node-a-mined-done.png', {
            maxDiffPixelRatio: 0.05
        });
    });

    test('should sync the network', async ({ page }) => {
        const network = page.locator('#network');

        // 1. Add block to Node A
        await network.locator('.sticky').getByText('A', { exact: true }).click();
        await page.waitForTimeout(300);
        await network.locator('.border-dashed').filter({ has: page.locator('svg') }).click();
        await page.waitForTimeout(300);

        // 2. Mine it
        const block1 = network.locator('[data-test-key*=":1"]');
        await block1.getByRole('button', { name: 'Mine' }).click();

        // Wait for mining to complete fully (button returns and valid tag appears)
        await expect(block1.getByRole('button', { name: 'Mine Block' })).toBeVisible({ timeout: 15000 });
        await expect(block1.getByText('✓ Valid')).toBeVisible();
        await page.waitForTimeout(5000); // Wait for background settlement

        // 3. Click Sync Network
        await network.getByRole('button', { name: 'Sync Network' }).click();

        // 4. Wait for sync animation
        await page.waitForTimeout(5000);

        await expect(network).toHaveScreenshot('network-synced.png', {
            maxDiffPixelRatio: 0.05
        });
    });
});
