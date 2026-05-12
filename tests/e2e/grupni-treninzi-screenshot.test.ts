import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/grupni-treninzi PetPark group trainings visual baseline', () => {
  test('captures group trainings page at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto(`${baseUrl}/grupni-treninzi`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^grupni treninzi$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /novi termin/i }).first()).toHaveAttribute('href', '/kalendar');
    await expect(page.getByRole('heading', { name: /puppy socijalizacija/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /rezerviraj točan trening/i })).toBeVisible();

    await expect(page).toHaveScreenshot('grupni-treninzi-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
