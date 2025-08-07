import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/registrar',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/registrar/**/*.spec.ts`],
  coveragePathIgnorePatterns: [
    "../packages/cache",
    "../packages/core",
    "../packages/client",
    "../packages/crypto",
    "../packages/hcs",
    "../packages/lifecycle",
    "../packages/messages",
    "../packages/publisher-internal",
    "../packages/resolver",
    "../packages/signer-internal",
    "../packages/verifier-internal",
    "../packages/zstd",
    "../tests",
  ]
};

export default config;
