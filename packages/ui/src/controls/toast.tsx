
"use client";

import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

// 定义 Toast 容器样式
const ToastContainer = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 50;
  color: white;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  max-width: 90%;
  
  ${({ type }) => type === 'success' && css`
    background-color: #10b981; /* 对应 bg-green-500 */
  `}
  
  ${({ type }) => type === 'error' && css`
    background-color: #ef4444; /* 对应 bg-red-500 */
  `}
  
  /* 添加动画效果 */
  animation: fadeInOut 3s ease-in-out forwards;
  
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    10% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    90% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;

export const Toast = ({ message, type, onClose }: { 
  message: string; 
  type: 'success' | 'error'; 
  onClose: () => void 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ToastContainer type={type}>
      {message}
    </ToastContainer>
  );
};

export default Toast;
