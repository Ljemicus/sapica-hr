import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/moje-usluge PetPark provider services visual baseline', () => {
  test('captures provider services dashboard at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1120 });
    await page.goto(`${baseUrl}/moje-usluge`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^moje usluge$/i }).first()).toBeVisible();
    await expect(page.getByText('Čuvanje psa u kućnom okruženju')).toBeVisible();
    await expect(page.getByText('Services table')).toBeVisible();

    await expect(page).toHaveScreenshot('moje-usluge-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
