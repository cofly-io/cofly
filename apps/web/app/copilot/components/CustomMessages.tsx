"use client";

import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { MessagesProps } from "@copilotkit/react-ui";
import { useScroll } from "./ScrollContext";
import { useChatHistory } from "../contexts/ChatHistoryContext";


// 样式组件
const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
`;

const MessagesWrapper = styled.div`
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const ScrollAnchor = styled.div`
  height: 1px;
  width: 1px;
`;

const WelcomeContainer = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const WelcomeIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  margin: 0 auto 1rem;
`;

const WelcomeIconInner = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 0.375rem;
  transform: rotate(-45deg);
`;

const WelcomeTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: #e5e5e5;
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
`;

export function CustomMessages(props: MessagesProps) {
  const {
    messages,
    inProgress,
    children,
    AssistantMessage,
    UserMessage,
    RenderTextMessage,
    RenderActionExecutionMessage,
    RenderAgentStateMessage,
    RenderResultMessage,
    RenderImageMessage,
    onRegenerate,
    onCopy,
    onThumbsUp,
    onThumbsDown,
    markdownTagRenderers
  } = props;

  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { autoScroll } = useScroll();
  const { updateCurrentThreadInfo, currentThreadId } = useChatHistory();

  // 自动滚动到底部（仅在autoScroll开启时）
  const scrollToBottom = () => {
    if (scrollAnchorRef.current && autoScroll) {
      scrollAnchorRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // 当autoScroll开启时，监听消息变化和生成状态
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages.length, inProgress, autoScroll]);

  // 监听消息内容变化（用于流式生成时的滚动）
  useEffect(() => {
    if (inProgress && autoScroll) {
      const timer = setInterval(() => {
        scrollToBottom();
      }, 100); // 每100ms检查一次是否需要滚动

      return () => clearInterval(timer);
    }
  }, [inProgress, autoScroll]);

  // 监听消息变化，更新对话历史信息
  useEffect(() => {
    if (!currentThreadId || messages.length === 0) return;

    // 获取最后一条消息的文本内容
    const getMessageText = (message: any) => {
      if (message.isTextMessage()) {
        return message.content || '';
      }
      if (message.isActionExecutionMessage()) {
        return message.content || '执行了一个操作';
      }
      if (message.isAgentStateMessage()) {
        return message.content || '代理状态更新';
      }
      if (message.isResultMessage()) {
        return message.content || '返回了结果';
      }
      if (message.isImageMessage()) {
        return '发送了一张图片';
      }
      return '发送了一条消息';
    };

    const lastMessage = messages[messages.length - 1];
    const lastMessageText = getMessageText(lastMessage);
    
    // 只在消息完成时更新（不在生成过程中频繁更新）
    if (!inProgress) {
      // 使用防抖，避免频繁更新
      const timer = setTimeout(() => {
        updateCurrentThreadInfo(messages.length, lastMessageText);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [messages, inProgress, currentThreadId, updateCurrentThreadInfo]);

  return (
    <MessagesContainer ref={messagesContainerRef}>
      <MessagesWrapper>
        {/* 欢迎消息 */}
        {messages.length === 0 && (
          <WelcomeContainer>
            <WelcomeIcon>
              <WelcomeIconInner />
            </WelcomeIcon>
            <WelcomeTitle>
              你好！我是你的AI助手
            </WelcomeTitle>
            <WelcomeSubtitle>
              有什么可以帮助你的吗？
            </WelcomeSubtitle>
          </WelcomeContainer>
        )}

        {/* 消息列表 */}
        {messages.map((message, index) => {
          const isCurrentMessage = index === messages.length - 1;
          
          if (message.isTextMessage()) {
            return (
              <RenderTextMessage
                key={message.id || index}
                message={message}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={isCurrentMessage}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                markdownTagRenderers={markdownTagRenderers}
              />
            );
          }

          if (message.isActionExecutionMessage()) {
            return (
              <RenderActionExecutionMessage
                key={message.id || index}
                message={message}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={isCurrentMessage}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                markdownTagRenderers={markdownTagRenderers}
              />
            );
          }

          if (message.isAgentStateMessage()) {
            return (
              <RenderAgentStateMessage
                key={message.id || index}
                message={message}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={isCurrentMessage}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                markdownTagRenderers={markdownTagRenderers}
              />
            );
          }

          if (message.isResultMessage()) {
            return (
              <RenderResultMessage
                key={message.id || index}
                message={message}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={isCurrentMessage}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                markdownTagRenderers={markdownTagRenderers}
              />
            );
          }

          if (message.isImageMessage()) {
            return (
              <RenderImageMessage
                key={message.id || index}
                message={message}
                inProgress={inProgress}
                index={index}
                isCurrentMessage={isCurrentMessage}
                AssistantMessage={AssistantMessage}
                UserMessage={UserMessage}
                onRegenerate={onRegenerate}
                onCopy={onCopy}
                onThumbsUp={onThumbsUp}
                onThumbsDown={onThumbsDown}
                markdownTagRenderers={markdownTagRenderers}
              />
            );
          }

          return null;
        })}

        {children}
        
        {/* 滚动锚点 */}
        <ScrollAnchor ref={scrollAnchorRef} />
      </MessagesWrapper>
    </MessagesContainer>
  );
}