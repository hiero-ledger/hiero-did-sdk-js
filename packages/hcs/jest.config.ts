import type { Config } from 'jest'
import base from '../../jest.config.base'

const config: Config = {
  ...base,
  displayName: '@hiero-did-sdk/hcs',
  rootDir: '../..',
  testMatch: [`<rootDir>/packages/hcs/**/*.spec.ts`, `<rootDir>/packages/hcs/**/*.e2e.ts`],
  collectCoverageFrom: [
    'packages/hcs/src/**/*.ts',
    '!packages/cache/src/**/*.ts',
    '!packages/crypto/src/**/*.ts',
  ],
}

export default config
