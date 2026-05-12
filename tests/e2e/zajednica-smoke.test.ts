import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/zajednica smoke', () => {
  test('renders PetPark community hub', async ({ page }) => {
    await page.goto(`${baseUrl}/zajednica`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PetPark zajednica' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nova objava/ }).first()).toBeVisible();
    await expect(page.getByText('Popularne teme')).toBeVisible();
    await expect(page.getByText('Objave i preporuke')).toBeVisible();
  });
});
