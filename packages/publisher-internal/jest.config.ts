import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/publisher-internal',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/publisher-internal/**/*.spec.ts`],
};

export default config;
