import { test, expect } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('Cycle 19 — Zagreb Tier A', () => {
  test('public search is fast and captures waitlist demand', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga?grad=Zagreb`);

    await expect(page.getByRole('heading', { name: /pronađite pravu brigu/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /prijavi interes/i })).toBeVisible();
    await expect(page.locator('form[action="/api/waitlist"]')).toBeVisible();
  });

  test('Zagreb Tier A provider inventory gate', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga?grad=Zagreb`);

    const providerCards = page.locator('[data-testid="provider-card"]');
    await expect(providerCards).toHaveCount(5, { timeout: 1_000 });
  });
});
