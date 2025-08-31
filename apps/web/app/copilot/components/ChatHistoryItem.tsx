"use client";

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ChatThread, useChatHistory } from "../contexts/ChatHistoryContext";

// 样式组件
const ItemContainer = styled.div<{ $isActive: boolean }>`
  position: relative;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.$isActive ? '#2a2a2a' : 'transparent'};
  border: 1px solid ${props => props.$isActive ? '#4285f4' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#2a2a2a' : '#1f1f1f'};
    
    .item-actions {
      opacity: 1;
    }
  }
`;

const ItemButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  gap: 0.25rem;
`;

const ItemTitle = styled.div<{ $isActive: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$isActive ? '#e5e5e5' : '#d1d5db'};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  margin-bottom: 0.25rem;
`;

const ItemPreview = styled.div`
  font-size: 0.75rem;
  color: #9aa0a6;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  margin-bottom: 0.25rem;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 0.75rem;
  color: #9aa0a6;
`;

const ItemTime = styled.span`
  flex-shrink: 0;
`;

const MessageCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const ItemActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$variant === 'danger' ? '#ef4444' : '#404040'};
  border: none;
  border-radius: 0.25rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? '#dc2626' : '#4b5563'};
    transform: scale(1.05);
  }
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  background: #1a1a1a;
  border: 1px solid #4285f4;
  border-radius: 0.25rem;
  color: #e5e5e5;
  font-size: 0.875rem;
  outline: none;
  
  &::placeholder {
    color: #9aa0a6;
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const EditButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.25rem 0.5rem;
  background: ${props => props.$variant === 'primary' ? '#4285f4' : 'transparent'};
  border: 1px solid ${props => props.$variant === 'primary' ? '#4285f4' : '#404040'};
  border-radius: 0.25rem;
  color: ${props => props.$variant === 'primary' ? 'white' : '#e5e5e5'};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#3367d6' : '#2a2a2a'};
  }
`;

interface ChatHistoryItemProps {
  thread: ChatThread;
  isActive: boolean;
  onClick: () => void;
}

export function ChatHistoryItem({ thread, isActive, onClick }: ChatHistoryItemProps) {
  const { deleteThread, renameThread } = useChatHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // 开始编辑
  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(thread.title);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (editTitle.trim() && editTitle !== thread.title) {
      try {
        await renameThread(thread.id, editTitle.trim());
      } catch (error) {
        console.error('Failed to rename thread:', error);
      }
    }
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(thread.title);
  };

  // 删除对话
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('确定要删除这个对话吗？此操作无法撤销。')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteThread(thread.id);
    } catch (error) {
      console.error('Failed to delete thread:', error);
      setIsDeleting(false);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // 自动聚焦编辑输入框
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  if (isDeleting) {
    return (
      <ItemContainer $isActive={false}>
        <ItemButton>
          <ItemTitle $isActive={false}>删除中...</ItemTitle>
        </ItemButton>
      </ItemContainer>
    );
  }

  return (
    <ItemContainer $isActive={isActive}>
      {isEditing ? (
        <div style={{ padding: '0.75rem' }}>
          <EditInput
            ref={editInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入对话标题..."
          />
          <EditActions>
            <EditButton $variant="primary" onClick={handleSaveEdit}>
              保存
            </EditButton>
            <EditButton $variant="secondary" onClick={handleCancelEdit}>
              取消
            </EditButton>
          </EditActions>
        </div>
      ) : (
        <>
          <ItemButton onClick={onClick}>
            <ItemTitle $isActive={isActive}>
              {thread.title}
            </ItemTitle>
            
            {thread.lastMessage && (
              <ItemPreview>
                {thread.lastMessage}
              </ItemPreview>
            )}
            
            <ItemMeta>
              <MessageCount>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {thread.messageCount}
              </MessageCount>
              
              <ItemTime>
                {formatTime(thread.lastMessageAt)}
              </ItemTime>
            </ItemMeta>
          </ItemButton>

          <ItemActions className="item-actions">
            <ActionButton onClick={handleStartEdit} title="重命名">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </ActionButton>
            
            <ActionButton $variant="danger" onClick={handleDelete} title="删除">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ActionButton>
          </ItemActions>
        </>
      )}
    </ItemContainer>
  );
}