import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hashgraph-did-sdk/registrar',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/registrar/**/*.spec.ts`],
};

export default config;
