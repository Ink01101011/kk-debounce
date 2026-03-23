import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/packages/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: true,
  treeshake: true,
  target: 'es2020',
});
