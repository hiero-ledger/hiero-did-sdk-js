import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/resolver',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/resolver/**/*.spec.ts`],
  coveragePathIgnorePatterns: [
    "../packages/cache",
    "../packages/core",
    "../packages/client",
    "../packages/crypto",
    "../packages/hcs",
    "../packages/lifecycle",
    "../packages/messages",
    "../packages/publisher-internal",
    "../packages/registrar",
    "../packages/signer-internal",
    "../packages/verifier-internal",
    "../packages/zstd",
    "../tests",
  ]};

export default config;
