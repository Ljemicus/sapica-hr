import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';
const slug = 'krpelji-buhe-zastita-ljubimca';

test.describe('/blog/[slug] smoke', () => {
  test('renders article detail', async ({ page }) => {
    await page.goto(`${baseUrl}/blog/${slug}`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Krpelji i buhe/ })).toBeVisible();
    await expect(page.getByText('Pitaj zajednicu').first()).toBeVisible();
    await expect(page.getByText('Nastavite čitati')).toBeVisible();
  });
});
