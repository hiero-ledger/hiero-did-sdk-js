import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./packages/*/vitest.config.ts'],
    silent: 'passed-only',
    pool: 'forks',
    coverage: {
      reportOnFailure: true,
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{webpack,vite,vitest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/.prettierrc.mjs',
        '*.mts',
        '**/main.ts',
        '**/index.ts',
        '**/seed.ts',
        '*.mock.ts',
        'packages/*/libs/modules/**/dto/**',
        'packages/configs',
        'packages/*-prisma',
      ],
      clean: true,
      provider: 'v8',
      reporter: ['cobertura', 'text'],
    },
    reporters: ['junit', 'default'],
    outputFile: './coverage/junit.json',
  },
});
