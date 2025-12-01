import { UserConfig } from 'tsdown';

export type UserConfigEntry = Exclude<UserConfig, Array<unknown>>;

const esbuildShim = require.resolve('node-stdlib-browser/helpers/esbuild/shim');

const commonOptions: UserConfigEntry = {
  minify: false,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  target: 'es2021',
  entry: ['src/index.ts'],
  skipNodeModulesBundle: true,
  fixedExtension: true,
  logLevel: 'error',
};

const nodeOptions: UserConfigEntry = {
  ...commonOptions,
  platform: 'node',
  sourcemap: true,
};

const browserOptions: UserConfigEntry = {
  ...commonOptions,
  platform: 'browser',
  outDir: 'dist/browser',
  format: ['cjs', 'esm'],
  dts: false,
  inputOptions: {
    transform: {
      inject: {
        global: [esbuildShim, 'global'],
        process: [esbuildShim, 'process'],
        Buffer: [esbuildShim, 'Buffer'],
      },
    },
  },
};

export default [nodeOptions, browserOptions];
