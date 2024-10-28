import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hashgraph-did-sdk/messages',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/messages/**/*.spec.ts`],
};

export default config;
