import { Options } from 'tsup';

const commonOptions: Options = {
  splitting: false,
  minify: false,
  keepNames: true,
  tsconfig: 'tsconfig.build.json',
  outDir: 'dist',
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
  skipNodeModulesBundle: true,
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
};

const nodeOptions: Options = {
  ...commonOptions,
  sourcemap: true,
  clean: false,
  dts: true,
  platform: 'node',
};

const browserOptions: Options = {
  ...commonOptions,
  platform: 'browser',
  outDir: 'dist/browser',
  format: ['cjs', 'esm'],
  inject: ['../../node_modules/node-stdlib-browser/helpers/esbuild/shim.js'],
};

export default [nodeOptions, browserOptions];
