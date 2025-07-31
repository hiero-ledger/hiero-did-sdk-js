import type { Config } from 'jest'

import base from '../../jest.config.base'

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/client',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/client/**/*.e2e.ts`],
}

export default config
