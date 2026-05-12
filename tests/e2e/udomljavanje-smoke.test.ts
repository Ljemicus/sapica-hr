import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/udomljavanje smoke', () => {
  test('renders adoption hub', async ({ page }) => {
    await page.goto(`${baseUrl}/udomljavanje`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Udomi ljubimca' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Pogledaj ljubimce/ })).toBeVisible();
    await expect(page.getByText('Sigurno udomljavanje')).toBeVisible();
    await expect(page.getByText('Ljubimci za udomljavanje')).toBeVisible();
  });
});
