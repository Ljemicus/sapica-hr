import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/mapa smoke', () => {
  test('renders PetPark map preview', async ({ page }) => {
    await page.goto(`${baseUrl}/mapa`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PetPark mapa' })).toBeVisible();
    await expect(page.getByPlaceholder('Grad, kvart ili adresa')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'U blizini' })).toBeVisible();
    await expect(page.getByText('Odabrano')).toBeVisible();
  });
});
