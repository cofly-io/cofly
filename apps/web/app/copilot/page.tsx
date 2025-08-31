"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CustomAssistantMessage } from "./components/CustomAssistantMessage";
import { CustomUserMessage } from "./components/CustomUserMessage";
import { CustomMessages } from "./components/CustomMessages";
import { CustomInput } from "./components/CustomInput";
import { ScrollProvider } from "./components/ScrollContext";

import { useChatHistory } from "./contexts/ChatHistoryContext";
import { useMessageEnhancement } from "./hooks/useMessageEnhancement";

export default function CopilotKitPage() {
  const { refreshCurrentThread } = useChatHistory();
  useMessageEnhancement(); // 启用消息增强功能

  return (
    <ScrollProvider>
      <CopilotChat
        labels={{
          stopGenerating: "停止生成",
          regenerateResponse: "重新生成",
          copyToClipboard: "复制到剪贴板",
          thumbsUp: "赞",
          thumbsDown: "踩"
        }}
        AssistantMessage={CustomAssistantMessage}
        UserMessage={CustomUserMessage}
        Messages={CustomMessages}
        Input={CustomInput}
        onCopy={(message) => {
          console.log('Message copied:', message);
        }}
        onThumbsUp={(message) => {
          console.log('Thumbs up:', message);
        }}
        onThumbsDown={(message) => {
          console.log('Thumbs down:', message);
        }}
        onInProgressChange={(inProgress) => {
          // 当消息生成完成时，刷新当前对话信息
          if (!inProgress) {
            setTimeout(() => {
              refreshCurrentThread();
            }, 1000); // 延迟1秒确保消息已保存到后端
          }
        }}
      />
    </ScrollProvider>
  );
}