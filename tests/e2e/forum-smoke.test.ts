import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/forum smoke', () => {
  test('renders forum category hub', async ({ page }) => {
    await page.goto(`${baseUrl}/forum`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Forum za vlasnike ljubimaca' })).toBeVisible();
    await expect(page.getByPlaceholder('Pretraži forum...')).toBeVisible();
    await expect(page.getByText('Savjeti za njegu')).toBeVisible();
    await expect(page.getByText('Popularne teme')).toBeVisible();
  });
});
