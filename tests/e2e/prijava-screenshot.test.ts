import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/prijava PetPark auth visual baseline', () => {
  test('captures auth entry page at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.goto(`${baseUrl}/prijava`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^prijava$/i })).toBeVisible();
    await expect(page.getByRole('form', { name: /prijava u petpark/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^prijavi se$/i })).toBeVisible();
    await expect(page.getByText('Dobrodošli u PetPark zajednicu!')).toBeVisible();

    await expect(page).toHaveScreenshot('prijava-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
