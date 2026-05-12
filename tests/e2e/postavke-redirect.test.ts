import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/postavke auth behavior', () => {
  test('redirects unauthenticated visitors to login with return path', async ({ page }) => {
    await page.goto(`${baseUrl}/postavke`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/prijava\?redirect=%2Fpostavke/);
    await expect(page.getByRole('heading', { name: /dobrodošli/i })).toBeVisible();
  });
});
