import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/izgubljeni smoke', () => {
  test('renders lost and found pets hub', async ({ page }) => {
    await page.goto(`${baseUrl}/izgubljeni`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Izgubljeni i pronađeni ljubimci' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Objavi upozorenje/ })).toBeVisible();
    await expect(page.getByText('Sigurnosna napomena')).toBeVisible();
    await expect(page.getByText('Aktivne objave')).toBeVisible();
  });
});
