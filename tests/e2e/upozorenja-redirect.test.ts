import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/upozorenja auth behavior', () => {
  test('redirects unauthenticated visitors to login with return path', async ({ page }) => {
    await page.goto(`${baseUrl}/upozorenja`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/prijava\?redirect=%2Fupozorenja/);
    await expect(page.getByRole('heading', { name: /dobrodošli/i })).toBeVisible();
  });

  test('/notifikacije resolves through alerts auth redirect', async ({ page }) => {
    await page.goto(`${baseUrl}/notifikacije`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/prijava\?redirect=%2Fupozorenja/);
    await expect(page.getByRole('heading', { name: /dobrodošli/i })).toBeVisible();
  });
});
