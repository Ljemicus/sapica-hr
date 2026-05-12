import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/blog smoke', () => {
  test('renders blog advice listing', async ({ page }) => {
    await page.goto(`${baseUrl}/blog`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PetPark savjeti' })).toBeVisible();
    await expect(page.getByPlaceholder('Pretraži savjete...')).toBeVisible();
    await expect(page.getByText('Popularni članci')).toBeVisible();
  });

  test('renders category query', async ({ page }) => {
    await page.goto(`${baseUrl}/blog?category=zdravlje`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'PetPark savjeti' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zdravlje' })).toBeVisible();
  });
});
