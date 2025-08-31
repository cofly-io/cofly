"use client";

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { InputProps } from "@copilotkit/react-ui";
import { useSession } from "next-auth/react";
import { useScroll } from "./ScrollContext";
import { Tooltip } from "./Tooltip";
import { useChatHistory } from "../contexts/ChatHistoryContext";
import { useUrlSync } from "../hooks/useUrlSync";

const InputContainer = styled.div`
  position: sticky;
  bottom: 0;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
`;

const InputWrapper = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
`;

const InputForm = styled.form`
  display: flex;
  align-items: flex-end;
  background: #2a2a2a;
  border: 1px solid #404040;
  border-radius: 28px;
  padding: 8px 12px;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  color: #e5e5e5;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.5;
  min-height: 20px;
  max-height: 120px;
  padding: 6px 0;
  
  &::placeholder {
    color: #9aa0a6;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #9aa0a6;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e5e5e5;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${props => props.$active ? '#ffffff' : '#9aa0a6'};
  background: ${props => props.$active ? '#4285f4' : 'transparent'};
  border: ${props => props.$active ? '1px solid #4285f4' : '1px solid transparent'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.$active ? '#3367d6' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$active ? '#ffffff' : '#e5e5e5'};
    border-color: ${props => props.$active ? '#3367d6' : 'transparent'};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
    transform: ${props => props.$active ? 'rotate(0deg)' : 'rotate(0deg)'};
  }
  
  /* 添加一个小的指示点 */
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background: ${props => props.$active ? '#34a853' : 'transparent'};
    border-radius: 50%;
    border: 2px solid #1a1a1a;
    transition: all 0.2s ease;
    opacity: ${props => props.$active ? 1 : 0};
    transform: scale(${props => props.$active ? 1 : 0});
  }
`;

const SendButton = styled.button<{ $hasContent: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.$hasContent ? '#4285f4' : 'transparent'};
  color: ${props => props.$hasContent ? 'white' : '#9aa0a6'};
  border: none;
  border-radius: 50%;
  cursor: ${props => props.$hasContent ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$hasContent ? '#3367d6' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$hasContent ? 'white' : '#e5e5e5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export function CustomInput(props: InputProps) {
  const { inProgress, onSend, isVisible = true, onStop, onUpload, hideStopButton } = props;
  
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { autoScroll, setAutoScroll } = useScroll();
  const { currentThreadId, createNewThread } = useChatHistory();
  const { updateUrl, currentAgent } = useUrlSync();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !inProgress) {
      const message = inputValue.trim();
      
      // 如果没有当前对话，创建新对话
      if (!currentThreadId) {
        try {
          const { data: session } = useSession();
          const newThreadId = await createNewThread(currentAgent, session?.user?.id);
          updateUrl(newThreadId, currentAgent);
        } catch (error) {
          console.error('Failed to create new thread:', error);
        }
      }
      
      setInputValue("");
      await onSend(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 检查是否在输入法组合状态中
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  if (!isVisible) return null;

  return (
    <InputContainer>
      <InputWrapper>
        <InputForm onSubmit={handleSubmit}>
          {/* 输入框 */}
          <TextArea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="向 AI助手 提问"
            disabled={inProgress}
            rows={1}
          />

          {/* 右侧功能按钮 */}
          <ActionButtons>
            {/* 自动滚动toggle按钮 */}
            <Tooltip text={autoScroll ? "关闭自动滚动" : "开启自动滚动"}>
              <ToggleButton 
                type="button" 
                $active={autoScroll}
                onClick={() => setAutoScroll(!autoScroll)}
              >
                {autoScroll ? (
                  // 激活状态：显示双箭头向下（表示自动滚动）
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    <path d="M7.41 14.59L12 19.17l4.59-4.58L18 16l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                ) : (
                  // 未激活状态：显示单箭头向下
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
              </ToggleButton>
            </Tooltip>

            {/* Canvas按钮 */}
            <Tooltip text="Canvas">
              <ActionButton type="button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </ActionButton>
            </Tooltip>

            {/* 图片按钮 */}
            <Tooltip text="上传图片">
              <ActionButton type="button" onClick={onUpload}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </ActionButton>
            </Tooltip>

            {/* 学习辅导按钮 */}
            <Tooltip text="学习辅导">
              <ActionButton type="button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </ActionButton>
            </Tooltip>

            {/* 语音按钮 */}
            <Tooltip text="语音输入">
              <ActionButton type="button">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </ActionButton>
            </Tooltip>

            {/* 停止/发送按钮 */}
            {inProgress && !hideStopButton ? (
              <Tooltip text="停止生成">
                <SendButton 
                  type="button" 
                  onClick={onStop}
                  $hasContent={true}
                >
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </SendButton>
              </Tooltip>
            ) : (
              <Tooltip text={inputValue.trim() ? "发送消息" : "请输入消息"}>
                <SendButton 
                  type="submit" 
                  $hasContent={inputValue.trim().length > 0}
                  disabled={!inputValue.trim() || inProgress}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </SendButton>
              </Tooltip>
            )}
          </ActionButtons>
        </InputForm>
      </InputWrapper>
    </InputContainer>
  );
}