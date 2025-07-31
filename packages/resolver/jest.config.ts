import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/resolver',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/resolver/**/*.spec.ts`],
};

export default config;
