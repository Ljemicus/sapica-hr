import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1100 },
];

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3022';

const routes = [
  '/',
  '/usluge',
  '/usluge/cuvanje-psa-u-kucnom-okruzenju',
  '/objavi-uslugu',
  '/prijava',
  '/kalendar',
  '/grupni-treninzi',
  '/kalendar/dan',
  '/pet-passport',
  '/pet-passport/pdf',
  '/moje-usluge',
  '/poruke',
  '/profil',
  '/postavke',
  '/pretraga',
  '/zajednica',
  '/izgubljeni',
  '/udomljavanje',
  '/blog',
  '/forum',
  '/mapa',
  '/upozorenja',
  '/notifikacije',
];

test.describe('PetPark redesign responsive final gate', () => {
  for (const viewport of viewports) {
    test(`renders core routes without overflow on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of routes) {
        const response = await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
        expect(response?.status(), route).toBeLessThan(400);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.locator('body').innerText();
        expect(bodyText, route).not.toMatch(/Application error|Unhandled Runtime Error|Something went wrong/i);

        const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        expect(hasHorizontalOverflow, route).toBe(false);

        const isAuthRedirect = page.url().includes('/prijava?redirect=');
        if (!isAuthRedirect) {
          const headerLinkCount = await page.locator('header a[href]').count();
          expect(headerLinkCount, route).toBeGreaterThan(0);
        }
      }
    });
  }
});
