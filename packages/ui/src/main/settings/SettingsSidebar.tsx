"use client";

import React from 'react';
import styled from 'styled-components';
import { 
  glassBase,
  enhancedGlassBase 
} from '../../components/shared/ui-components';
import { SettingsCategory } from './SettingsPage';
import { SettingsSyncStatus } from './SettingsSyncStatus';
import { 
  MdPalette,
  MdSmartToy,
  MdApi,
  MdChat,
  MdBuild,
  MdNotifications,
  MdStorage
} from 'react-icons/md';

const SidebarContainer = styled.div`
  width: 280px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(22, 42, 90, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  ${glassBase}
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  padding: 30px 0;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.08)'
  };
  margin-bottom: 24px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
  }
`;

const CategoryList = styled.div`
  padding: 0 12px;
`;

const CategoryItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 130, 246, 0.15)')
    : 'transparent'
  };
  
  color: ${({ $active, theme }) => $active
    ? theme.colors.accent
    : theme.colors.textSecondary
  };
  
  &:hover {
    background: ${({ $active, theme }) => $active
      ? (theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.25)'
        : 'rgba(59, 130, 246, 0.15)')
      : (theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.1)'
        : 'rgba(59, 130, 246, 0.05)')
    };
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const CategoryIcon = styled.div`
  font-size: 18px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryText = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

interface SettingsSidebarProps {
  activeCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
}

const categories = [  
  {
    id: 'theme' as SettingsCategory,
    icon: <MdPalette />,
    label: '主题设置',
    description: '界面外观和主题'
  },
  {
    id: 'builtin-model' as SettingsCategory,
    icon: <MdSmartToy />,
    label: '内置模型',
    description: 'AI助手模型配置'
  },
  {
    id: 'api' as SettingsCategory,
    icon: <MdApi />,
    label: 'API配置',
    description: 'API密钥和连接设置'
  },  
  {
    id: 'session' as SettingsCategory,
    icon: <MdChat />,
    label: '会话设置',
    description: '登录过期和会话管理'
  },
  {
    id: 'mcp' as SettingsCategory,
    icon: <MdBuild />,
    label: 'MCP工具',
    description: 'MCP工具管理和配置'
  },
  {
    id: 'notifications' as SettingsCategory,
    icon: <MdNotifications />,
    label: '通知设置',
    description: '消息和提醒偏好'
  },
  {
    id: 'data-management' as SettingsCategory,
    icon: <MdStorage />,
    label: '数据管理',
    description: '导入导出和数据清理'
  },
];

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeCategory,
  onCategoryChange
}) => {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <h2>设置分类</h2>
      </SidebarHeader>
      
      <CategoryList>
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            $active={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          >
            <CategoryIcon>{category.icon}</CategoryIcon>
            <CategoryText>{category.label}</CategoryText>
          </CategoryItem>
        ))}
      </CategoryList>
      
      <div style={{ padding: '0 12px', marginTop: 'auto', paddingBottom: '20px' }}>
        <SettingsSyncStatus />
      </div>
    </SidebarContainer>
  );
};

export default SettingsSidebar;