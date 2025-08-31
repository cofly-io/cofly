import React, { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaCheck, FaInfo, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { ToastType } from '@repo/common';


// 滑入动画
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// 滑出动画
const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Toast 容器样式
const ToastContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['type', 'isVisible', 'isExiting'].includes(prop),
})<{ type: ToastType; isVisible: boolean; isExiting: boolean }>`
  min-width: 320px;
  max-width: 480px;
  padding: 16px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  //box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 12px;  
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-out;
  
  ${({ type }) => {
    const colors: Record<ToastType, { border: string; bg: string }> = {
      success: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
      info: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      warning: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      error: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
    };
    
    const colorConfig = colors[type as keyof typeof colors] ?? colors.info;
    
    return css`
      border-left: 4px solid ${colorConfig!.border};
      background: linear-gradient(135deg, ${colorConfig!.bg}, rgba(255, 255, 255, 0.9));
    `;
  }}
`;

// 图标容器
const IconContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: ToastType }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  
  ${({ type }) => {
    const colors: Record<ToastType, string> = {
      success: '#22c55e',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    
    const color = colors[type as keyof typeof colors] ?? colors.info; // 使用类型断言和空值合并
    
    return css`
      background: ${color};
      color: white;
      
      svg {
        font-size: 12px;
      }
    `;
  }}
`;

// 内容区域
const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 标题样式
const ToastTitle = styled.h4.withConfig({
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: ToastType }>`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  
  ${({ type }) => {
    const colors: Record<ToastType, string> = {
      success: '#2e7d32',
      info: '#1565c0',
      warning: '#ef6c00',
      error: '#c62828'
    };
    
    const color = colors[type as keyof typeof colors] ?? colors.info; // 使用类型断言和空值合并
    
    return css`
      color: ${color};
    `;
  }}
`;

// 消息内容样式
const ToastMessage = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.7);
`;

// 关闭按钮
const CloseButton = styled.button`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 2px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: scale(1.1);
  }
  
  svg {
    width: 12px;
    height: 12px;
    color: rgba(0, 0, 0, 0.6);
  }
`;

// Toast 属性接口
export interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
}

// 获取对应类型的图标
const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <FaCheck />;
    case 'info':
      return <FaInfo />;
    case 'warning':
      return <FaExclamationTriangle />;
    case 'error':
      return <FaTimes />;
    default:
      return <FaInfo />;
  }
};

// 获取默认标题
const getDefaultTitle = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '成功';
    case 'info':
      return '信息';
    case 'warning':
      return '警告';
    case 'error':
      return '错误';
    default:
      return '通知';
  }
};

// Toast 组件
export const LiquidToast: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 4000,
  onClose,
  autoClose = true,
}) => {
  const [isVisible, setIsVisible] = useState(true); // 初始就设为true，避免闪烁
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 自动关闭
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    // 等待动画完成后调用onClose
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <ToastContainer
      type={type}
      isVisible={isVisible}
      isExiting={isExiting}
    >
      <IconContainer type={type}>
        {getIcon(type)}
      </IconContainer>
      
      <ContentArea>
        <ToastTitle type={type}>
          {title || getDefaultTitle(type)}
        </ToastTitle>
        <ToastMessage>
          {message}
        </ToastMessage>
      </ContentArea>
      
      <CloseButton onClick={handleClose}>
        <MdClose />
      </CloseButton>
    </ToastContainer>
  );
};

// Toast 管理器类型
export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

// Toast 容器组件（用于管理多个Toast）
export const ToastContainer_Manager = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647; /* 使用最大的 z-index 值 */
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;
  
  & > * {
    pointer-events: auto;
  }
  
  @media (max-width: 480px) {
    left: 20px;
    right: 20px;
  }
`;

// Toast 管理器组件
export const ToastManager: React.FC<{ toasts: ToastItem[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <ToastContainer_Manager>
      {toasts.map((toast) => (
        <LiquidToast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </ToastContainer_Manager>
  );
};

// Hook 用于管理 Toast
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'success', title, message, ...options });
  };

  const showInfo = (title: string, message: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'info', title, message, ...options });
  };

  const showWarning = (title: string, message: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'warning', title, message, ...options });
  };

  const showError = (title: string, message: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'error', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  };
};

export default LiquidToast;