import { createDefaultEsmPreset, JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  projects: ['<rootDir>/packages/*/jest.config.ts'],
  coverageDirectory: 'coverage/',
  coverageReporters: ['json', 'text'],
  coveragePathIgnorePatterns: [
    '(tests/.*.mock).(js|ts)$',
    '(tests.e2e/.*.mock).(js|ts)$',
    'dist',
    'node_modules',
  ],
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/registrar/src/interfaces/index.ts',
    '!packages/resolver/src/interfaces/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  verbose: true,
  testLocationInResults: true,
  maxWorkers: '50%',
  ...createDefaultEsmPreset(),
};

export default config;
