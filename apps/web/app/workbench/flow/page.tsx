/**
 * 重构后的工作流页面 - 组件组装器
 * 
 * 这个文件将原来2000+行的单体文件重构为简洁的组件组装器
 * 主要职责：
 * 1. 组装各个功能组件
 * 2. 管理全局状态和数据流
 * 3. 提供错误边界和加载状态
 * 4. 协调组件间的通信
 */

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useRouter } from 'next/navigation';

// UI组件导入
import { ContentArea, TabsContainer, Tab, ToastManager, useToast } from '@repo/ui';
import { useGlobalConfirm } from '@repo/ui/components';

// 应用层组件导入
import { WorkflowHeader } from '@repo/ui/main/flow';

// 导入重构后的工作流编辑器组件
import { WorkflowEditor } from './components/WorkflowEditor/WorkflowEditor';

// Context导入
import { useWorkflow } from '@/contexts/WorkflowContext';

// Hooks导入
import { useWorkflowExport } from './hooks/useWorkflowExport';
import { useWorkflowOperations } from './hooks/useWorkflowOperations';
import { useNodeTesting } from './hooks/useNodeTesting';

// Utils导入
import { fetchConnectInstances, fetchConnectDetail } from './utils';

// Service导入
import { AgentService } from '@/services/agentService';

// 样式导入
import 'reactflow/dist/style.css';
import './nodeStyles.css';

/**
 * 工作流页面内容组件
 */
