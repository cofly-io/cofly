import type { Metadata } from "next";
import { Suspense } from "react";

import "./critical.css";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: "你的AI智能助手",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased dark">
        <Suspense fallback={
          <div className="loading-fallback">
            正在加载...
          </div>
        }>
          <Provider>
            {children}
          </Provider>
        </Suspense>
      </body>
    </html>
  );
}
