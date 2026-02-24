import { defineConfig } from 'tsdown';
import base from '../../tsdown.config';

export default defineConfig(
  base
    .filter((config) => config.platform !== 'browser')
    .map((config) => ({
      ...config,
      format: ['cjs' as const],
      unbundle: true,
    }))
);
