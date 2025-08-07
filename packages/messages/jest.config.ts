import type { Config } from 'jest';
import base from '../../jest.config.base';

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/messages',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/messages/**/*.spec.ts`],
   coveragePathIgnorePatterns: [
     "../packages/cache",
     "../packages/client",
     "../packages/core",
     "../packages/crypto",
     "../packages/hcs",
     "../packages/lifecycle",
     "../packages/resolver",
     "../packages/verifier-internal",
     "../packages/zstd",
     "../tests",
   ]
};

export default config;
