import { defineProject } from 'vitest/config';
import path from 'path';

export default defineProject({
  resolve: {
    alias: [
      {
        find: /^@hiero-did-sdk\/(.*)$/,
        replacement: path.resolve(__dirname, 'packages') + '/$1/src',
      },
      {
        // Properly resolve deep imports from Hiero SDK JS
        find: /^@hashgraph\/sdk\/(.*)$/,
        replacement: path.resolve(__dirname, 'node_modules', '@hashgraph/sdk') + '/$1',
      },
    ],
  },
  test: {
    hookTimeout: 30000,
    testTimeout: 30000,
    include: ['**/*.spec.ts', '**/*.e2e.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{webpack,vite,vitest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
    ],
    globals: true,
    isolate: true,
    sequence: {
      concurrent: false,
    },
    clearMocks: true,
    mockReset: false,
  },
});
