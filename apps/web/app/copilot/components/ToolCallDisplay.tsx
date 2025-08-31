"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 动画定义
const slideDown = keyframes`
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    max-height: 500px;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
  }
`;

// 工具调用容器
const ToolCallContainer = styled.div`
  margin: 1rem 0;
  border: 1px solid #374151;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #1f2937;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4b5563;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

// 工具调用头部
const ToolCallHeader = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #374151;
    border: none;
    color: #e5e5e5;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 1rem 1rem 1rem 10px;

    &:hover {
        background: #4b5563;
    }
`;

// 工具图标
const ToolIcon = styled.div<{ $toolName: string }>`
  width: 2rem;
  height: 2rem;
  background: ${props => {
    const name = props.$toolName.toLowerCase();
    if (name.includes('search') || name.includes('web')) return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    if (name.includes('file')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (name.includes('code') || name.includes('execute')) return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
    if (name.includes('database') || name.includes('query')) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    if (name.includes('api') || name.includes('http')) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (name.includes('image') || name.includes('vision')) return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
    return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  }};
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 1rem;
    height: 1rem;
    color: white;
  }
`;

// 工具信息
const ToolInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const ToolName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e5e5;
  margin-bottom: 0.25rem;
`;

const ToolDescription = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ToolStatus = styled.div<{ $success: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.$success ? '#10b981' : '#ef4444'};
  margin-top: 0.25rem;
  
  svg {
    width: 0.75rem;
    height: 0.75rem;
  }
`;

// 展开/收起图标
const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  color: #9ca3af;
  
  svg {
    width: 1rem;
    height: 1rem;
  }
`;

// 工具调用内容
const ToolCallContent = styled.div<{ $expanded: boolean }>`
  max-height: ${props => props.$expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: ${props => props.$expanded ? 1 : 0};
`;

const ToolCallInner = styled.div`
  padding: 1rem;
  border-top: 1px solid #374151;
`;

// 结果容器
const ResultContainer = styled.div`
  background: #111827;
  border-radius: 0.5rem;
  border: 1px solid #374151;
  overflow: hidden;
`;

const ResultHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #1f2937;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: between;
  gap: 0.5rem;
`;

const ResultLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid #374151;
  border-radius: 0.25rem;
  color: ${props => props.$copied ? '#10b981' : '#9ca3af'};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background: #374151;
    color: ${props => props.$copied ? '#10b981' : '#e5e5e5'};
  }
`;

const ResultContent = styled.div`
  padding: 1rem;
  
  pre {
    margin: 0;
    background: transparent;
    border: none;
    padding: 0;
    
    code {
      background: transparent;
      color: #d1d5db;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
`;

// 工具调用接口
interface ToolCall {
  id: string;
  name: string;
  result: any;
}

interface ToolCallDisplayProps {
  toolCall: ToolCall;
}

// 获取工具图标
const getToolIcon = (toolName: string) => {
  // 根据工具名称返回不同的图标
  const name = toolName.toLowerCase();
  
  if (name.includes('search') || name.includes('web')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (name.includes('file') || name.includes('read') || name.includes('write')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (name.includes('code') || name.includes('execute') || name.includes('run') || name.includes('shell')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (name.includes('database') || name.includes('query') || name.includes('sql')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    );
  }
  
  if (name.includes('api') || name.includes('http') || name.includes('request')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (name.includes('image') || name.includes('vision') || name.includes('ocr')) {
    return (
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    );
  }
  
  // 默认工具图标
  return (
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  );
};

// 获取工具描述
const getToolDescription = (toolName: string) => {
  const name = toolName.toLowerCase();
  
  if (name.includes('search') || name.includes('web')) {
    return '网络搜索工具';
  }
  if (name.includes('read') && name.includes('file')) {
    return '文件读取工具';
  }
  if (name.includes('write') && name.includes('file')) {
    return '文件写入工具';
  }
  if (name.includes('file')) {
    return '文件操作工具';
  }
  if (name.includes('code') || name.includes('execute') || name.includes('run')) {
    return '代码执行工具';
  }
  if (name.includes('shell') || name.includes('command')) {
    return '命令行工具';
  }
  if (name.includes('database') || name.includes('query') || name.includes('sql')) {
    return '数据库查询工具';
  }
  if (name.includes('api') || name.includes('http') || name.includes('request')) {
    return 'API 调用工具';
  }
  if (name.includes('image') || name.includes('vision') || name.includes('ocr')) {
    return '图像处理工具';
  }
  
  return `${toolName} 工具`;
};

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const resultText = typeof toolCall.result === 'string' 
      ? toolCall.result 
      : JSON.stringify(toolCall.result, null, 2);
    
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 判断工具调用是否成功
  const isSuccess = () => {
    if (typeof toolCall.result === 'object' && toolCall.result !== null) {
      // 检查常见的错误字段
      if ('error' in toolCall.result || 'Error' in toolCall.result) {
        return false;
      }
      // 检查状态字段
      if ('status' in toolCall.result) {
        return toolCall.result.status === 'success' || toolCall.result.status === 'ok';
      }
      // 检查成功字段
      if ('success' in toolCall.result) {
        return toolCall.result.success === true;
      }
    }
    
    if (typeof toolCall.result === 'string') {
      const lowerResult = toolCall.result.toLowerCase();
      if (lowerResult.includes('error') || lowerResult.includes('failed') || lowerResult.includes('exception')) {
        return false;
      }
    }
    
    // 默认认为成功
    return true;
  };

  const success = isSuccess();

  const formatResult = (result: any) => {
    if (typeof result === 'string') {
      // 如果是字符串，检查是否是JSON格式
      try {
        const parsed = JSON.parse(result);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return result;
      }
    }
    
    if (typeof result === 'object' && result !== null) {
      return JSON.stringify(result, null, 2);
    }
    
    return String(result);
  };

  const getResultType = (result: any) => {
    if (typeof result === 'string') {
      try {
        JSON.parse(result);
        return 'json';
      } catch {
        return 'text';
      }
    }
    
    if (typeof result === 'object' && result !== null) {
      return 'json';
    }
    
    return 'text';
  };

  return (
    <ToolCallContainer>
      <ToolCallHeader onClick={() => setExpanded(!expanded)}>
        <ToolIcon $toolName={toolCall.name}>
          {getToolIcon(toolCall.name)}
        </ToolIcon>
        
        <ToolInfo>
          <ToolName>{toolCall.name}</ToolName>
          <ToolDescription>{getToolDescription(toolCall.name)}</ToolDescription>
          <ToolStatus $success={success}>
            {success ? (
              <>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                执行成功
              </>
            ) : (
              <>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                执行失败
              </>
            )}
          </ToolStatus>
        </ToolInfo>
        
        <ExpandIcon $expanded={expanded}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </ExpandIcon>
      </ToolCallHeader>
      
      <ToolCallContent $expanded={expanded}>
        <ToolCallInner>
          <ResultContainer>
            <ResultHeader>
              <ResultLabel>执行结果 ({getResultType(toolCall.result)})</ResultLabel>
              <CopyButton onClick={handleCopy} $copied={copied}>
                {copied ? '已复制' : '复制'}
              </CopyButton>
            </ResultHeader>
            <ResultContent>
              <pre>
                <code>{formatResult(toolCall.result)}</code>
              </pre>
            </ResultContent>
          </ResultContainer>
        </ToolCallInner>
      </ToolCallContent>
    </ToolCallContainer>
  );
}