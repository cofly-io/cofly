"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  GlassContainer,
  GlassMain,
  glassBase,
  enhancedGlassBase
} from '../../components/shared/ui-components';
import { SettingsSidebar } from './SettingsSidebar';
import { ThemeSettings } from './ThemeSettings';
import { ApiSettings } from './ApiSettings';
import { NotificationSettings } from './NotificationSettings';
import { DataManagementSettings } from './DataManagementSettings';
// import { McpSettings } from './McpSettings';
import { BuiltinModelSettings } from './BuiltinModelSettings';
// import SessionSettings from './SessionSettings';

const SettingsContainer = styled(GlassContainer)`
  min-height: 100vh;
`;

const SettingsContent = styled.div`
  display: flex;
  flex: 1;
  height: 100vh;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.1)'
    : 'rgba(248, 250, 252, 0.2)'
  };
`;



export type SettingsCategory =
  | 'theme'
  | 'api'
  // | 'mcp'
  | 'notifications'
  | 'data-management'
  | 'session'
  | 'builtin-model';

interface ModelOption {
  value: string;
  label: string;
}

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
}

interface SettingsPageProps {
  className?: string;
  onLoadModels?: (connectId: string) => Promise<ModelOption[]>;
  onLoadConnections?: () => Promise<ConnectConfig[]>;
  onSaveSettings?: (tabkey: string, tabDetails: string) => Promise<boolean>;
  onNavigateToConnections?: () => void;
  builtinModelSettings?: {
    connectid?: string;
    model?: string;
    isAppend?: boolean;
  } | null;
  onShowToast?: {
    showSuccess: (title: string, message: string) => void;
    showError: (title: string, message: string) => void;
    showWarning: (title: string, message: string) => void;
  };
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ className, onLoadModels, onLoadConnections, onSaveSettings, onNavigateToConnections, builtinModelSettings, onShowToast }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('theme');

  const renderContent = () => {
    switch (activeCategory) {
      case 'theme':
        return <ThemeSettings />;
      case 'api':
        return <ApiSettings />;
      // case 'mcp':
      //   return <McpSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'data-management':
        return <DataManagementSettings />;
      case 'session':
        return (
          <div style={{ padding: '24px' }}>
            <div style={{
              background: 'rgba(248, 250, 252, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔐 会话管理
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 20px 0',
                lineHeight: '1.5'
              }}>
                配置登录会话的过期时间和自动登出行为，保护您的账户安全。
              </p>
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                <div style={{ marginBottom: '20px' }}>
                  会话设置功能正在开发中，敬请期待...
                </div>
                <button
                  onClick={() => {
                    console.log('测试跳转到登录页面');
                    window.location.href = '/login';
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  测试跳转到登录页面
                </button>
              </div>
            </div>
          </div>
        );
      case 'builtin-model':
        return <BuiltinModelSettings
          onLoadModels={onLoadModels}
          onLoadConnections={onLoadConnections}
          onSaveSettings={onSaveSettings}
          onNavigateToConnections={onNavigateToConnections}
          builtinModelSettings={builtinModelSettings}
          onShowToast={onShowToast}
        />;
      default:
        return <ThemeSettings />;
    }
  };

  return (
    <SettingsContainer className={className}>
      <SettingsContent>
        <SettingsSidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </SettingsContent>
    </SettingsContainer>
  );
};

export default SettingsPage;