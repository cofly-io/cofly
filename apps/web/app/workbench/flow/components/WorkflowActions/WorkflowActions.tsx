/**
 * 工作流操作组件 - 应用层组件
 * 
 * 负责管理工作流的头部操作、标签页切换和测试按钮等功能
 * 集成了工作流操作和导出相关的hooks
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

// UI组件导入
import { WorkflowHeader } from '@repo/ui/main/flow';
import { TabsContainer, Tab, TestButtonContainer } from '@repo/ui';
import { CoButton } from '@repo/ui';
import { MdNotStarted } from "react-icons/md";

// 应用层hooks导入
import { useWorkflowOperations } from '../../hooks/useWorkflowOperations';
import { useWorkflowExport } from '../../hooks/useWorkflowExport';
import { useNodeTesting } from '../../hooks/useNodeTesting';

// 工具函数导入
import { logger } from '../../utils/errorHandling';

// 类型导入
import { NodeDetails } from '../../types/node';

const WorkflowActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

interface WorkflowActionsProps {
  workflowId: string;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  nodes: any[];
  edges: any[];
  nodesDetailsMap: Record<string, NodeDetails>;
  nodesTestResultsMap: Record<string, any>;
  currentCanvasNodes: any[];
  currentCanvasEdges: any[];
  updateNodeTestResult: (nodeId: string, result: any) => void;
  updateNodeDetails: (nodeId: string, details: Partial<NodeDetails>) => void;
  menuCollapsed: boolean;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  children?: React.ReactNode; // 用于渲染主要内容区域
}

/**
 * 工作流操作组件
 */
export const WorkflowActions: React.FC<WorkflowActionsProps> = ({
  workflowId,
  workflowName,
  onWorkflowNameChange,
  isActive,
  onActiveChange,
  nodes,
  edges,
  nodesDetailsMap,
  nodesTestResultsMap,
  currentCanvasNodes,
  currentCanvasEdges,
  updateNodeTestResult,
  updateNodeDetails,
  menuCollapsed,
  showError,
  showSuccess,
  showWarning,
  children
}) => {

  // 标签页状态
  const [activeTab, setActiveTab] = useState('editor');

  // 初始化工作流操作hook
  const workflowOperationsHook = useWorkflowOperations({
    workflowId,
    workflowName,
    nodes,
    edges,
    nodesDetailsMap,
    currentCanvasNodes,
    currentCanvasEdges,
    showError,
    showSuccess,
    showWarning
  });

  // 初始化工作流导出hook
  const workflowExportHook = useWorkflowExport({
    workflowId,
    workflowName,
    nodes,
    edges,
    nodesDetailsMap,
    currentCanvasNodes,
    currentCanvasEdges,
    showError,
    showSuccess,
    showWarning
  });

  // 初始化节点测试hook（用于工作流测试）
  const nodeTestingHook = useNodeTesting({
    workflowId,
    nodesDetailsMap,
    nodesTestResultsMap,
    edgesState: edges,
    updateNodeTestResult,
    updateNodeDetails,
    showError,
    showSuccess,
    showWarning
  });

  /**
   * 处理标签页切换
   */
  const handleTabClick = useCallback((tabName: string) => {
    setActiveTab(tabName);
    logger.debug('切换标签页', { from: activeTab, to: tabName });
  }, [activeTab]);

  /**
   * 处理编辑器标签点击
   */
  const handleEditorTabClick = useCallback(() => {
    handleTabClick('editor');
  }, [handleTabClick]);

  /**
   * 处理执行记录标签点击
   */
  const handleExecutionsTabClick = useCallback(() => {
    handleTabClick('executions');
  }, [handleTabClick]);

  /**
   * 处理工作流测试
   */
  const handleWorkflowTest = useCallback(async () => {
    if (!workflowId) {
      showError('出错:', '工作流ID不存在，无法测试');
      return;
    }

    logger.info('开始工作流测试', { workflowId });
    await nodeTestingHook.handleWorkflowTest();
  }, [workflowId, nodeTestingHook, showError]);

  /**
   * 处理更多选项
   */
  const handleMoreOptions = useCallback(() => {
    logger.info('打开更多选项', { workflowId });
    workflowOperationsHook.handleMoreOptions();
  }, [workflowId, workflowOperationsHook]);

  /**
   * 处理添加标签
   */
  const handleAddTag = useCallback(() => {
    logger.info('添加标签', { workflowId });
    workflowOperationsHook.handleAddTag();
  }, [workflowId, workflowOperationsHook]);

  return (
    <WorkflowActionsContainer>
      {/* 工作流头部 */}
      <WorkflowHeader
        workflowId={workflowId}
        workflowName={workflowName}
        onWorkflowNameChange={onWorkflowNameChange}
        isActive={isActive}
        onActiveChange={onActiveChange}
        onSave={workflowOperationsHook.handleSave}
        onShare={workflowOperationsHook.handleShare}
        onMoreOptions={handleMoreOptions}
        onAddTag={handleAddTag}
        onCopyToClipboard={workflowExportHook.handleCopyToClipboard}
        onExportJSON={workflowExportHook.handleExportJSON}
      />

      {/* 标签页 */}
      <TabsContainer>
        <Tab $active={activeTab === 'editor'} onClick={handleEditorTabClick}>
          业务设计
        </Tab>
        <Tab $active={activeTab === 'executions'} onClick={handleExecutionsTabClick}>
          执行记录
        </Tab>
      </TabsContainer>

      {/* 内容区域 */}
      <ContentArea>
        {activeTab === 'editor' ? (
          children
        ) : (
          <div style={{ padding: '20px' }}>
            <h2>执行记录</h2>
            <p>工作流执行历史记录将在这里显示。</p>
          </div>
        )}
      </ContentArea>

      {/* 测试按钮 */}
      <TestButtonContainer $menuCollapsed={menuCollapsed}>
        <CoButton
          onClick={handleWorkflowTest}
          disabled={nodeTestingHook.isTestingWorkflow || !workflowId}
        >
          <MdNotStarted size={16} />
          {nodeTestingHook.isTestingWorkflow ? '测试中...' : '业务流测试'}
        </CoButton>
      </TestButtonContainer>
    </WorkflowActionsContainer>
  );
};

export default WorkflowActions;