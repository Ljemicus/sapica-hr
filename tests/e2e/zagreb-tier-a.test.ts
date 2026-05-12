import { test, expect } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('Cycle 19 — Zagreb Tier A', () => {
  test('public search renders the current PetPark v6 search hub', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga?city=Zagreb`);

    await expect(page.getByRole('heading', { name: /pretraži petpark/i })).toBeVisible();
    await expect(page.getByPlaceholder(/što tražite/i)).toBeVisible();
    await expect(page.getByPlaceholder(/grad ili kvart/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /pretraži/i })).toBeVisible();
  });

  test('Zagreb search keeps result and filter sections available', async ({ page }) => {
    await page.goto(`${baseUrl}/pretraga?city=Zagreb`);

    await expect(page.getByRole('heading', { name: /filteri/i })).toBeVisible();
    await expect(page.getByText(/pronađenih rezultata/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /usluge i provideri/i })).toBeVisible();
  });
});
