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
  external: [
      '@xenova/transformers',
      '@zilliz/milvus2-sdk-node',
      'xlsx',
      'mammoth',
      'mime-types',
      'pdf-parse',
      'pdf-parser',
      'pdfjs-dist',
      'pptx2json',
      'node-pptx-parser',
      'vectra',
      'gpt-3-encoder'
  ], // 将这些包标记为外部依赖
  outExtension({ format }) {
    return {
      js: `.${format === 'cjs' ? 'js' : 'mjs'}`
    };
  }
});