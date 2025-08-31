"use client";

import React from "react";
import styled from "styled-components";
import { UserMessageProps } from "@copilotkit/react-ui";
import { AIIcon } from "./AIIcon";
import { MessageTimestamp } from "./MessageTimestamp";

const UserMessageContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-right: 2.25rem; /* 与助手消息的钻石图标宽度 + gap 对齐 */
  
  &:hover .message-timestamp {
    opacity: 1 !important;
  }
`;

const MessageWrapper = styled.div`
  max-width: 32rem;
`;

const MessageBubble = styled.div`
  background: #2a2a2a;
  color: #e5e5e5;
  border-radius: 1rem 0.25rem 1rem 1rem; /* 右上角使用小圆角，符合Gemini风格 */
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const SubComponentWrapper = styled.div`
  margin-top: 0.5rem;
`;

export function CustomUserMessage(props: UserMessageProps) {
  const { message, subComponent, rawData } = props;

  // 从message对象中提取timestamp，尝试多种可能的字段
  const messageTimestamp = (message as any)?.timestamp || 
                           (message as any)?.createdAt || 
                           (message as any)?.created_at ||
                           (rawData as any)?.timestamp || 
                           (rawData as any)?.createdAt ||
                           new Date().toISOString();
  
  // 调试信息
  React.useEffect(() => {
    console.log('UserMessage - message keys:', Object.keys(message || {}));
    console.log('UserMessage - rawData keys:', Object.keys(rawData || {}));
    console.log('UserMessage - messageTimestamp:', messageTimestamp);
  }, [message, rawData, messageTimestamp]);

  return (
    <>
      <UserMessageContainer data-message-type="user">
        <MessageWrapper>
          {message && (
            <MessageBubble>
              {message}
            </MessageBubble>
          )}
          
          {subComponent && (
            <SubComponentWrapper>
              {subComponent}
            </SubComponentWrapper>
          )}
          
          {/* 时间戳 */}
          {message && (
            <MessageTimestamp 
              timestamp={messageTimestamp || new Date().toISOString()} 
              className="message-timestamp"
              showIcon={false}
              align="right"
            />
          )}
        </MessageWrapper>
      </UserMessageContainer>
      
      {/* 在用户消息后添加AI图标 */}
      <AIIcon />
    </>
  );
}