const WorkflowPageContent: React.FC = () => {
  // 页面状态
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  // 保存状态跟踪
  const [lastSavedState, setLastSavedState] = useState<{
    nodes: any[];
    edges: any[];
    timestamp: number;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 路由和确认对话框
  const router = useRouter();
  const { showConfirm } = useGlobalConfirm();

  // 工作流上下文
  const {
    nodes,
    workflowId,
    workflowName,
    setWorkflowName,
    nodesDetailsMap,
    nodesTestResultsMap,
    updateNodeTestResult,
    updateNodeDetails
  } = useWorkflow();

  // 保存当前画布的最新状态
  const [currentCanvasNodes, setCurrentCanvasNodes] = useState<any[]>([]);
  const [currentCanvasEdges, setCurrentCanvasEdges] = useState<any[]>([]);

  /**
   * 检查画布是否为空
   */
  const isCanvasEmpty = useCallback((nodes: any[], edges: any[]) => {
    return !nodes || nodes.length === 0;
  }, []);

  /**
   * 检查状态是否有变化
   */
  const hasStateChanged = useCallback((currentNodes: any[], currentEdges: any[]) => {
    if (!lastSavedState) {
      // 如果是初始加载，不算有变化
      if (isInitialLoad) {
        return false;
      }
      // 如果没有保存过的状态，只要画布不为空就算有变化
      return !isCanvasEmpty(currentNodes, currentEdges);
    }

    // 比较当前状态和最后保存的状态
    const nodesChanged = JSON.stringify(currentNodes) !== JSON.stringify(lastSavedState.nodes);
    const edgesChanged = JSON.stringify(currentEdges) !== JSON.stringify(lastSavedState.edges);

    return nodesChanged || edgesChanged;
  }, [lastSavedState, isCanvasEmpty, isInitialLoad]);

  /**
   * 处理画布状态变化
   */
  const handleCanvasStateChange = useCallback((updatedNodes: any[], updatedEdges: any[]) => {
    // 保存最新的画布状态
    setCurrentCanvasNodes(updatedNodes);
    setCurrentCanvasEdges(updatedEdges);

    // 如果是初始加载，设置初始保存状态
    if (isInitialLoad) {
      setLastSavedState({
        nodes: [...updatedNodes],
        edges: [...updatedEdges],
        timestamp: Date.now()
      });
      setIsInitialLoad(false);
      setHasUnsavedChanges(false);
      return;
    }

    // 检查是否有未保存的更改
    const isEmpty = isCanvasEmpty(updatedNodes, updatedEdges);
    const changed = hasStateChanged(updatedNodes, updatedEdges);

    // 只有在画布不为空且有变化时才标记为未保存
    setHasUnsavedChanges(!isEmpty && changed);
  }, [isCanvasEmpty, hasStateChanged, isInitialLoad]);

  // Toast管理
  const {
    toasts,
    removeToast,
    showError,
    showSuccess,
    showWarning
  } = useToast();

  // 工作流导出功能
  const {
    handleCopyToClipboard,
    handleExportJSON
  } = useWorkflowExport({
    workflowId: workflowId || '',
    workflowName: workflowName || '',
    nodes,
    edges: [],
    nodesDetailsMap,
    currentCanvasNodes,
    currentCanvasEdges,
    showError,
    showSuccess,
    showWarning
  });

  /**
   * 处理保存成功后更新保存状态
   */
  const handleSaveSuccess = useCallback(() => {
    // 更新最后保存的状态
    setLastSavedState({
      nodes: [...currentCanvasNodes],
      edges: [...currentCanvasEdges],
      timestamp: Date.now()
    });
    // 清除未保存标记
    setHasUnsavedChanges(false);
  }, [currentCanvasNodes, currentCanvasEdges]);

  // 工作流操作功能
  const {
    handleSave: originalHandleSave,
    handleShare,
    handleMoreOptions,
    handleAddTag,
    handleAIhelpClick
  } = useWorkflowOperations({
    workflowId: workflowId || '',
    workflowName: workflowName || '',
    nodes,
    edges: [],
    nodesDetailsMap,
    currentCanvasNodes,
    currentCanvasEdges,
    showError,
    showSuccess,
    showWarning
  });

  // 包装保存函数以处理保存成功回调
  const handleSave = useCallback(async () => {
    try {
      await originalHandleSave();
      // 保存成功后更新状态
      handleSaveSuccess();
    } catch (error) {
      // 保存失败，不更新状态
      console.error('保存失败:', error);
    }
  }, [originalHandleSave, handleSaveSuccess]);

  // 节点测试功能
  const {
    handleWorkflowTest,
    handleStopWorkflowTest,
    handleStopNodeTest,
    isTestingWorkflow,
    testingNodes,
    nodeTestEventIds,
    workflowLogData
  } = useNodeTesting({
    workflowId: workflowId || '',
    nodesDetailsMap,
    nodesTestResultsMap,
    edgesState: [],
    updateNodeTestResult,
    updateNodeDetails,
    showError,
    showSuccess,
    showWarning
  });

  /**
   * 处理菜单折叠状态变化
   */
  const handleMenuCollapseChange = useCallback((collapsed: boolean) => {
    // 菜单折叠状态处理逻辑
    console.log('菜单折叠状态:', collapsed);
  }, []);

  /**
   * 获取智能体列表
   */
  const handleFetchAgents = useCallback(async () => {
    try {
      const response = await AgentService.getAgents();
      if (response.success) {
        return response.data;
      } else {
        showError('获取智能体失败', response.error || '未知错误');
        return [];
      }
    } catch (error) {
      showError('获取智能体失败', error instanceof Error ? error.message : '网络错误');
      return [];
    }
  }, [showError]);

  /**
   * 处理页面离开确认
   */
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      // 使用现代浏览器推荐的方式
      const message = '您有未保存的更改，确定要离开吗？';
      e.returnValue = message;
      return message;
    }
  }, [hasUnsavedChanges]);



  /**
   * 初始化保存状态（当工作流加载时）
   */
  useEffect(() => {
    if (nodes && workflowId) {
      // 工作流已加载，设置为已保存状态
      setLastSavedState({
        nodes: [...nodes],
        edges: [],
        timestamp: Date.now()
      });
      setHasUnsavedChanges(false);
    }
  }, [workflowId]); // 只在workflowId变化时执行



  /**
   * 处理导航点击事件
   */
  const handleNavigationClick = useCallback(async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const navElement = target.closest('a[href], [data-nav="true"]');

    if (navElement) {
      const href = navElement.getAttribute('href');

      // 检查是否是页面导航
      const isPageNavigation = href &&
        href.startsWith('/') &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        href !== window.location.pathname;

      if (isPageNavigation && hasUnsavedChanges) {
        // 立即阻止所有默认行为
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        try {
          const confirmed = await showConfirm({
            title: '离开页面',
            message: '您有未保存的更改，确定要离开此页面吗？离开后更改将丢失。',
            confirmText: '离开',
            cancelText: '取消'
          });

          if (confirmed) {
            // 用户确认后，执行导航
            router.push(href);
          }
        } catch (error) {
          console.error('页面离开确认对话框出错:', error);
          // 如果确认对话框出错，为了安全起见，不执行导航
          showError('系统错误', '无法显示确认对话框，请稍后重试');
        }
      }
    }
  }, [hasUnsavedChanges, router, showConfirm]);

  /**
   * 处理键盘导航事件
   */
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    // 处理 Enter 键或空格键触发的导航
    if ((e.key === 'Enter' || e.key === ' ') && hasUnsavedChanges) {
      const target = e.target as HTMLElement;
      const navElement = target.closest('a[href], [data-nav="true"]');
      
      if (navElement) {
        const href = navElement.getAttribute('href');
        const isPageNavigation = href &&
          href.startsWith('/') &&
          !href.startsWith('#') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          href !== window.location.pathname;

        if (isPageNavigation) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          try {
            const confirmed = await showConfirm({
              title: '离开页面',
              message: '您有未保存的更改，确定要离开此页面吗？离开后更改将丢失。',
              confirmText: '离开',
              cancelText: '取消'
            });

            if (confirmed) {
              router.push(href);
            }
          } catch (error) {
            console.error('页面离开确认对话框出错:', error);
            showError('系统错误', '无法显示确认对话框，请稍后重试');
          }
        }
      }
    }
  }, [hasUnsavedChanges, router, showConfirm, showError]);

  /**
   * 监听页面离开事件
   */
  useEffect(() => {
    // 监听浏览器刷新/关闭
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 监听导航点击事件
    document.addEventListener('click', handleNavigationClick, true);
    
    // 监听键盘导航事件
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleNavigationClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleBeforeUnload, handleNavigationClick, handleKeyDown]);

  /**
   * 处理标签页切换
   */
  const handleEditorTabClick = () => {
    setActiveTab('editor');
  };

  const handleExecutionsTabClick = () => {
    setActiveTab('executions');
  };

  return (
    <>
      {/* 工作流头部 */}
      <WorkflowHeader
        workflowId={workflowId || 'errorWorkflowId'}
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        isActive={isActive}
        onActiveChange={setIsActive}
        onSave={handleSave}
        onShare={handleShare}
        onMoreOptions={handleMoreOptions}
        onAddTag={handleAddTag}
        onCopyToClipboard={handleCopyToClipboard}
        onExportJSON={handleExportJSON}
      />

      {/* 标签页导航 */}
      <TabsContainer>
        <Tab $active={activeTab === 'editor'} onClick={handleEditorTabClick}>
          业务设计
        </Tab>
        <Tab $active={activeTab === 'executions'} onClick={handleExecutionsTabClick}>
          执行记录
        </Tab>
      </TabsContainer>

      {/* 主要内容区域 */}
      <ContentArea style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 150px)'
      }}>
        {activeTab === 'editor' ? (
          <ReactFlowProvider>
            <WorkflowEditor
              onMenuCollapseChange={handleMenuCollapseChange}
              showError={showError}
              showWarning={showWarning}
              onCanvasStateChange={handleCanvasStateChange}
              onFetchConnectInstances={fetchConnectInstances}
              onFetchConnectDetail={fetchConnectDetail}
              onFetchAgents={handleFetchAgents}
              onWorkflowTest={handleWorkflowTest}
              onStopWorkflowTest={handleStopWorkflowTest}
              isTestingWorkflow={isTestingWorkflow}
              workflowId={workflowId || undefined}
              onStopNodeTest={handleStopNodeTest}
              testingNodes={testingNodes}
              nodeTestEventIds={nodeTestEventIds}
              workflowLogData={workflowLogData}
              onAIhelpClick={handleAIhelpClick}
            />
          </ReactFlowProvider>
        ) : (
          <div style={{ padding: '20px', width: '100%' }}>
            <h2>执行记录</h2>
            <p>工作流执行历史记录将在这里显示。</p>
          </div>
        )}
      </ContentArea>

      {/* Toast管理器 */}
      <ToastManager toasts={toasts} onRemove={removeToast} />
    </>
  );
};

/**
 * 主工作流页面组件
 */
const WorkflowPage: React.FC = () => {
  return <WorkflowPageContent />;
};

export default WorkflowPage;