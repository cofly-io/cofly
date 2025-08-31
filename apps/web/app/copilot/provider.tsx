"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useSearchParams } from "next/navigation";
import { ChatHistoryProvider } from "./contexts/ChatHistoryContext";
import { ChatLayout } from "./components/ChatLayout";
import { AppWrapper } from "./components/AppWrapper";

export function Provider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const agent = searchParams.get("agent") || undefined;
  const threadId = searchParams.get("thread") || undefined;

  return (
    <AppWrapper>
      <ChatHistoryProvider>
        <CopilotKit runtimeUrl="/api/ag-ui" agent={agent} threadId={threadId}>
          <ChatLayout>
            {children}
          </ChatLayout>
        </CopilotKit>
      </ChatHistoryProvider>
    </AppWrapper>
  );
}