"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useChatHistory } from '../contexts/ChatHistoryContext';

export function useUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentThreadId, setCurrentThreadId } = useChatHistory();

  // 从 URL 同步到状态
  useEffect(() => {
    const urlThreadId = searchParams.get('thread');
    if (urlThreadId && urlThreadId !== currentThreadId) {
      setCurrentThreadId(urlThreadId);
    }
  }, [searchParams, currentThreadId, setCurrentThreadId]);

  // 更新 URL 的辅助函数
  const updateUrl = (threadId: string | null, agent?: string) => {
    const newUrl = new URL(window.location.href);
    
    if (threadId) {
      newUrl.searchParams.set('thread', threadId);
    } else {
      newUrl.searchParams.delete('thread');
    }
    
    if (agent) {
      newUrl.searchParams.set('agent', agent);
    }
    
    // 使用 pushState 而不是 router.push 来避免页面重新加载
    window.history.pushState({}, '', newUrl.toString());
  };

  return {
    updateUrl,
    currentAgent: searchParams.get('agent') || '个人助理',
    currentThreadId: searchParams.get('thread'),
  };
}