import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['node_modules', '.next', 'tests/e2e-full.test.ts', 'tests/new-features.test.ts'],
    server: {
      deps: {
        inline: ['@upstash/redis', '@upstash/ratelimit', 'dompurify', 'jsdom'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
});
