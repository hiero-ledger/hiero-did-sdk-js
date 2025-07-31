import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/signer-internal',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/signer-internal/**/*.spec.ts`],
};

export default config;
