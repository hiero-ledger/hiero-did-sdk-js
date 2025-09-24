import { defineConfig } from 'tsup';
import base from '../../tsup.config';

export default defineConfig({ ...base, entry: ['src/**/*.{ts,tsx}'], bundle: false });
