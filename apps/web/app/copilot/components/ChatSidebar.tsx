"use client";

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useChatHistory } from "../contexts/ChatHistoryContext";
import { ChatHistoryItem } from "./ChatHistoryItem";
import { useSearchParams } from "next/navigation";

// 样式组件
const SidebarContainer = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '0' : '280px'};
  min-width: ${props => props.$collapsed ? '0' : '280px'};
  height: 100vh;
  background: #1a1a1a;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, min-width 0.3s ease;
  overflow: hidden;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: ${props => props.$collapsed ? '0' : '100vw'};
    min-width: ${props => props.$collapsed ? '0' : '100vw'};
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
  }
`;

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
`;

const NewChatButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid #404040;
  border-radius: 0.5rem;
  color: #e5e5e5;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2a2a2a;
    border-color: #4285f4;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }
`;

const SearchContainer = styled.div`
  padding: 0 1rem 1rem;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 0.375rem;
  color: #e5e5e5;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #4285f4;
  }
  
  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchResults = styled.div`
  margin-top: 0.5rem;
`;

const SearchResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #9aa0a6;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ClearSearchButton = styled.button`
  background: none;
  border: none;
  color: #4285f4;
  font-size: 0.75rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ThreadsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #404040;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #606060;
  }
`;

const SectionHeader = styled.div`
  padding: 0.75rem 1rem 0.5rem;
  color: #9aa0a6;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #9aa0a6;
  font-size: 0.875rem;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #9aa0a6;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: #2a2a2a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const EmptyStateText = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  top: 1rem;
  right: -12px;
  width: 24px;
  height: 24px;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 50%;
  color: #9aa0a6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: #404040;
    color: #e5e5e5;
  }
  
  svg {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
    transform: ${props => props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

interface ChatSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatSidebar({ collapsed = false, onToggleCollapse }: ChatSidebarProps) {
  const {
    threads,
    currentThreadId,
    isLoading,
    error,
    searchQuery,
    searchResults,
    isSearching,
    loadThreads,
    createNewThread,
    switchThread,
    searchThreads,
    clearSearch,
    setCurrentThreadId,
    refreshCurrentThread
  } = useChatHistory();

  const [searchInput, setSearchInput] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  // 获取当前的 agent 和 user 信息
  const currentAgent = searchParams.get("agent") || "个人助理";
  const currentUser = "admin"; // 临时用户ID，实际应该从认证系统获取

  // 初始化加载对话列表
  useEffect(() => {
    loadThreads(currentAgent, currentUser);
  }, [loadThreads, currentAgent, currentUser]);

  // 从 URL 参数中获取当前线程ID
  useEffect(() => {
    const threadId = searchParams.get("thread");
    if (threadId && threadId !== currentThreadId) {
      setCurrentThreadId(threadId);
    }
  }, [searchParams, currentThreadId, setCurrentThreadId]);

  // 定期刷新当前对话信息（作为备用机制）
  useEffect(() => {
    if (!currentThreadId) return;

    const interval = setInterval(() => {
      refreshCurrentThread();
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, [currentThreadId, refreshCurrentThread]);

  // 搜索防抖
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput.trim()) {
        searchThreads(searchInput, currentAgent, currentUser);
      } else {
        clearSearch();
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, searchThreads, clearSearch, currentAgent, currentUser]);

  const handleNewChat = async () => {
    try {
      const newThreadId = await createNewThread(currentAgent, currentUser);
      // 更新 URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('thread', newThreadId);
      window.history.pushState({}, '', newUrl.toString());
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleThreadClick = (threadId: string) => {
    switchThread(threadId);
    // 更新 URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('thread', threadId);
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    clearSearch();
  };

  const displayThreads = searchQuery ? searchResults : threads;
  const showSearchResults = searchQuery && searchResults.length > 0;
  const showEmptySearch = searchQuery && searchResults.length === 0 && !isSearching;
  const showEmptyState = !searchQuery && threads.length === 0 && !isLoading;

  return (
    <SidebarContainer $collapsed={collapsed}>
      {onToggleCollapse && (
        <CollapseButton onClick={onToggleCollapse} $collapsed={collapsed}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </CollapseButton>
      )}

      <SidebarHeader>
        <NewChatButton onClick={handleNewChat}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新对话
        </NewChatButton>
      </SidebarHeader>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="搜索对话..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        
        {showSearchResults && (
          <SearchResults>
            <SearchResultsHeader>
              搜索结果 ({searchResults.length})
              <ClearSearchButton onClick={handleClearSearch}>
                清除
              </ClearSearchButton>
            </SearchResultsHeader>
          </SearchResults>
        )}
      </SearchContainer>

      <ThreadsList>
        {isLoading && (
          <LoadingContainer>
            <div>加载中...</div>
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {showEmptyState && (
          <EmptyState>
            <EmptyStateIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </EmptyStateIcon>
            <EmptyStateText>
              还没有对话记录<br />
              点击"新对话"开始聊天
            </EmptyStateText>
          </EmptyState>
        )}

        {showEmptySearch && (
          <EmptyState>
            <EmptyStateIcon>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </EmptyStateIcon>
            <EmptyStateText>
              没有找到匹配的对话
            </EmptyStateText>
          </EmptyState>
        )}

        {!isLoading && !error && displayThreads.length > 0 && (
          <>
            {!searchQuery && <SectionHeader>最近对话</SectionHeader>}
            {displayThreads.map((thread) => (
              <ChatHistoryItem
                key={thread.id}
                thread={thread}
                isActive={thread.id === currentThreadId}
                onClick={() => handleThreadClick(thread.id)}
              />
            ))}
          </>
        )}
      </ThreadsList>
    </SidebarContainer>
  );
}