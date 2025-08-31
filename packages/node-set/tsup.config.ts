import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  outDir: 'dist',
  format: ['esm'],
  dts: false, // Temporarily disabled due to node type issues
  metafile: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'js' : 'mjs'}`
    };
  }
});