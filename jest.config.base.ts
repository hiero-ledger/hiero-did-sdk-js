import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(cbor2)/)'],
  moduleNameMapper: {
    '^@hiero-did-sdk/(.*)$': '<rootDir>/packages/$1/src',
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer,
  }
};

export default config;
