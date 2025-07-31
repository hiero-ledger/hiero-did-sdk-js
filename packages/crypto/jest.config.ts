import type { Config } from 'jest'

import base from '../../jest.config.base'

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/crypto',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/crypto/**/*.spec.ts`, `<rootDir>/packages/crypto/**/*.e2e.ts`],
}

export default config
