import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { BiTime } from 'react-icons/bi';
import { FaListUl } from "react-icons/fa6";
import { MdOutlineDeleteOutline } from "react-icons/md";

const ChatHistoryContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 100%)'
  };
  display: flex;
  flex-direction: column;
  padding: 0;
  box-sizing: border-box;
`;

const HistoryHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  svg {
    margin-bottom: -2px;
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(156, 156, 156, 0.4)' : 'rgba(100, 116, 139, 0.4)'};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 116, 139, 0.6)'};
  }
`;

const HistoryItem = styled.div<{ $isActive?: boolean }>`
  padding: 10px 12px;
  background: ${props => props.$isActive
    ? (props.theme.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(36, 194, 140, 0.15)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)')
  };
  border-bottom: 1px solid ${props => props.$isActive
    ? (props.theme.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(36, 194, 140, 0.3)')
    : props.theme.colors.borderLight
  };
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: ${props => props.$isActive
    ? (props.theme.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(36, 194, 140, 0.25)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
  };
    border-color: ${props => props.$isActive
    ? (props.theme.mode === 'dark' ? 'rgba(76, 175, 80, 0.6)' : 'rgba(36, 194, 140, 0.5)')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')
  };
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textTertiary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ff4444;
    background: rgba(255, 68, 68, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ItemTitle = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 500;
  flex: 1;
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    max-width: 250px;
  }
`;

const ItemTime = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 20px;
  p {
    font-size: 13px;
  }
`;

interface Thread {
  threadId: string;
  agentId: string;
  content: string;
  createdAt: Date;
}

interface ChatHistoryProps {
  agentId?: string;
  activeThreadId?: string;
  onThreadSelect?: (threadId: string) => void;
  onThreadDelete?: (threadId: string) => Promise<boolean>;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  agentId,
  activeThreadId,
  onThreadSelect,
  onThreadDelete
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(true);

  // 获取历史会话列表
  const fetchThreads = useCallback(async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);

    try {
      // 直接调用API获取threads，移除AbortController避免错误
      const response = await fetch(`/api/agentic/threads?agentId=${agentId}&limit=50`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status} ${response.statusText}`);
      }

      const threadsData = await response.json();

      // 检查组件是否仍然挂载
      if (isMounted) {
        setThreads(threadsData);
      }
    } catch (err) {
      // 如果组件已卸载，不处理错误
      if (!isMounted) {
        return;
      }

      console.error('Error fetching threads:', err);
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('无法连接到服务器，请确保开发服务器正在运行');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load history');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [agentId, isMounted]);

  // 由于新的数据结构没有thread id，暂时移除删除功能

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 生成会话标题
  const getThreadTitle = (thread: Thread) => {
    return thread.content || '空消息';
  };

  // 点击会话项
  const handleThreadClick = (thread: Thread) => {
    // 使用threadId来标识会话
    onThreadSelect?.(thread.threadId);
  };

  // 删除会话
  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发会话选择

    if (!onThreadDelete) {
      console.warn('onThreadDelete callback not provided');
      return;
    }

    try {
      const success = await onThreadDelete(threadId);
      if (success) {
        // 删除成功，从本地状态中移除该会话
        setThreads(prev => prev.filter(thread => thread.threadId !== threadId));
      }
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  };

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // 当agentId变化时重新获取数据
  useEffect(() => {
    if (isMounted) {
      fetchThreads();
    }
  }, [fetchThreads, isMounted]);

  if (!agentId) {
    return (
      <ChatHistoryContainer>
        <EmptyContainer>
          <HiChatBubbleLeftRight size={48} />
          <p>请选择一个智能体</p>
        </EmptyContainer>
      </ChatHistoryContainer>
    );
  }

  return (
    <ChatHistoryContainer>
      <HistoryHeader>
        历史会话
        <FaListUl size={13} color={'#bfbfbf'} />
      </HistoryHeader>

      <HistoryList>
        {loading && (
          <LoadingContainer>
            <p>加载中...</p>
          </LoadingContainer>
        )}

        {error && (
          <EmptyContainer>
            <p>加载失败: {error}</p>
            <button onClick={fetchThreads}>重试</button>
          </EmptyContainer>
        )}

        {!loading && !error && threads.length === 0 && (
          <EmptyContainer>
            <HiChatBubbleLeftRight size={36} />
            <p>暂无历史会话</p>
            <p>开始新的对话吧！</p>
          </EmptyContainer>
        )}

        {!loading && !error && threads.map((thread) => (
          <HistoryItem
            key={thread.threadId}
            $isActive={activeThreadId === thread.threadId}
            onClick={() => handleThreadClick(thread)}
          >
            <ItemHeader>
              <ItemTitle>
                <HiChatBubbleLeftRight size={16} />
                <span className="title-text" title={getThreadTitle(thread)}>
                  {getThreadTitle(thread)}
                </span>
              </ItemTitle>
            </ItemHeader>

            <ItemTime>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <BiTime size={12} />
                {formatTime(thread.createdAt.toString())}
              </div>
              <DeleteButton
                onClick={(e) => handleDeleteThread(e, thread.threadId)}
                title="删除会话"
              >
                <MdOutlineDeleteOutline size={18} />
              </DeleteButton>
            </ItemTime>
          </HistoryItem>
        ))}
      </HistoryList>
    </ChatHistoryContainer>
  );
};