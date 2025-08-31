"use client";

import React from 'react';
import styled from 'styled-components';
import { useSettings } from '../../context/SettingsContext';

const SyncStatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StatusDot = styled.div<{ $status: 'synced' | 'syncing' | 'error' | 'offline' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'synced':
        return '#22c55e';
      case 'syncing':
        return '#3b82f6';
      case 'error':
        return '#ef4444';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }};
  
  ${({ $status }) => $status === 'syncing' && `
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}
`;

const SyncButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent}20;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SettingsSyncStatus: React.FC = () => {
  const { isSyncing, lastSyncTime, syncError, syncToServer } = useSettings();

  const getStatus = () => {
    if (isSyncing) return 'syncing';
    if (syncError) return 'error';
    if (!lastSyncTime) return 'offline';
    return 'synced';
  };

  const getStatusText = () => {
    const status = getStatus();
    switch (status) {
      case 'syncing':
        return '同步中...';
      case 'synced':
        return `已同步 ${formatTime(lastSyncTime!)}`;
      case 'error':
        return '同步失败';
      case 'offline':
        return '仅本地存储';
      default:
        return '未知状态';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const handleSync = async () => {
    try {
      await syncToServer();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  return (
    <SyncStatusContainer>
      <StatusDot $status={getStatus()} />
      <span>{getStatusText()}</span>
      {!isSyncing && (
        <SyncButton onClick={handleSync} disabled={isSyncing}>
          {syncError ? '重试' : '同步'}
        </SyncButton>
      )}
    </SyncStatusContainer>
  );
};

export default SettingsSyncStatus;