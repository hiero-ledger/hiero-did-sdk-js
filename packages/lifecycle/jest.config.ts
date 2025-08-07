import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/lifecycle',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/lifecycle/**/*.spec.ts`],
  coveragePathIgnorePatterns: [
    "../packages/core",
    "../packages/publisher-internal",
    "../packages/signer-internal",
  ]
};

export default config;
