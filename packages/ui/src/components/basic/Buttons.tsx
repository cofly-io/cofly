/**
 * 统一按钮组件 - 支持多种变体和尺寸
 * Unified Button Component - Multiple Variants and Sizes
 */
"use client";


import React from 'react';
import styled, { css } from 'styled-components';
import { DESIGN_TOKENS } from '../system/tokens';
// 按钮变体类型 Button Variant Types
export type ButtonVariant = 'liquid' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'Glass';

// 按钮尺寸类型 Button Size Types
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 按钮属性接口 Button Props Interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 Button variant */
  variant?: ButtonVariant;
  /** 按钮尺寸 Button size */
  size?: ButtonSize;
  /** 是否为加载状态 Loading state */
  loading?: boolean;
  /** 是否为全宽按钮 Full width button */
  fullWidth?: boolean;
  /** 自定义宽度 Custom width */
  width?: string;
  /** 自定义高度 Custom height */
  height?: string;
  /** 图标 Icon */
  icon?: React.ReactNode;
  /** 图标位置 Icon position */
  iconPosition?: 'left' | 'right';
  /*控件弧度*/
  radian?: string;
  /*按钮背景 */
  backgroundColor?: string;
}

// 获取按钮变体样式 Get Button Variant Styles
const getVariantStyles = (variant: ButtonVariant) => {
  const { colors } = DESIGN_TOKENS;
  switch (variant) {
    case 'liquid':
      return css`
        background: ${({ theme }) => theme.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4))'
          : 'linear-gradient(135deg, rgba(88, 246, 59, 0.2), rgba(14, 233, 194, 0.2))'
        };
        color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
        border: 1px solid ${({ theme }) => theme.mode === 'dark'
          ? 'rgba(59, 130, 246, 0.4)'
          : 'rgba(11, 153, 187, 0.1)'
        };  
        padding: 8px 24px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        box-shadow: ${({ theme }) => theme.mode === 'dark'
          ? '0 6px 20px rgba(59, 130, 246, 0.25)'
          : '0 6px 20px rgba(59, 130, 246, 0.15)'
        };
  
        &::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }
  
        &:hover {
          border-color: rgba(59, 130, 246, 0.6);
        }
        
        &:hover::before {
          left: 100%;
        }
        svg {
          margin-bottom:-2px;
          margin-right: 6px; 
        }
      `;
    case 'Glass':
      return css`
        background: rgba(255, 255, 255, 0.08); 
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        height: 28px;
        padding: 0px 14px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        backdrop-filter: blur(4px);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        &:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        &:after {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        svg {
          margin-bottom:-2px;
          margin-right: 6px; 
        }
      `;
    case 'secondary':
      return css`
        background: ${colors.background};
        color: ${colors.text.liquid};
        border-color: ${colors.border};
        
        &:hover:not(:disabled) {
          background: ${colors.backgroundHover};
          border-color: ${colors.borderHover};
        }
      `;

    case 'success':
      return css`
        background: ${colors.success};
        color: ${colors.text.inverse};
        border-color: ${colors.success};
        
        &:hover:not(:disabled) {
          background: ${colors.successHover};
          border-color: ${colors.successHover};
        }
      `;

    case 'warning':
      return css`
        background: ${colors.warning};
        color: ${colors.text.inverse};
        border-color: ${colors.warning};
        
        &:hover:not(:disabled) {
          background: ${colors.warningHover};
          border-color: ${colors.warningHover};
        }
      `;

    case 'error':
      return css`
        background: ${colors.error};
        color: ${colors.text.inverse};
        border-color: ${colors.error};
        
        &:hover:not(:disabled) {
          background: ${colors.errorHover};
          border-color: ${colors.errorHover};
        }
      `;

    case 'ghost':
      return css`
        background: transparent;
        color: ${colors.liquid};
        border-color: transparent;
        
        &:hover:not(:disabled) {
          background: ${colors.backgroundHover};
          color: ${colors.liquidHover};
        }
      `;

    case 'link':
      return css`
        background: transparent;
        color: ${colors.liquid};
        border-color: transparent;
        text-decoration: underline;
        
        &:hover:not(:disabled) {
          color: ${colors.liquidHover};
        }
      `;

    default:
      return css``;
  }
};

// 获取按钮尺寸样式 Get Button Size Styles
const getSizeStyles = (size: ButtonSize) => {
  const { sizes, spacing, typography } = DESIGN_TOKENS;

  switch (size) {
    case 'xs':
      return css`
        height: ${sizes.height.xs};
        padding: 0 ${spacing[2]};
        font-size: ${typography.fontSize.xs};
      `;

    case 'sm':
      return css`
        height: ${sizes.height.sm};
        padding: 0 ${spacing[3]};
        font-size: ${typography.fontSize.sm};
      `;

    case 'md':
      return css`
        height: ${sizes.height.md};
        padding: 0 ${spacing[4]};
        font-size: ${typography.fontSize.md};
      `;

    case 'lg':
      return css`
        height: ${sizes.height.lg};
        padding: 0 ${spacing[5]};
        font-size: ${typography.fontSize.lg};
      `;

    case 'xl':
      return css`
        height: ${sizes.height.xl};
        padding: 0 ${spacing[6]};
        font-size: ${typography.fontSize.xl};
      `;

    default:
      return css``;
  }
};

const getRadianStyles = (radian: string) => {
  switch (radian) {
    case 'left':
      return css`
        border-radius: 20px 0px 0px 20px;;
      `;
    case 'right':
      return css`
        border-radius: 0px 20px 20px 0px;
      `;
    case 'middle':
      return css`
        border-radius: 0px 0px 0px 0px;
      `;

    default:
      return css``;
  }
}

// 样式化按钮组件 Styled Button Component
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'variant', 'size', 'loading', 'width', 'backgroundColor', 'height', 'radian', 'iconPosition'].includes(prop),
}) <ButtonProps>`
   /* 尺寸样式 Size Styles */
  ${({ size = 'md' }) => getSizeStyles(size)}
  /* 变体样式 Variant Styles */
  ${({ variant = 'liquid' }) => getVariantStyles(variant)}
  
  ${({ radian }) => radian && getRadianStyles(radian)}

  /* 自定义背景色样式 Custom Background Color */
  ${({ backgroundColor }) => backgroundColor && css`
    background: ${backgroundColor} !important;
    
    &:hover {
      ${backgroundColor.includes('gradient')
      ? `background: ${backgroundColor} !important; filter: brightness(1.2);`
      : `background: ${backgroundColor}CC !important;`
    }
    }
  `}}
  
  /* 全宽样式 Full Width */
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  /* 自定义尺寸 Custom Size */
  ${({ width }) => width && css`
    width: ${width};
  `}
  
  ${({ height }) => height && css`
    height: ${height};
  `}
 `;

// 加载指示器 Loading Indicator
const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 图标容器 Icon Container
const IconContainer = styled.span<{ position: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ position }) => position === 'right' && css`order: 1;`}
`;

/**
 * 按钮组件 Button Component
 */
export const CoButton: React.FC<ButtonProps> = ({
  children,
  variant = 'liquid',
  size = 'md',
  loading = false,
  fullWidth = false,
  width,
  backgroundColor,
  height,
  icon,
  radian,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      // loading={loading}
      fullWidth={fullWidth}
      backgroundColor={backgroundColor}
      width={width}
      radian={radian}
      height={height}
      disabled={disabled || loading}
      {...props}
    >
      {/* {loading && <LoadingSpinner />} */}
      {icon && !loading && (
        <IconContainer position={iconPosition}>
          {icon}
        </IconContainer>
      )}
      {children}
    </StyledButton>
  );
};