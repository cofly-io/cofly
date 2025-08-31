"use client";

import React from "react";
import styled from "styled-components";

const TimestampContainer = styled.div<{ $align?: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  justify-content: ${props => props.$align === 'right' ? 'flex-end' : 'flex-start'};
  
  &:hover {
    opacity: 1;
  }
`;

const TimestampText = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  line-height: 1;
`;

const TimestampIcon = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

interface MessageTimestampProps {
  timestamp?: string | Date | number;
  showIcon?: boolean;
  className?: string;
  align?: 'left' | 'right';
}

export function MessageTimestamp({ 
  timestamp, 
  showIcon = true, 
  className,
  align = 'left'
}: MessageTimestampProps) {
  if (!timestamp) return null;

  const formatTimestamp = (timestamp: string | Date | number) => {
    try {
      let date: Date;
      
      // 处理不同类型的timestamp
      if (typeof timestamp === 'number') {
        // 如果是数字，可能是毫秒或秒级时间戳
        date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '刚刚';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

    // 如果是今天
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return '刚刚';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`;
      } else {
        return `${diffInHours}小时前`;
      }
    }
    
    // 如果是昨天
    if (diffInDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })}`;
    }
    
    // 如果是一周内
    if (diffInDays < 7) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${weekdays[date.getDay()]} ${date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })}`;
    }
    
    // 如果是今年
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    // 其他情况显示完整日期
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return '刚刚';
    }
  };

  return (
    <TimestampContainer className={className} $align={align}>
      {showIcon && (
        <TimestampIcon>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </TimestampIcon>
      )}
      <TimestampText>
        {formatTimestamp(timestamp)}
      </TimestampText>
    </TimestampContainer>
  );
}