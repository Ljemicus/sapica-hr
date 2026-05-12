import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/pet-passport/pdf PetPark PDF preview visual baseline', () => {
  test('captures pet passport PDF preview at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${baseUrl}/pet-passport/pdf`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /pet passport pdf i ispis/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^maks$/i })).toBeVisible();
    await expect(page.getByText('A4 PDF preview')).toBeVisible();

    await expect(page).toHaveScreenshot('pet-passport-pdf-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
