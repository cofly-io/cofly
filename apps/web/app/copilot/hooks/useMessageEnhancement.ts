"use client";

import { useEffect } from 'react';
import { useChatHistory } from '../contexts/ChatHistoryContext';

// 这个Hook用于增强CopilotKit消息数据，添加时间戳等信息
export function useMessageEnhancement() {
  const { currentThreadId } = useChatHistory();

  useEffect(() => {
    if (!currentThreadId) return;

    // 监听CopilotKit消息变化，为消息添加时间戳
    const enhanceMessages = () => {
      // 查找所有消息元素
      const messageElements = document.querySelectorAll('[data-message-type]');
      
      messageElements.forEach((element, index) => {
        const messageElement = element as HTMLElement;
        
        // 如果消息还没有时间戳数据，添加当前时间
        if (!messageElement.dataset.timestamp) {
          messageElement.dataset.timestamp = new Date().toISOString();
        }
      });
    };

    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.querySelector('[data-message-type]') || element.matches('[data-message-type]')) {
                setTimeout(enhanceMessages, 100); // 延迟执行，确保DOM完全渲染
              }
            }
          });
        }
      });
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 初始增强
    enhanceMessages();

    return () => {
      observer.disconnect();
    };
  }, [currentThreadId]);

  // 从API获取历史消息的时间戳数据
  const loadHistoricalTimestamps = async (threadId: string) => {
    try {
      const response = await fetch(`/api/copilot/threads/${threadId}/messages`);
      if (response.ok) {
        const data = await response.json();
        return data.messages.map((msg: any) => ({
          id: msg.id,
          timestamp: msg.createdAt,
          content: msg.content
        }));
      }
    } catch (error) {
      console.error('Failed to load historical timestamps:', error);
    }
    return [];
  };

  return {
    loadHistoricalTimestamps
  };
}