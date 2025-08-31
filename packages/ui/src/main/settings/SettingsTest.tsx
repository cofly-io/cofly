"use client";

import React from 'react';
import styled from 'styled-components';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeProvider';

const TestContainer = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: 8px;
  margin: 20px;
`;

const TestButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const StatusDisplay = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)'};
  padding: 16px;
  border-radius: 4px;
  margin: 16px 0;
  font-size: 12px;
  white-space: pre-wrap;
`;

export const SettingsTest: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    syncToServer,
    testApiConnection,
    exportData,
    importData,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncError
  } = useSettings();

  const { themeMode, toggleTheme } = useTheme();

  const handleTestNotification = async () => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        systemUpdates: !settings.notifications.systemUpdates
      }
    });
  };

  const handleTestApiConnection = async () => {
    try {
      const result = await testApiConnection('cofly', {
        apiKey: 'test-key',
        baseUrl: 'https://api.cofly.com'
      });
      console.log('API Test Result:', result);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error('Export Error:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
    } catch (error) {
      console.error('Reset Error:', error);
    }
  };

  return (
    <TestContainer>
      <h3>设置系统测试</h3>
      
      <div>
        <TestButton onClick={toggleTheme}>
          切换主题 (当前: {themeMode})
        </TestButton>
        
        <TestButton onClick={handleTestNotification}>
          切换系统通知 (当前: {settings.notifications.systemUpdates ? '开' : '关'})
        </TestButton>
        
        <TestButton onClick={handleTestApiConnection}>
          测试API连接
        </TestButton>
        
        <TestButton onClick={handleExport}>
          导出数据
        </TestButton>
        
        <TestButton onClick={handleReset} disabled={isLoading}>
          重置设置
        </TestButton>
        
        <TestButton onClick={syncToServer} disabled={isSyncing}>
          手动同步
        </TestButton>
      </div>

      <StatusDisplay>
        {`状态信息:
加载中: ${isLoading}
同步中: ${isSyncing}
最后同步: ${lastSyncTime ? lastSyncTime.toLocaleString() : '未同步'}
同步错误: ${syncError || '无'}
当前主题: ${themeMode}
系统通知: ${settings.notifications.systemUpdates}
邮件通知: ${settings.notifications.emailNotifications}
语言设置: ${settings.preferences.language}`}
      </StatusDisplay>
    </TestContainer>
  );
};

export default SettingsTest;