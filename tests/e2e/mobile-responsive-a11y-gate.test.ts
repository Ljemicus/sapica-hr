import { expect, test } from '@playwright/test';

const baseUrl = process.env.PETPARK_E2E_BASE_URL || 'http://127.0.0.1:3018';

const routes = [
  '/',
  '/usluge',
  '/objavi-uslugu',
  '/prijava',
  '/kalendar',
  '/kalendar/dan',
  '/moje-usluge',
  '/pretraga',
  '/zajednica',
  '/izgubljeni',
  '/udomljavanje',
  '/blog',
  '/forum',
  '/mapa',
];

const authRoutes = [
  ['/poruke', /\/prijava\?redirect=%2Fporuke/],
  ['/profil', /\/prijava\?redirect=%2Fprofil/],
  ['/postavke', /\/prijava\?redirect=%2Fpostavke/],
  ['/upozorenja', /\/prijava\?redirect=%2Fupozorenja/],
] as const;

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];

test.describe('PetPark responsive accessibility gate', () => {
  for (const viewport of viewports) {
    test.describe(viewport.name, () => {
      test.use({ viewport });

      for (const route of routes) {
        test(`${route} has no horizontal overflow and a main heading`, async ({ page }) => {
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });

          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow).toBeLessThanOrEqual(2);

          const headings = page.locator('h1');
          await expect(headings.first()).toHaveText(/\S/);
          await expect(headings).not.toHaveCount(0);
        });
      }

      for (const [route, expectedUrl] of authRoutes) {
        test(`${route} keeps auth redirect on ${viewport.name}`, async ({ page }) => {
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
          await expect(page).toHaveURL(expectedUrl);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow).toBeLessThanOrEqual(2);
        });
      }
    });
  }
});
