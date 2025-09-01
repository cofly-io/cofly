"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { ConnectSettings } from './ConnectSettings';
import { ILLMConnect, IConnect } from '@repo/common';

// 连接详情内容容器 - 适合在模态框内部使用
const DetailsContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(100, 116, 139, 0.15)'
    : 'rgba(100, 116, 139, 0.1)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(100, 116, 139, 0.3)'
    : 'rgba(100, 116, 139, 0.2)'
  };
  border-radius: 6px;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(100, 116, 139, 0.25)'
    : 'rgba(100, 116, 139, 0.15)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
  }
`;

interface ConnectDetailsViewProps {
  connect: IConnect | ILLMConnect; // 支持通用连接和 LLM 连接类型
  savedValues?: Record<string, any>;
  onClose: () => void; // 回退功能
  onSave: (connectData: any) => void;
  onTest?: (config: Record<string, any>, message?: string) => Promise<any>;
  onStreamTest?: (config: Record<string, any>, message: string, onChunk: (chunk: string) => void) => Promise<any>;
  editMode?: boolean;
  editData?: {
    id: string;
    connectId: string;
    name: string;
    config: Record<string, any>;
  };
  showBackButton?: boolean; // 是否显示回退按钮
}

export const ConnectDetailsView: React.FC<ConnectDetailsViewProps> = ({
  connect,
  savedValues = {},
  onClose,
  onSave,
  onTest,
  onStreamTest,
  editMode = false,
  editData,
  showBackButton = false
}) => {

  const handleSave = async (connectData: any) => {
    // 添加连接类型信息到保存数据中
    const saveData = {
      ...connectData,
      mtype: connect.overview.type
    };
    await onSave(saveData);
    onClose();
  };

  // 创建包装的测试函数，自动包含连接ID
  const handleTest = async (config: Record<string, any>, message?: string) => {
    if (onTest) {
      // 将连接ID添加到配置中
      const configWithConnectId = {
        ...config,
        connectId: connect.overview.id
      };
      return await onTest(configWithConnectId, message);
    }
  };

  // 创建包装的流式测试函数，自动包含连接ID
  const handleStreamTest = async (config: Record<string, any>, message: string, onChunk: (chunk: string) => void) => {
    if (onStreamTest) {
      // 将连接ID添加到配置中
      const configWithConnectId = {
        ...config,
        connectId: connect.overview.id
      };
      return await onStreamTest(configWithConnectId, message, onChunk);
    }
  };

  // 使用 connect.editInfo 而不是 editData
  const actualEditData = (connect as any).editInfo || editData;
  const actualSavedValues = editMode && actualEditData ? actualEditData.config : savedValues;

  return (
    <DetailsContent>
      <ConnectSettings
        connect={connect}
        savedValues={actualSavedValues}
        onClose={onClose}
        onSave={handleSave}
        onTest={handleTest}
        editMode={editMode}
        editData={actualEditData}
        showBackButton={showBackButton}
        onBack={onClose}
      />
    </DetailsContent>
  );
};