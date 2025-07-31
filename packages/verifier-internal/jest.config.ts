import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/verifier-internal',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/verifier-internal/**/*.spec.ts`],
};

export default config;
