import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/core',
  rootDir: '../..',
  testMatch: [
    `<rootDir>/packages/core/**/*.spec.ts`
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/tests/",
    "/tests\\.e2e/"
  ]
};
export default config;
