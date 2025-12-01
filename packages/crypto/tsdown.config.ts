import { defineConfig } from 'tsdown';
import base from '../../tsdown.config';

export default defineConfig(
  base.map((config) => ({
    ...config,
    format: ['cjs' as const],
    unbundle: true,
  }))
);
