import { createDefaultEsmPreset, JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  projects: ['<rootDir>/packages/*/jest.config.ts'],
  coverageDirectory: 'coverage/',
  coverageReporters: ['json', 'text'],
  coveragePathIgnorePatterns: [
    '(tests/.*.mock).(js|ts)$',
    'dist',
    'node_modules',
  ],
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/registrar/src/interfaces/index.ts',
    '!packages/registrar/src/update-did/sub-operations/*-service.ts', // TODO : Remove when all services are implemented
    '!packages/resolver/**/*.ts', // TODO : Remove when resolver is implemented
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: -10,
    },
  },
  verbose: true,
  testLocationInResults: true,
  maxWorkers: '50%',
  ...createDefaultEsmPreset(),
};

export default config;
