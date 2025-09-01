import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    platform: 'node', // 明确指定 Node.js 平台
    target: 'node18', // 或者您的目标 Node.js 版本
    dts: {
        resolve: true,
        compilerOptions: {
            skipLibCheck: true,
            baseUrl: '.',
            paths: {
                "@/*": ["./src/*", "../interfaces/src/*", "../interfaces/app/*"],
                "@repo/*": ["../packages/*"],
                "@interfaces/*": ["../interfaces/src/*", "../interfaces/app/*"]
            }
        }
    },
    external: [
        // Node.js 内置模块
        'buffer',
        'crypto',
        'fs',
        'path',
        'url',
        'util',
        'stream',
        'events',
        'os',
        'zlib',
        'http',
        'https',
        'net',
        'tls',
        'child_process',
        'module',
        // 第三方模块也可能需要外部化
        'dmdb',
        'mysql2',
        'oracledb',
        'pg',
        'mssql'
    ],
    esbuildOptions(options) {
        options.platform = 'node';
        options.packages = 'external'; // 这个很重要！
    },
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