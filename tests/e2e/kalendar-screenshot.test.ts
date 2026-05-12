import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/kalendar PetPark provider calendar visual baseline', () => {
  test('captures provider calendar at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1160 });
    await page.goto(`${baseUrl}/kalendar`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /kalendar i rezervacije/i })).toBeVisible();
    await expect(page.getByText('Svibanj 2026.')).toBeVisible();
    await expect(page.getByText('Današnji raspored')).toBeVisible();
    await expect(page.getByRole('button', { name: /blokiraj termin/i })).toBeVisible();

    await expect(page).toHaveScreenshot('kalendar-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
