import { Options } from 'tsup';

const options: Options = {
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  dts: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
};

export default options;
