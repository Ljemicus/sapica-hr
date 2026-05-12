import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/kalendar/dan PetPark groomer daily schedule visual baseline', () => {
  test('captures daily groomer schedule at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto(`${baseUrl}/kalendar/dan`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^dnevni raspored$/i }).first()).toBeVisible();
    await expect(page.getByText('Maks').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /danas u salonu/i })).toBeVisible();

    await expect(page).toHaveScreenshot('kalendar-dan-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
