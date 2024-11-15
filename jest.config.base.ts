import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@hashgraph-did-sdk/(.*)$': '<rootDir>/packages/$1/src',
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer,
  },
};

export default config;
