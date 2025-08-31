import React from 'react';
import styled from 'styled-components';

// 表单字段容器
export const FormField = styled.div`
  margin-bottom: 12px;
`;

// 标签样式
export const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  
  .required {
    color: #ef4444;
  }
`;

// 输入框样式
export const FormInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'};
  border-radius: 4px;
  font-size: 14px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af'};
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// 文本域样式
export const FormTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  resize: vertical;
  min-height: 80px;
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af'};
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// 选择框样式
export const FormSelect = styled.select`
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'};
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
  
  option {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
    padding: 8px 12px;
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// 按钮样式
export const FormButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0px 16px;
  align-items: center;
  justify-content: center;
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  /*color: ${({ $variant, theme }) => $variant === 'primary' ? 'white' :
    (theme.mode === 'dark' ? '#374151' : '#374151')};*/
  color:#ffffff80;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width:24px;
  height:24px;
  &:hover {
    /*background: ${({ $variant }) => $variant === 'primary' ? '#2563eb' : '#e5e7eb'};*/
    color:white
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 按钮组容器
export const FormButtonGroup = styled.div`
 position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 8px 12px;
  flex-shrink: 0; /* Prevent footer from shrinking */
  display: flex;
  gap: 12px;
  // margin-top: 14px;
  // padding-top: 20px;
  //order-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0'};
`; 