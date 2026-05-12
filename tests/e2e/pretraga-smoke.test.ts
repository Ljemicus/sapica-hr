import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/pretraga smoke', () => {
  test('renders universal search hub with no query', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Pretraži PetPark' })).toBeVisible();
    await expect(page.getByPlaceholder('Što tražite?')).toBeVisible();
    await expect(page.getByRole('button', { name: /Usluge/ })).toBeVisible();
  });

  test('renders with supported category and city params', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga?category=usluge&city=Zagreb`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Pretraži PetPark' })).toBeVisible();
    await expect(page.getByText('Usluge i provideri')).toBeVisible();
    await expect(page.getByText('Zagreb').first()).toBeVisible();
  });
});
