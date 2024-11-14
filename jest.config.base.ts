import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    Uint8Array: Uint8Array,
    ArrayBuffer: ArrayBuffer,
  },
};

export default config;
