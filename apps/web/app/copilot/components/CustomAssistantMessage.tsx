"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { AssistantMessageProps } from "@copilotkit/react-ui";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useScroll } from "./ScrollContext";
import { ToolCallDisplay } from "./ToolCallDisplay";
import { MessageTimestamp } from "./MessageTimestamp";
import { Tooltip } from "./Tooltip";

// 动画定义
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

// 主容器
const MessageContainer = styled.div`
  margin-bottom: 1.5rem;
  
  &:hover .message-timestamp {
    opacity: 1 !important;
  }
`;

const MessageContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

// Gemini风格的钻石图标
const DiamondIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const DiamondInner = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  background: white;
  border-radius: 0.25rem;
  transform: rotate(-45deg);
`;

// 占位符，用于保持布局一致性
const IconPlaceholder = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.25rem;
  flex-shrink: 0;
`;

// 消息内容区域
const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 2.25rem; /* 与用户消息的右边距对齐 */
`;

// Markdown样式容器
const MarkdownContainer = styled.div`
  color: #e5e5e5;
  max-width: none;
  
  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #e5e5e5;
    margin: 0 0 1rem 0;
  }
  
  h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e5e5e5;
    margin: 1.5rem 0 0.75rem 0;
  }
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #e5e5e5;
    margin: 1rem 0 0.5rem 0;
  }
  
  p {
    color: #d1d5db;
    line-height: 1.6;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    
    li {
      color: #d1d5db;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }
  }
  
  blockquote {
    border-left: 4px solid #4285f4;
    padding-left: 1rem;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    background: rgba(66, 133, 244, 0.1);
    color: #d1d5db;
    font-style: italic;
    border-radius: 0.25rem;
  }
  
  code {
    background: #374151;
    color: #60a5fa;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }
  
  pre {
    margin: 1rem 0;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #1f2937;
    border: 1px solid #374151;
    
    code {
      display: block;
      padding: 1rem;
      background: transparent;
      color: #d1d5db;
      font-size: 0.875rem;
      overflow-x: auto;
    }
  }
  
  table {
    width: 100%;
    border: 1px solid #374151;
    border-radius: 0.5rem;
    overflow: hidden;
    margin: 1rem 0;
    
    thead {
      background: #374151;
    }
    
    tbody {
      background: #1f2937;
    }
    
    th, td {
      padding: 0.5rem 1rem;
      text-align: left;
      border-bottom: 1px solid #374151;
    }
    
    th {
      font-size: 0.75rem;
      font-weight: 500;
      color: #d1d5db;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    td {
      font-size: 0.875rem;
      color: #d1d5db;
    }
  }
  
  a {
    color: #60a5fa;
    text-decoration: underline;
    
    &:hover {
      color: #93c5fd;
    }
  }
  
  strong {
    font-weight: 600;
    color: #e5e5e5;
  }
  
  em {
    font-style: italic;
    color: #d1d5db;
  }
`;

// 加载状态样式
const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
`;

const Spinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-bottom: 2px solid #60a5fa;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  font-size: 0.875rem;
`;

// 生成状态样式
const GeneratingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Dot = styled.div<{ delay: string }>`
  width: 0.25rem;
  height: 0.25rem;
  background: #60a5fa;
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${props => props.delay};
`;

const GeneratingText = styled.span`
  font-size: 0.875rem;
`;

// 子组件容器
const SubComponentContainer = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #1f2937;
  border-radius: 0.5rem;
  border: 1px solid #374151;
`;

// 控制按钮容器
const ControlsContainer = styled.div<{ $isCurrentMessage: boolean }>`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  opacity: 1;
  transition: opacity 0.2s ease;
  min-height: 2rem;
  
  .message-timestamp {
    opacity: 0.7;
    flex-shrink: 0;
  }
  
  .controls-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 1;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
  }
`;

const ControlButton = styled.button`
  padding: 0.5rem;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #e5e5e5;
    background: #1e3a8a;
  }
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const CopyButton = styled(ControlButton) <{ $copied: boolean }>`
  color: ${props => props.$copied ? '#10b981' : '#9ca3af'};
`;

const ThumbsUpButton = styled(ControlButton)`
  &:hover {
    color: #10b981;
    background: #1e3a8a;
  }
`;

const ThumbsDownButton = styled(ControlButton)`
  &:hover {
    color: #ef4444;
    background: #1e3a8a;
  }
`;

// 思考过程折叠组件样式
const ThinkingContainer = styled.div`
  margin: 2px 0 1rem 0;
  border: 1px solid #374151;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #1f2937;
`;

const ThinkingHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #374151;
  border: none;
  color: #d1d5db;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #4b5563;
  }
`;

const ThinkingIcon = styled.div<{ $expanded: boolean }>`
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

const ThinkingContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  .thinking-inner {
    padding: 1rem;
    color: #9ca3af;
    font-size: 0.875rem;
    line-height: 1.5;
    font-style: italic;
    border-top: 1px solid #374151;
  }
`;

const ThinkingCursor = styled.span`
  display: inline-block;
  width: 0.5rem;
  height: 1rem;
  background: #60a5fa;
  margin-left: 0.25rem;
  animation: ${blink} 1s infinite;
`;

// 工具调用接口
interface ToolCall {
  id: string;
  name: string;
  result: any;
}

// 解析消息内容，支持流式渲染中的实时思考过程显示和工具调用
const parseMessageWithThinking = (message: string) => {
  // 匹配完整的think标签
  const completeThinkRegex = /<think>([\s\S]*?)<\/think>/g;
  const completeThinkMatches = [];
  let match;

  while ((match = completeThinkRegex.exec(message)) !== null) {
    if (match[1]) {
      completeThinkMatches.push(match[1].trim());
    }
  }

  // 检查是否有未完成的think标签（流式输出中）
  const openThinkMatch = message.match(/<think>([\s\S]*?)$/);
  let incompleteThinking = '';
  
  if (openThinkMatch && openThinkMatch[1] && !message.includes('</think>', openThinkMatch.index)) {
    incompleteThinking = openThinkMatch[1];
  }

  // 匹配完整的tool_call标签
  const completeToolCallRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  const toolCalls: ToolCall[] = [];
  let toolMatch;

  while ((toolMatch = completeToolCallRegex.exec(message)) !== null) {
    try {
      // 提取JSON内容，去除可能的markdown代码块标记
      if (!toolMatch[1]) continue;
      let jsonContent = toolMatch[1].trim();
      
      // 移除可能的markdown代码块标记
      jsonContent = jsonContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
      
      const toolCall = JSON.parse(jsonContent);
      if (toolCall.id && toolCall.name) {
        toolCalls.push(toolCall);
      }
    } catch (error) {
      console.warn('Failed to parse tool call:', error);
    }
  }

  // 移除所有think和tool_call相关内容，保留其他内容
  let contentWithoutSpecialTags = message
    .replace(completeThinkRegex, '') // 移除完整的think标签
    .replace(/<think>[\s\S]*?$/, '') // 移除未完成的think标签
    .replace(completeToolCallRegex, '') // 移除完整的tool_call标签
    .trim();

  return {
    thinkingContent: completeThinkMatches,
    incompleteThinking: incompleteThinking,
    toolCalls: toolCalls,
    mainContent: contentWithoutSpecialTags,
    hasActiveThinking: !!(openThinkMatch && !message.includes('</think>', openThinkMatch.index))
  };
};

export function CustomAssistantMessage(props: AssistantMessageProps) {
  const {
    message,
    isLoading,
    isGenerating,
    subComponent,
    onRegenerate,
    onCopy,
    onThumbsUp,
    onThumbsDown,
    isCurrentMessage,
    rawData,
    markdownTagRenderers
  } = props;

  // 从message对象中提取timestamp，尝试多种可能的字段
  const messageTimestamp = (message as any)?.timestamp || 
                           (message as any)?.createdAt || 
                           (message as any)?.created_at ||
                           (rawData as any)?.timestamp || 
                           (rawData as any)?.createdAt ||
                           new Date().toISOString();
  
  // 调试信息
  React.useEffect(() => {
    console.log('AssistantMessage - message keys:', Object.keys(message || {}));
    console.log('AssistantMessage - rawData keys:', Object.keys(rawData || {}));
    console.log('AssistantMessage - messageTimestamp:', messageTimestamp);
  }, [message, rawData, messageTimestamp]);

  const [copied, setCopied] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { autoScroll } = useScroll();

  // 根据autoScroll设置决定滚动行为
  React.useEffect(() => {
    if ((message || isLoading || isGenerating) && !hasScrolled && isCurrentMessage) {
      if (autoScroll) {
        // 自动滚动模式：滚动到消息底部
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      } else {
        // Gemini模式：滚动到用户消息位置并预留空间
        const userMessages = document.querySelectorAll('[data-message-type="user"]');
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        if (lastUserMessage) {
          setTimeout(() => {
            lastUserMessage.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
            
            // 额外向上滚动一点，为AI回答预留空间
            setTimeout(() => {
              window.scrollBy({
                top: -50,
                behavior: 'smooth'
              });
            }, 300);
          }, 100);
        }
      }
      
      setHasScrolled(true);
    }
  }, [message, isLoading, isGenerating, hasScrolled, isCurrentMessage, autoScroll]);
  
  // 解析消息内容
  const parsedMessage = message ? parseMessageWithThinking(message) : { 
    thinkingContent: [], 
    incompleteThinking: '', 
    toolCalls: [],
    mainContent: '', 
    hasActiveThinking: false 
  };

  // 如果有活跃的思考过程，自动展开思考区域
  React.useEffect(() => {
    if (parsedMessage.hasActiveThinking && !thinkingExpanded) {
      setThinkingExpanded(true);
    }
  }, [parsedMessage.hasActiveThinking, thinkingExpanded]);

  const handleCopy = () => {
    if (message && onCopy) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      onCopy(message);
      setTimeout(() => setCopied(false), 2000);
    } else if (message) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
    }
  };

  const handleThumbsUp = () => {
    if (onThumbsUp && rawData) {
      onThumbsUp(rawData);
    }
  };

  const handleThumbsDown = () => {
    if (onThumbsDown && rawData) {
      onThumbsDown(rawData);
    }
  };

  // 加载状态指示器
  const LoadingIndicator = () => (
    <LoadingContainer>
      <Spinner />
      <LoadingText>思考中...</LoadingText>
    </LoadingContainer>
  );

  // 生成状态指示器  
  const GeneratingIndicator = () => (
    <GeneratingContainer>
      <DotsContainer>
        <Dot delay="0s" />
        <Dot delay="0.1s" />
        <Dot delay="0.2s" />
      </DotsContainer>
      <GeneratingText>正在生成...</GeneratingText>
    </GeneratingContainer>
  );



  // 思考过程组件 - 支持流式渲染
  const ThinkingSection = ({ 
    content, 
    incompleteThinking, 
    hasActiveThinking 
  }: { 
    content: string[], 
    incompleteThinking: string,
    hasActiveThinking: boolean 
  }) => {
    const hasAnyThinking = content.length > 0 || incompleteThinking;
    
    if (!hasAnyThinking) return null;

    return (
      <ThinkingContainer>
        <ThinkingHeader onClick={() => setThinkingExpanded(!thinkingExpanded)}>
          <ThinkingIcon $expanded={thinkingExpanded}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </ThinkingIcon>
          <span>
            {thinkingExpanded ? '隐藏思路' : '显示思路'}
            {hasActiveThinking && (
              <span style={{ marginLeft: '0.5rem', color: '#60a5fa' }}>
                (思考中...)
              </span>
            )}
          </span>
        </ThinkingHeader>
        <ThinkingContent $expanded={thinkingExpanded}>
          <div className="thinking-inner">
            {/* 渲染完整的思考内容 */}
            {content.map((think, index) => (
              <div key={index}>
                {think}
                {index < content.length - 1 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
              </div>
            ))}
            
            {/* 渲染正在进行的思考内容 */}
            {incompleteThinking && (
              <div>
                {content.length > 0 && (
                  <>
                    <br />
                    <br />
                  </>
                )}
                {incompleteThinking}
                {hasActiveThinking && <ThinkingCursor />}
              </div>
            )}
          </div>
        </ThinkingContent>
      </ThinkingContainer>
    );
  };

  return (
    <MessageContainer data-message-type="ai">
      {/* 思考过程 */}
      {(parsedMessage.thinkingContent.length > 0 || parsedMessage.incompleteThinking) && (
        <MessageContent>
          <IconPlaceholder />
          <ContentArea>
            <ThinkingSection 
              content={parsedMessage.thinkingContent}
              incompleteThinking={parsedMessage.incompleteThinking}
              hasActiveThinking={parsedMessage.hasActiveThinking}
            />
          </ContentArea>
        </MessageContent>
      )}

      {/* 主要消息内容 */}
      <MessageContent>
        {/* 占位符保持布局一致 */}
        <IconPlaceholder />

        {/* 消息内容 */}
        <ContentArea>
          {/* 工具调用 */}
          {parsedMessage.toolCalls.length > 0 && (
            <div>
              {parsedMessage.toolCalls.map((toolCall, index) => (
                <ToolCallDisplay key={`${toolCall.id}-${index}`} toolCall={toolCall} />
              ))}
            </div>
          )}

          {/* 消息文本 */}
          {parsedMessage.mainContent && (
            <MarkdownContainer>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ...markdownTagRenderers
                }}
              >
                {parsedMessage.mainContent}
              </ReactMarkdown>
            </MarkdownContainer>
          )}

          {/* 加载和生成状态 */}
          {isLoading && <LoadingIndicator />}
          {isGenerating && <GeneratingIndicator />}

          {/* 子组件 */}
          {subComponent && (
            <SubComponentContainer>
              {subComponent}
            </SubComponentContainer>
          )}

          {/* 控制按钮和时间戳 - Gemini风格的简洁按钮 */}
          {message && !isLoading && !isGenerating && (
            <ControlsContainer className="controls" $isCurrentMessage={!!isCurrentMessage}>
              {/* 时间戳 */}
              <MessageTimestamp 
                timestamp={messageTimestamp} 
                className="message-timestamp"
              />
              
              {/* 控制按钮组 */}
              <div className="controls-buttons">
                <Tooltip text={copied ? "已复制" : "复制"}>
                  <CopyButton
                    onClick={handleCopy}
                    $copied={copied}
                  >
                {copied ? (
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                  </CopyButton>
                </Tooltip>

                <Tooltip text="重新生成">
                  <ControlButton
                    onClick={handleRegenerate}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </ControlButton>
                </Tooltip>

              {onThumbsUp && (
                <Tooltip text="赞">
                  <ThumbsUpButton
                    onClick={handleThumbsUp}
                  >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  </ThumbsUpButton>
                </Tooltip>
              )}

              {onThumbsDown && (
                <Tooltip text="踩">
                  <ThumbsDownButton
                    onClick={handleThumbsDown}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.20.485.60L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M17 4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                  </ThumbsDownButton>
                </Tooltip>
              )}
              </div>
            </ControlsContainer>
          )}
        </ContentArea>
      </MessageContent>
    </MessageContainer>
  );
}