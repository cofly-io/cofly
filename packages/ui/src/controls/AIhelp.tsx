"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { RiAiGenerate2 } from 'react-icons/ri';

/**
 * AIhelp控件属性接口
 */
export interface AIhelpProps {
  /** 图标大小 */
  size?: number | string;
  /** 图标颜色 */
  color?: string;
  /** 提示词 */
  rules?: string;
  /** 当前输入内容 */
  content?: string;
  /** 点击回调函数 */
  onClick?: (rules: string, content: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 工具提示文本 */
  tooltip?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
}

const AIhelpContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['disabled', 'loading'].includes(prop),
})<{
  disabled?: boolean;
  loading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled, loading }) => 
    disabled || loading ? 'not-allowed' : 'pointer'
  };
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 2px;
  position: relative;
  
  &:hover {
    background: ${({ disabled, loading }) => 
      disabled || loading 
        ? 'transparent' 
        : 'rgba(59, 130, 246, 0.3)'
    };
  }
  
  &:active {
    transform: ${({ disabled, loading }) => 
      disabled || loading ? 'none' : 'scale(0.95)'
    };
  }
  
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
`;

const LoadingSpinner = styled.div<{ size: number | string; color: string }>`
  width: ${({ size }) => typeof size === 'number' ? `${size}px` : size};
  height: ${({ size }) => typeof size === 'number' ? `${size}px` : size};
  border: 2px solid transparent;
  border-top: 2px solid ${({ color }) => color};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AIhelpWrapper = styled.div`
  position: relative;  
`;

/**
 * AIhelp控件组件
 * 提供AI助手功能的图标按钮，支持自定义大小、颜色和交互
 */
export const AIhelp: React.FC<AIhelpProps> = ({
  size = 18,
  color = '#3b82f6',
  rules = '',
  content = '',
  onClick,
  disabled = false,
  className,
  style,
  tooltip = 'AI生成',
  loading = false
}) => {

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(rules, content);
    }
  };

  return (
    <AIhelpWrapper className={className} style={style}>
      <AIhelpContainer
        disabled={disabled}
        loading={loading}
        onClick={handleClick}
        role="button"
        title='辅助生成'
        tabIndex={disabled || loading ? -1 : 0}
        aria-label={tooltip}
        aria-disabled={disabled || loading}
      >
        {loading ? (
          <LoadingSpinner size={size} color={color} />
        ) : (
          <RiAiGenerate2
            size={size}
            color={disabled ? '#9ca3af' : color}
            style={{
              transition: 'color 0.2s ease'
            }}
          />
        )}
      </AIhelpContainer>
    </AIhelpWrapper>
  );
};

export default AIhelp;