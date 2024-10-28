import type { Config } from 'jest';
import base from './jest.config.base';

const config: Config = {
  ...base,
  projects: ['<rootDir>/packages/*/jest.config.ts'],
  coverageDirectory: '<rootDir>/coverage/',
};

export default config;
