import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

test.describe('/objavi-uslugu code-first v6 visual baseline', () => {
  test('captures publish service onboarding at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1360 });
    await page.goto(`${baseUrl}/objavi-uslugu`, { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: /^objavi uslugu$/i })).toBeVisible();
    await expect(page.getByRole('form', { name: /objava usluge/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pripremi nacrt/i })).toBeVisible();

    await expect(page).toHaveScreenshot('objavi-uslugu-1440.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});
