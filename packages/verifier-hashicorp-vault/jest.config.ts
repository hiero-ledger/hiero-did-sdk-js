import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/verifier-hashicorp-vault',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/verifier-hashicorp-vault/**/*.spec.ts`],
};

export default config;
