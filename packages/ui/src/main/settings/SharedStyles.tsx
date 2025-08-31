"use client";

import styled from 'styled-components';

// 基础表单组件
export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 6px 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 按钮组件
export const Button = styled.button`
  background: linear-gradient(125deg,rgb(231, 23, 197), #1d4ed8);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const SecondaryButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.8)'
    : 'rgba(148, 163, 184, 0.2)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.6)'
    : 'rgba(148, 163, 184, 0.4)'
  };
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(71, 85, 105, 1)'
      : 'rgba(148, 163, 184, 0.3)'
    };
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const DangerButton = styled.button`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

// Toggle 开关组件
export const Toggle = styled.button<{ $active?: boolean }>`
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ $active, theme }) => $active
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    : theme.mode === 'dark'
      ? '#374151'
      : '#d1d5db'
  };
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $active }) => $active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// 设置行组件
export const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const SettingInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 4px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`;

// 容器组件
export const SettingsContainer = styled.div`
  padding: 24px;
`;

// 帮助文本组件
export const HelpText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
`;

// 输入文件组件
export const FileInput = styled.input`
  display: none;
`;

export const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.8)'
    : 'rgba(148, 163, 184, 0.2)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.6)'
    : 'rgba(148, 163, 184, 0.4)'
  };
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(71, 85, 105, 1)'
      : 'rgba(148, 163, 184, 0.3)'
    };
    transform: translateY(-1px);
  }
`;

// 进度条组件
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(148, 163, 184, 0.3)'
  };
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
`;

export const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
`;

// 状态文本组件
export const StatusText = styled.div<{ $type?: 'success' | 'error' | 'warning' | 'info' }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $type, theme }) => {
    switch ($type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return theme.colors.textSecondary;
    }
  }};
`;