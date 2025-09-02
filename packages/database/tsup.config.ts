import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
  ],
  format: ["esm"],
  dts: true,
  metafile: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["@prisma/client"],
  esbuildOptions(options) {
    options.banner = {
      js: "/* eslint-disable */",
    };
  },
});