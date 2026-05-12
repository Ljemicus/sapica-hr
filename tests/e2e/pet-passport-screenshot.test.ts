import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/pet-passport PetPark passport visual baseline', () => {
  test('captures pet passport dashboard at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto(`${baseUrl}/pet-passport`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^pet passport$/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^maks$/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /zdravstveni podsjetnici/i })).toBeVisible();

    await expect(page).toHaveScreenshot('pet-passport-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
