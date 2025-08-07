import type { Config } from 'jest'

import base from '../../jest.config.base'

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/anoncreds',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/anoncreds/**/*.spec.ts`, `<rootDir>/packages/anoncreds/**/*.e2e.ts`],
  coveragePathIgnorePatterns: [
    "../packages/cache",
    "../packages/core",
    "../packages/client",
    "../packages/crypto",
    "../packages/hcs",
    "../packages/zstd",
    "../tests",
  ]
}

export default config
