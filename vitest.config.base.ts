import { defineProject } from 'vitest/config';
import path from 'path';

export default defineProject({
  resolve: {
    alias: [
      {
        find: /^@hiero-did-sdk\/(.*)$/,
        replacement: path.resolve(__dirname, 'packages') + '/$1/src',
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
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
    ],
    globals: true,
    isolate: true,
    sequence: {
      concurrent: false,
    },
    clearMocks: true,
    mockReset: true,
  },
});
