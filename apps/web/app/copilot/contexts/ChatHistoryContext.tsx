"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 类型定义
export interface ChatThread {
  id: string;
  title: string;
  agentId: string;
  userId: string;
  messageCount: number;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface ChatHistoryState {
  threads: ChatThread[];
  currentThreadId: string | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  searchResults: ChatThread[];
  isSearching: boolean;
}

export interface ChatHistoryActions {
  // 线程管理
  loadThreads: (agentId: string, userId?: string) => Promise<void>;
  createNewThread: (agentId: string, userId?: string, title?: string) => Promise<string>;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, title: string) => Promise<void>;
  
  // 搜索功能
  searchThreads: (query: string, agentId: string, userId?: string) => Promise<void>;
  clearSearch: () => void;
  
  // 状态管理
  setCurrentThreadId: (threadId: string | null) => void;
  refreshCurrentThread: () => Promise<void>;
  updateCurrentThreadInfo: (messageCount: number, lastMessage: string) => void;
}

type ChatHistoryContextType = ChatHistoryState & ChatHistoryActions;

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatHistoryState>({
    threads: [],
    currentThreadId: null,
    isLoading: false,
    error: null,
    hasMore: true,
    searchQuery: '',
    searchResults: [],
    isSearching: false,
  });

  // 加载对话列表
  const loadThreads = useCallback(async (agentId: string, userId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        agentId,
        limit: '50'
      });
      
      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/copilot/threads?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load threads');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        threads: data.threads || [],
        hasMore: data.pagination?.hasMore || false,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load threads',
        isLoading: false
      }));
    }
  }, []);

  // 创建新对话
  const createNewThread = useCallback(async (agentId: string, userId?: string, title?: string): Promise<string> => {
    try {
      const response = await fetch('/api/copilot/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          userId: userId || 'anonymous',
          title
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create thread');
      }

      const data = await response.json();
      const newThread = data.thread;

      // 更新状态：将新对话添加到列表顶部
      setState(prev => ({
        ...prev,
        threads: [{ ...newThread, isActive: true }, ...prev.threads.map(t => ({ ...t, isActive: false }))],
        currentThreadId: newThread.id
      }));

      return newThread.id;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create thread'
      }));
      throw error;
    }
  }, []);

  // 切换对话
  const switchThread = useCallback((threadId: string) => {
    setState(prev => ({
      ...prev,
      currentThreadId: threadId,
      threads: prev.threads.map(thread => ({
        ...thread,
        isActive: thread.id === threadId
      }))
    }));
  }, []);

  // 删除对话
  const deleteThread = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/copilot/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete thread');
      }

      setState(prev => ({
        ...prev,
        threads: prev.threads.filter(thread => thread.id !== threadId),
        currentThreadId: prev.currentThreadId === threadId ? null : prev.currentThreadId
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete thread'
      }));
      throw error;
    }
  }, []);

  // 重命名对话
  const renameThread = useCallback(async (threadId: string, title: string) => {
    try {
      const response = await fetch(`/api/copilot/threads/${threadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename thread');
      }

      const data = await response.json();

      setState(prev => ({
        ...prev,
        threads: prev.threads.map(thread =>
          thread.id === threadId
            ? { ...thread, title: data.thread.title, updatedAt: data.thread.updatedAt }
            : thread
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to rename thread'
      }));
      throw error;
    }
  }, []);

  // 搜索对话
  const searchThreads = useCallback(async (query: string, agentId: string, userId?: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, searchQuery: '', searchResults: [], isSearching: false }));
      return;
    }

    setState(prev => ({ ...prev, isSearching: true, searchQuery: query }));

    try {
      const params = new URLSearchParams({
        q: query,
        agentId,
        limit: '20'
      });

      if (userId) {
        params.append('userId', userId);
      }

      const response = await fetch(`/api/copilot/threads/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search threads');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        searchResults: data.results || [],
        isSearching: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search threads',
        isSearching: false
      }));
    }
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      searchResults: [],
      isSearching: false
    }));
  }, []);

  // 设置当前对话ID
  const setCurrentThreadId = useCallback((threadId: string | null) => {
    setState(prev => ({
      ...prev,
      currentThreadId: threadId,
      threads: prev.threads.map(thread => ({
        ...thread,
        isActive: thread.id === threadId
      }))
    }));
  }, []);

  // 刷新当前对话
  const refreshCurrentThread = useCallback(async () => {
    if (!state.currentThreadId) return;

    try {
      const response = await fetch(`/api/copilot/threads/${state.currentThreadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to refresh thread');
      }

      const data = await response.json();
      const updatedThread = data.thread || data; // 兼容不同的API响应格式
      
      setState(prev => ({
        ...prev,
        threads: prev.threads.map(thread =>
          thread.id === state.currentThreadId
            ? { 
                ...thread, 
                ...updatedThread, 
                isActive: true,
                // 确保关键字段被更新
                messageCount: updatedThread.messageCount || thread.messageCount,
                lastMessage: updatedThread.lastMessage || thread.lastMessage,
                lastMessageAt: updatedThread.lastMessageAt || thread.lastMessageAt,
                updatedAt: updatedThread.updatedAt || new Date().toISOString()
              }
            : thread
        )
      }));
    } catch (error) {
      console.error('Failed to refresh thread:', error);
    }
  }, [state.currentThreadId]);

  // 更新当前对话信息（消息数量和最后消息）
  const updateCurrentThreadInfo = useCallback((messageCount: number, lastMessage: string) => {
    if (!state.currentThreadId) return;

    setState(prev => ({
      ...prev,
      threads: prev.threads.map(thread =>
        thread.id === state.currentThreadId
          ? {
              ...thread,
              messageCount,
              lastMessage: lastMessage.slice(0, 100), // 限制长度
              lastMessageAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : thread
      )
    }));
  }, [state.currentThreadId]);

  const contextValue: ChatHistoryContextType = {
    ...state,
    loadThreads,
    createNewThread,
    switchThread,
    deleteThread,
    renameThread,
    searchThreads,
    clearSearch,
    setCurrentThreadId,
    refreshCurrentThread,
    updateCurrentThreadInfo,
  };

  return (
    <ChatHistoryContext.Provider value={contextValue}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}