import React, { useState } from 'react';
import { CgAttachment } from "react-icons/cg";
import { GiPaperPlane } from "react-icons/gi";
import { TbMessagePlus } from "react-icons/tb";
import { GoHistory } from "react-icons/go";
import { FiAtSign } from "react-icons/fi";
import styled, { keyframes } from 'styled-components';

// 旋转动画
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 加载状态的旋转图标
const SpinnerIcon = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.textTertiary};
  border-top: 2px solid ${({ theme }) => theme.colors.textPrimary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 输入区域
const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.secondaryBorder};
  height: 166px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#0f1b3a' : '#ffffff'};
`;

// 输入框容器
const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#1B2744' : '#f8f9fa'};
`;

// 输入框
const MessageInputField = styled.textarea`
  width: 100%;
  flex: 1;
  padding: 12px 16px 35px 16px;
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#1B2744' : '#ffffff'};
  border: 0px;
  border-radius: 8px 8px 0px 0px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  outline: none;
  resize: none;
  box-sizing: border-box;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f8fafc'};
  }
`;

// 输入框底部工具栏
const InputToolbar = styled.div`
  position: absolute;
  bottom: 6px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 工具栏左侧（附件图标）
const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
`;

// 工具栏右侧（发送图标）
const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
`;

// Tooltip容器
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }
`;

// Tooltip文本
const TooltipText = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(30, 41, 59, 0.9)'};
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;
  z-index: 1000;
  margin-bottom: 5px;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(30, 41, 59, 0.9)'};
  }
`;

// 图标按钮
const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  onNewChat?: () => void;
  onHistoryClick?: () => void;
  onAttachmentClick?: () => void; // 新增：附件按钮点击回调，用于显示历史对话
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showNewChat?: boolean;
  showHistory?: boolean;
  showAttachment?: boolean;
  showAgent?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onNewChat,
  onHistoryClick,
  onAttachmentClick,
  placeholder = "在这里输入消息...",
  isLoading = false,
  disabled = false,
  showNewChat = true,
  showHistory = true,
  showAttachment = true,
  showAgent = true
}) => {
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading && !disabled) {
      onSend(value.trim());
      onChange(''); // 发送后清空输入框
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <InputContainer>
      <InputWrapper>
        <form onSubmit={handleSendMessage} style={{ height: '100%', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
          <MessageInputField
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
          />
          <InputToolbar>
            <ToolbarLeft>
              {showNewChat && (
                <TooltipContainer>
                  <IconButton type="button" onClick={onNewChat}>
                    <TbMessagePlus />
                  </IconButton>
                  <TooltipText className="tooltip">新话题</TooltipText>
                </TooltipContainer>
              )}
              {showHistory && (
                <TooltipContainer>
                  <IconButton type="button" onClick={onHistoryClick}>
                    <GoHistory />
                  </IconButton>
                  <TooltipText className="tooltip">历史会话</TooltipText>
                </TooltipContainer>
              )}
              {showAttachment && (
                <TooltipContainer>
                  <IconButton type="button" onClick={onAttachmentClick}>
                    <CgAttachment />
                  </IconButton>
                  <TooltipText className="tooltip">附件上传</TooltipText>
                </TooltipContainer>
              )}
              {showAgent && (
                <TooltipContainer>
                  <IconButton type="button">
                    <FiAtSign />
                  </IconButton>
                  <TooltipText className="tooltip">智能体</TooltipText>
                </TooltipContainer>
              )}
            </ToolbarLeft>
            <ToolbarRight>
              <TooltipContainer>
                <IconButton type="submit" disabled={isLoading || !value.trim() || disabled}>
                  {isLoading ? (
                    <SpinnerIcon />
                  ) : (
                    <GiPaperPlane />
                  )}
                </IconButton>
                <TooltipText className="tooltip">发送消息</TooltipText>
              </TooltipContainer>
            </ToolbarRight>
          </InputToolbar>
        </form>
      </InputWrapper>
    </InputContainer>
  );
};