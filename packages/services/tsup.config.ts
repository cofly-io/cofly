import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  metafile: true,
  splitting: false,
  sourcemap: false, // 禁用 sourcemap 以避免与 @xenova/transformers 的冲突
  clean: true,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'js' : 'mjs'}`
    };
  }
});