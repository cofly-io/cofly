import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },
    transpilePackages: [
        '@cofly-ai/interfaces',
        "@repo/common",
        "@repo/ui",
        "@repo/database",
        "@repo/services",
        "@repo/engine",
        "@repo/node-set",
        "@repo/knowledge-base"
    ],
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    },
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },
    images: {
        domains: [],
    },
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    experimental: {
        esmExternals: true,
    },
    serverExternalPackages: [
        'buffer',
        'stream-browserify',
        'crypto-browserify',
        'ssh2',
        'ssh2-sftp-client',
        'promise-ftp',
        '@opentelemetry/context-async-hooks',
        '@opentelemetry/instrumentation-undici',
        'cross-spawn',
        'dmdb',
        'inngest',
        'mongodb',
        'mssql',
        '@modelcontextprotocol/sdk',
        '@xenova/transformers',
        'vectra',
        'gpt-3-encoder',
        '@zilliz/milvus2-sdk-node',
        'mammoth',
        'pdf-parse',
        'pdf-parser',
        'pptx2json',
        'pdfjs-dist',
        // 新增 nodejieba 依赖链里的包
        'nodejieba',
        '@mapbox/node-pre-gyp',
        'aws-sdk',
        'mock-aws-s3',
        'nock',
        '@node-rs/jieba'
    ],
    // 条件性添加 standalone 输出
    ...(process.env.BUILD_STANDALONE === 'true' && { output: 'standalone' }),
    webpack: (config, { dev, isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                net: false,
                tls: false,
                fs: false,
                dns: false,
                async_hooks: false,
                diagnostics_channel: false,
                child_process: false,
                readline: false,
                'timers/promises': false,
                module: false,
                'node:async_hooks': false,
                'node:events': false,
                'node:process': false,
                'gpt-3-encoder': false,
                'vectra': false,
                'pdf-parse': false,
                'pdf-parser': false,
                'pdfjs-dist': false,
                'pptx2json': false,
                'node-pptx-parser': false,
                // 新增 nodejieba 依赖链里的包
                'nodejieba': false,
                'aws-sdk': false,
                '@mapbox/node-pre-gyp': false,
                'mock-aws-s3': false,
                'nock': false,
                '@node-rs/jieba': false
            };

            config.externals = [
                ...(config.externals || []),
                'mysql',
                'pg',
                'tedious',
                'oracledb',
                'ssh2',
                'ssh2-sftp-client',
                'promise-ftp',
                'mongodb',
                'mssql',
                'async_hooks',
                'diagnostics_channel',
                'child_process',
                'readline',
                'timers/promises',
                'module',
                'node:async_hooks',
                'node:events',
                'node:process',
                'vectra',
                'gpt-3-encoder',
                '@zilliz/milvus2-sdk-node',
                'mammoth',
                'pdf-parse',
                'pdf-parser',
                'pdfjs-dist',
                'pptx2json',
                'node-pptx-parser',
                // 新增 nodejieba 依赖链里的包
                'nodejieba',
                '@mapbox/node-pre-gyp',
                'aws-sdk',
                'mock-aws-s3',
                'nock',
                '@node-rs/jieba'
            ];
        }

        config.externals.push("sharp");

        config.resolve.fallback = {
            ...config.resolve.fallback,
            buffer: 'buffer',
            stream: 'stream-browserify',
            crypto: 'crypto-browserify',
        };

        if (dev && !isServer) {
            config.resolve.symlinks = true;
        }

        config.resolve.alias = {
            ...config.resolve.alias,
            sharp: "./empty-module.js",
            'gpt-3-encoder': "./empty-module.js",
            'vectra': "./empty-module.js",
        };

        return config;
    }
};

const withBundleAnalyzerConfig = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzerConfig(nextConfig);
