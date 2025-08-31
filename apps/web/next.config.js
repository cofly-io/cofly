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
      "@repo/knowledge-base"],
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // 在生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: [],
  },
  // 配置环境变量前缀
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  experimental: {
    // Remove appDir as it's now stable in Next.js 15
    esmExternals: true
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
    'pdfjs-dist'
  ],
  webpack: (config, { dev, isServer }) => {
    // 添加buffer polyfill for both server and client
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            net: false,
            tls: false,
            fs: false,
            dns: false,
            // Add the Node.js modules that are causing build failures
            async_hooks: false,
            diagnostics_channel: false,
            child_process: false,
            readline: false,
            'timers/promises': false,
            module: false,
            // Node.js protocol modules
            'node:async_hooks': false,
            'node:events': false,
            'node:process': false,
            // Knowledge base related packages
            'gpt-3-encoder': false,
            'vectra': false,
            'pdf-parse': false,
            'pdf-parser': false,
            'pdfjs-dist': false,
            'pptx2json': false,
            'node-pptx-parser': false,
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
            // Add Node.js modules as externals for client-side
            'async_hooks',
            'diagnostics_channel', 
            'child_process',
            'readline',
            'timers/promises',
            'module',
            // Node.js protocol modules
            'node:async_hooks',
            'node:events', 
            'node:process',
            // Knowledge base related packages that should only run on server
            'vectra',
            'gpt-3-encoder',
            '@zilliz/milvus2-sdk-node',
            'mammoth',
            'pdf-parse',
            'pdf-parser',
            'pdfjs-dist',
            'pptx2json',
            'node-pptx-parser',
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
        // 确保正确解析模块
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

// 引入 withBundleAnalyzer
const withBundleAnalyzerConfig = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzerConfig(nextConfig);
