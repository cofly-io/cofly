import React from 'react';
import { ChatDisplay } from '@repo/ui';
import { useChatStream } from '../hooks/useChatStream';

interface ChatDisplayWrapperProps {
  agentId?: string | null;
  userId?: string;
  agentName?: string;
  agentAvatar?: string;
  theme?: 'light' | 'dark';
  className?: string;
  showNewChat?: boolean;
  showHistory?: boolean;
  showAttachment?: boolean;
  showAgent?: boolean;
  onHistoryToggle?: (isVisible: boolean, width: number) => void;
}

/**
 * ChatDisplay的Web层包装器
 * 
 * 这个组件负责：
 * 1. 使用web层的useChatStream hook获取数据和回调函数
 * 2. 将数据和回调函数传递给UI层的ChatDisplay组件
 * 3. 保持UI层和业务逻辑层的分离
 */
export const ChatDisplayWrapper: React.FC<ChatDisplayWrapperProps> = ({
  agentId = null,
  userId = "admin",
  agentName = "智能体",
  agentAvatar = "🤖",
  theme = 'dark',
  className,
  showNewChat = true,
  showHistory = true,
  showAttachment = true,
  showAgent = true,
  onHistoryToggle
}) => {
  // 使用web层的useChatStream hook
  const {
    messages: streamMessages,
    isLoading: streamIsLoading,
    threadId,
    isLoadingThread,
    sendMessage: onStreamSendMessage,
    loadThread: onLoadThread,
    setAgent: onSetAgent,
    startNewChat: onStartNewChat,
  } = useChatStream({
    endpoint: "/api/agentic",
    userId,
    agentId,
    agentName,
    agentAvatar,
  });

  return (
    <ChatDisplay
      // 流式聊天相关 props - 从hook传入
      streamMessages={streamMessages}
      streamIsLoading={streamIsLoading}
      threadId={threadId}
      isLoadingThread={isLoadingThread}
      onStreamSendMessage={onStreamSendMessage}
      onLoadThread={onLoadThread}
      onSetAgent={onSetAgent}
      onStartNewChat={onStartNewChat}
      
      // 配置相关 props
      agentId={agentId}
      userId={userId}
      agentName={agentName}
      agentAvatar={agentAvatar}
      theme={theme}
      className={className}
      showNewChat={showNewChat}
      showHistory={showHistory}
      showAttachment={showAttachment}
      showAgent={showAgent}
      onHistoryToggle={onHistoryToggle}
    />
  );
};

export default ChatDisplayWrapper;
