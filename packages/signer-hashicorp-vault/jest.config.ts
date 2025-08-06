import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/signer-hashicorp-vault',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/signer-hashicorp-vault/**/*.spec.ts`],
  coveragePathIgnorePatterns: [
    "../packages/core",
    "../tests",
  ]
};

export default config;
