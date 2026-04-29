import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.tsx'],
    exclude: ['node_modules', '.next', 'tests/e2e/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
      include: ['lib/auth/**', 'lib/payment.ts', 'lib/db/bookings.ts', 'app/api/payments/**'],
    },
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
