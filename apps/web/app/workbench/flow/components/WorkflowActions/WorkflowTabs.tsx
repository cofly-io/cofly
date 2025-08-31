/**
 * 工作流标签页组件
 * 
 * 负责管理工作流页面的标签页切换功能
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

// UI组件导入
import { TabsContainer, Tab } from '@repo/ui';

// 工具函数导入
import { logger } from '../../utils/errorHandling';

const WorkflowTabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface WorkflowTabsProps {
  activeTab?: string;
  onTabChange?: (tabName: string) => void;
  tabs?: Array<{
    key: string;
    label: string;
    disabled?: boolean;
    badge?: string | number;
  }>;
  children?: React.ReactNode;
}

/**
 * 默认标签页配置
 */
const DEFAULT_TABS = [
  {
    key: 'editor',
    label: '业务设计',
    disabled: false
  },
  {
    key: 'executions',
    label: '执行记录',
    disabled: false
  }
];

/**
 * 工作流标签页组件
 */
export const WorkflowTabs: React.FC<WorkflowTabsProps> = ({
  activeTab = 'editor',
  onTabChange,
  tabs = DEFAULT_TABS,
  children
}) => {

  // 内部状态管理
  const [currentTab, setCurrentTab] = useState(activeTab);

  /**
   * 处理标签页切换
   */
  const handleTabClick = useCallback((tabKey: string) => {
    const tab = tabs.find(t => t.key === tabKey);
    
    if (!tab) {
      logger.warn('尝试切换到不存在的标签页', { tabKey, availableTabs: tabs.map(t => t.key) });
      return;
    }

    if (tab.disabled) {
      logger.warn('尝试切换到已禁用的标签页', { tabKey });
      return;
    }

    logger.debug('切换标签页', { from: currentTab, to: tabKey });
    
    setCurrentTab(tabKey);
    
    if (onTabChange) {
      onTabChange(tabKey);
    }
  }, [currentTab, tabs, onTabChange]);

  /**
   * 获取标签页内容
   */
  const getTabContent = useCallback(() => {
    if (children) {
      return children;
    }

    // 默认内容
    switch (currentTab) {
      case 'editor':
        return (
          <div style={{ padding: '20px' }}>
            <h2>业务设计</h2>
            <p>工作流设计器将在这里显示。</p>
          </div>
        );
      case 'executions':
        return (
          <div style={{ padding: '20px' }}>
            <h2>执行记录</h2>
            <p>工作流执行历史记录将在这里显示。</p>
          </div>
        );
      default:
        return (
          <div style={{ padding: '20px' }}>
            <h2>未知标签页</h2>
            <p>标签页内容未定义。</p>
          </div>
        );
    }
  }, [currentTab, children]);

  /**
   * 渲染标签页标题
   */
  const renderTabTitle = useCallback((tab: typeof tabs[0]) => {
    return (
      <span>
        {tab.label}
        {tab.badge && (
          <span style={{ 
            marginLeft: '8px', 
            padding: '2px 6px', 
            backgroundColor: '#ff4d4f', 
            color: 'white', 
            borderRadius: '10px', 
            fontSize: '12px' 
          }}>
            {tab.badge}
          </span>
        )}
      </span>
    );
  }, []);

  return (
    <WorkflowTabsContainer>
      {/* 标签页头部 */}
      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            $active={currentTab === tab.key}
            onClick={() => handleTabClick(tab.key)}
            disabled={tab.disabled}
            style={{
              opacity: tab.disabled ? 0.5 : 1,
              cursor: tab.disabled ? 'not-allowed' : 'pointer'
            }}
          >
            {renderTabTitle(tab)}
          </Tab>
        ))}
      </TabsContainer>

      {/* 标签页内容 */}
      <div style={{ flex: 1 }}>
        {getTabContent()}
      </div>
    </WorkflowTabsContainer>
  );
};

export default WorkflowTabs;