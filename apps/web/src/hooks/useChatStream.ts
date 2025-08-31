import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatStreamService, ChatStreamOptions, StreamMessage } from '../services/chatStreamService';

export interface UseChatStreamOptions extends ChatStreamOptions {
  // 继承 ChatStreamOptions 的所有属性
}

export interface UseChatStreamReturn {
  // State
  messages: StreamMessage[];
  isLoading: boolean;
  threadId: string | null;
  agentId: string | null;
  isLoadingThread: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  loadThread: (threadId: string) => Promise<void>;
  setAgent: (agentId: string) => Promise<void>;
  startNewChat: () => void;
  stopStream: () => void;
}

/**
 * 聊天流 Hook - 管理聊天状态和流式消息
 * 这个 Hook 位于 web 应用层，负责状态管理和 UI 交互
 */
export function useChatStream({
  endpoint = '/api/agentic',
  userId = 'admin',
  agentId: initialAgentId = null,
  agentName = '智能体',
  agentAvatar = 'robot',
}: UseChatStreamOptions = {}): UseChatStreamReturn {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [agentId, setAgentIdState] = useState<string | null>(initialAgentId);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const optionsRef = useRef({ endpoint, userId, agentId, agentName, agentAvatar });

  // 更新选项引用
  useEffect(() => {
    optionsRef.current = { endpoint, userId, agentId, agentName, agentAvatar };
  }, [endpoint, userId, agentId, agentName, agentAvatar]);

  // 清理函数
  useEffect(() => {
    return () => {
      ChatStreamService.stopCurrentStream();
    };
  }, []);

  const setAgent = useCallback(async (selectedAgentId: string) => {
    setAgentIdState(selectedAgentId);
  }, []);

  // 加载线程历史
  const loadThread = useCallback(async (selectedThreadId: string) => {
    try {
      setIsLoadingThread(true);
      const result = await ChatStreamService.loadThreadHistory(
        selectedThreadId,
        agentName,
        agentAvatar,
        1, // 第一页
        50 // 每页50条消息
      );

      setMessages(result.messages);
      setThreadId(selectedThreadId);

      console.log(`📚 [useChatStream] 加载线程历史完成:`, {
        threadId: selectedThreadId,
        messageCount: result.messages.length,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Failed to load thread history:', error);
      throw error;
    } finally {
      setIsLoadingThread(false);
    }
  }, [agentName, agentAvatar]);

  // 发送消息
  const sendMessage = useCallback(async (content: string) => {
    console.log('🚀 useChatStream.sendMessage 开始');
    
    if (!content.trim() || isLoading || !agentId) {
      console.warn('❌ 发送消息条件不满足:', { 
        hasContent: !!content.trim(), 
        isLoading, 
        hasAgentId: !!agentId 
      });
      return;
    }

    // 创建用户消息
    const userMessage: StreamMessage = {
      id: Date.now().toString(),
      sender: '我',
      content,
      timestamp: ChatStreamService.formatTimestamp(),
      avatar: 'user',
      role: 'user'
    };
    
    // 立即添加用户消息到UI
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // 生成线程ID（如果不存在）
    const currentThreadId = threadId || ChatStreamService.generateThreadId();
    if (!threadId) {
      console.log('🆔 生成新的线程ID:', currentThreadId);
      setThreadId(currentThreadId);
    } else {
      console.log('🆔 使用现有线程ID:', currentThreadId);
    }

    try {
      await ChatStreamService.sendMessage(
        content,
        {
          endpoint,
          userId,
          agentId,
          agentName,
          agentAvatar
        },
        // onMessageUpdate
        (message: StreamMessage) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === message.id) {
              // 更新最后一条助手消息
              return [...prev.slice(0, -1), message];
            } else {
              // 添加新的助手消息
              return [...prev, message];
            }
          });
        },
        // onComplete
        () => {
          console.log('✅ 对话完成');
          setIsLoading(false);
        },
        // onError
        (error: Error) => {
          console.error('❌ 发送消息错误:', error);
          setIsLoading(false);
          
          const errorMessage: StreamMessage = {
            id: (Date.now() + 1).toString(),
            sender: agentName,
            content: '抱歉，处理您的消息时出现了错误，请重试。',
            timestamp: ChatStreamService.formatTimestamp(),
            avatar: agentAvatar,
            role: 'assistant'
          };
          
          setMessages(prev => [...prev, errorMessage]);
        },
        currentThreadId
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'AbortError'
      ) {
        console.log('⏹️ 请求被取消');
        return;
      }

      console.error('Error:', error);
      setIsLoading(false);
      
      const fallbackMessage: StreamMessage = {
        id: (Date.now() + 2).toString(),
        sender: agentName,
        content: '抱歉，处理您的请求时发生错误。',
        timestamp: ChatStreamService.formatTimestamp(),
        avatar: agentAvatar,
        role: 'assistant'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      throw error;
    }
  }, [isLoading, agentId, threadId, endpoint, userId, agentName, agentAvatar]);

  // 开始新聊天
  const startNewChat = useCallback(() => {
    ChatStreamService.stopCurrentStream();
    setMessages([]);
    setThreadId(null);
  }, [messages.length, threadId, agentId]);

  // 停止流
  const stopStream = useCallback(() => {
    ChatStreamService.stopCurrentStream();
    setIsLoading(false);
  }, []);

  return {
    // State
    messages,
    isLoading,
    threadId,
    agentId,
    isLoadingThread,

    // Actions
    sendMessage,
    loadThread,
    setAgent,
    startNewChat,
    stopStream,
  };
}