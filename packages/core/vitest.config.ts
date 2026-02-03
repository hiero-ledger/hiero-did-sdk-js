import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // so you can keep `describe`, `it`, `expect`
    name: '@hiero-did-sdk/cache',
    include: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: [
      '../packages/cache',
      '../packages/core',
      '../packages/client',
      '../packages/crypto',
      '../packages/hcs',
      '../packages/zstd',
      '../tests',
    ],
  },
});
