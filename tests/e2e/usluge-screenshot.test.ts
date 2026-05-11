import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/usluge Figma v6 visual baseline', () => {
  test('captures marketplace listing at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1360 });
    await page.goto(`${baseUrl}/usluge`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /pronađi uslugu za svog ljubimca/i })).toBeVisible();
    await expect(page.getByText('Pronađeno 1.220 usluga')).toBeVisible();
    await expect(page.getByRole('link', { name: /pogledaj detalje/i }).first()).toHaveAttribute('href', /\/usluge\//);

    await expect(page).toHaveScreenshot('usluge-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
