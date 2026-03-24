import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/packages/index.ts',
    debounce: 'src/packages/debounce/index.ts',
    debounceSignal: 'src/packages/debounceSignal/index.ts',
    react: 'src/packages/react/index.ts',
    throttle: 'src/packages/throttle/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: {
    entry: {
      index: 'src/packages/index.ts',
      debounce: 'src/packages/debounce/index.ts',
      debounceSignal: 'src/packages/debounceSignal/index.ts',
      react: 'src/packages/react/index.ts',
      throttle: 'src/packages/throttle/index.ts',
      types: 'src/packages/types/index.ts',
    },
  },
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: true,
  treeshake: true,
  target: 'es2020',
});
