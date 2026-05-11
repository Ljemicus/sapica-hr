import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/usluge/[slug] Figma v6 visual baseline', () => {
  test('captures service detail at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1320 });
    await page.goto(`${baseUrl}/usluge/cuvanje-psa-u-kucnom-okruzenju`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /čuvanje psa u kućnom okruženju/i })).toBeVisible();
    await expect(page.getByText('25 EUR / dan')).toBeVisible();
    await expect(page.getByRole('button', { name: /rezerviraj sada/i })).toBeVisible();
    await expect(page.getByText('Tvoj čuvar')).toBeVisible();

    await expect(page).toHaveScreenshot('usluge-detail-1440.png', {
      animations: 'disabled',
      clip: { x: 0, y: 0, width: 1440, height: 1320 },
      maxDiffPixelRatio: 0.02,
    });
  });
});
