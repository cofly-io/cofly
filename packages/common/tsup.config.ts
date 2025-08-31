import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/nodes/**/node.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: true,
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