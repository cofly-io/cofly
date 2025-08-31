import React from 'react';
import './globals.css';
import { NextAuthProvider } from '../src/providers/NextAuthProvider';
import { AppThemeProvider } from '../src/providers/AppThemeProvider';
import StyledComponentsRegistry from '../src/lib/registry';

if (typeof window === 'undefined') {
  // 异步初始化服务器，但不阻塞布局渲染
  import("@/lib/serverInit").then(({ initializeServer }) => {
    initializeServer().catch(console.error);
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <NextAuthProvider>
            <AppThemeProvider>
              {children}
            </AppThemeProvider>
          </NextAuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>

  );
}
