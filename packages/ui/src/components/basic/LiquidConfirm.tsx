import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

// 淡入动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 淡出动画
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// 遮罩层
const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.35s ease-out;
`;

// 确认框容器
const ConfirmContainer = styled.div<{
  $isClosing: boolean;
  $position?: { top: number; left: number; width?: number }
}>`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(41, 41, 54, 0.55)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 12px;
  min-width: 300px;
  max-width: 500px;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(59, 130, 246, 0.2)'
    : '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)'
  };
  z-index: 10001;
  
  ${props => props.$position ? `
    position: fixed;
    top: ${props.$position.top}px;
    left: ${props.$position.left}px;
    ${props.$position.width ? `min-width: ${props.$position.width}px;` : ''}
  ` : ''}
  
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.35s ease-out;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1), 
      rgba(168, 85, 247, 0.05)
    );
    border-radius: inherit;
    opacity: 0.6;
    z-index: -1;
  }
`;

// 标题样式
const ConfirmTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  text-align: center;
`;

// 消息样式
const ConfirmMessage = styled.p`
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.2;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  text-align: center;
  white-space: pre-line;
`;

// 按钮容器
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

// 基础按钮样式
const BaseButton = styled.button`
  padding: 0px 20px;
  height:30px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
  backdrop-filter: blur(6px);
  min-width: 60px;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

// 取消按钮
const CancelButton = styled(BaseButton)`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.6)'
    : 'rgba(148, 163, 184, 0.6)'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.8)'
    : 'rgba(148, 163, 184, 0.8)'
  };
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.8)'
    : 'rgba(148, 163, 184, 0.8)'
  };
  }
`;

// 确认按钮
const ConfirmButton = styled(BaseButton)`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.8)'
    : 'rgba(239, 68, 68, 0.9)'
  };
  color: white;
  border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.9)'
    : 'rgba(239, 68, 68, 1)'
  };
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.9)'
    : 'rgba(220, 38, 38, 1)'
  };
  }
`;

// 组件接口
export interface LiquidConfirmProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  triggerElement?: HTMLElement | null;
  positioning?: 'center' | 'below-trigger';
}

// 主组件
const LiquidConfirm: React.FC<LiquidConfirmProps> = ({
  isOpen,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  triggerElement,
  positioning = 'center'
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width?: number } | undefined>();
  const [isPositioned, setIsPositioned] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  // 预计算定位，避免渲染后闪烁
  const calculatePosition = useMemo(() => {
    if (!isOpen || positioning !== 'below-trigger' || !triggerElement) {
      return undefined;
    }

    const rect = triggerElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // 获取窗口尺寸
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 确认框的预估尺寸（基于CSS中的min-width和padding）
    const confirmWidth = 300; // min-width
    const confirmHeight = 200; // 增加预估高度

    let top = rect.bottom + scrollTop + 8;
    let left = rect.left + scrollLeft;

    // 检查右边界 - 让对话框右对齐按钮
    if (left + confirmWidth > windowWidth) {
      left = rect.right + scrollLeft - confirmWidth;
    }

    // 检查左边界
    if (left < scrollLeft + 16) {
      left = scrollLeft + 16;
    }

    // 检查下边界
    if (top + confirmHeight > windowHeight + scrollTop) {
      // 如果下方空间不够，显示在触发元素上方
      top = rect.top + scrollTop - confirmHeight - 8;
    }

    // 检查上边界
    if (top < scrollTop + 16) {
      top = scrollTop + 16;
    }

    return { top, left, width: Math.max(rect.width, 200) };
  }, [isOpen, triggerElement, positioning]);

  // 设置位置和显示状态
  useEffect(() => {
    if (isOpen) {
      if (positioning === 'below-trigger' && triggerElement) {
        if (calculatePosition) {
          setPosition(calculatePosition);
        } else {
          setPosition(undefined);
        }
        setIsPositioned(true);
      } else {
        setPosition(undefined);
        setIsPositioned(true);
      }
    } else {
      setIsPositioned(false);
      setPosition(undefined);
    }
  }, [isOpen, calculatePosition, positioning, triggerElement]);

  // 处理ESC键
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleConfirm = () => {
    console.log('🔍 [LiquidConfirm主组件] handleConfirm 被调用, 时间:', new Date().toISOString());
    setIsClosing(true);
    setTimeout(() => {
      console.log('🔍 [LiquidConfirm主组件] 调用 onConfirm, 时间:', new Date().toISOString());
      onConfirm();
      setIsClosing(false);
    }, 350);
  };

  const handleCancel = () => {
    console.log('🔍 [LiquidConfirm主组件] handleCancel 被调用, 时间:', new Date().toISOString());
    setIsClosing(true);
    setTimeout(() => {
      console.log('🔍 [LiquidConfirm主组件] 调用 onCancel, 时间:', new Date().toISOString());
      onCancel();
      setIsClosing(false);
    }, 350);
  };

  if (!isOpen || !isPositioned) return null;

  const confirmDialog = (
    <ConfirmContainer
      ref={confirmRef}
      $isClosing={isClosing}
      $position={position}
    >
      {title && <ConfirmTitle>{title}</ConfirmTitle>}
      <ConfirmMessage>{message}</ConfirmMessage>
      <ButtonContainer>
        <CancelButton onClick={handleCancel}>
          {cancelText}
        </CancelButton>
        <ConfirmButton onClick={handleConfirm}>
          {confirmText}
        </ConfirmButton>
      </ButtonContainer>
    </ConfirmContainer>
  );

  // 如果是居中定位，使用遮罩层
  if (positioning === 'center') {
    return createPortal(
      <Overlay $isClosing={isClosing} onClick={handleCancel}>
        <div onClick={(e) => e.stopPropagation()}>
          {confirmDialog}
        </div>
      </Overlay>,
      document.body
    );
  }

  // 如果是相对触发元素定位，直接渲染到body
  return createPortal(confirmDialog, document.body);
};

export default LiquidConfirm;

 