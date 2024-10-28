import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hashgraph-did-sdk/core',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/core/**/*.spec.ts`],
};
export default config;
