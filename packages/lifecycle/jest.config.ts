import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/lifecycle',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/lifecycle/**/*.spec.ts`],
};

export default config;
