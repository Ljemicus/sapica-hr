import { defineConfig } from '@playwright/test';

/**
 * Keep Playwright focused on browser tests.
 *
 * This repo also has older Vitest/Jest files named `*.test.*` in `tests/`,
 * `components/` and `lib/`. Without an explicit config, `npx playwright test`
 * tries to execute those unit/integration tests as Playwright specs and fails
 * before the browser suite can run.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.test\.ts/,
  testIgnore: [
    // Legacy Vitest/Supabase integration tests, not Playwright browser specs.
    'e2e-full.test.ts',
    'new-features.test.ts',
  ],
  fullyParallel: false,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  use: {
    trace: 'retain-on-failure',
  },
});
