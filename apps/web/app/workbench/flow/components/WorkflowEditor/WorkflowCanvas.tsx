/**
 * 工作流画布组件 - 应用层包装组件
 * 
 * 这个组件是对packages/ui/src/main/flow/canvas.tsx的应用层包装
 * 主要负责：
 * 1. 集成应用层的业务逻辑
 * 2. 处理应用特定的事件和状态
 * 3. 提供应用层的数据转换和适配
 */

import React, { useCallback, useMemo, useEffect } from 'react';
import { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';

// 导入UI层的WorkflowCanvas组件
import { WorkflowCanvas as UIWorkflowCanvas } from '@repo/ui/main/flow';
// 导入UI层的节点组件
import { StickyNoteComponent } from '@repo/ui/';

// 导入业务层的节点组件
import { AgentNodeWrapper, McpLabelProvider } from '../AgentNodeWrapper';
import { ActionNodeWrapper, ActionProvider } from '../ActionNodeWrapper';
import { TriggerNodeWrapper, TriggerProvider } from '../TriggerNodeWrapper';
import { IConnectConfig } from '@repo/common';
// 导入应用层类型
import { FetchTablesResponse } from '@/services/databaseService';

// 导入工具函数
import { logger } from '@/workbench/flow';

// 定义静态的节点类型映射（在组件外部）
const nodeTypes = {
  triggerNode: TriggerNodeWrapper,
  actionNode: ActionNodeWrapper,
  agentNode: AgentNodeWrapper,
  stickyNote: StickyNoteComponent
};


interface AppWorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onSelectionChange?: (elements: { nodes: Node[], edges: Edge[] }) => void;
  onNodeUpdate?: (nodeData: any) => void;
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  selectedNodeDetails?: any;
  onNodeIdChange?: (oldId: string, newId: string) => void;
  nodeWidth?: number;
  onAutoLayout?: (layoutedNodes: Node[]) => void;
  onCopyNodes?: (nodes: Node[]) => void;
  onPasteNodes?: () => void;
  nodesTestResultsMap?: Record<string, any>;
  getLatestNodesTestResultsMap?: () => Record<string, any>;
  connectConfigs?: IConnectConfig[];
  onFetchConnectInstances?: (connectType?: string) => Promise<IConnectConfig[]>;
  onFetchConnectDetail?: (datasourceId: string, search?: string) => Promise<FetchTablesResponse>;
  onMcpLabelClick?: (nodeId: string) => void;
  onResourceDelete?: (nodeId: string, resourceType: string, resourceId: string) => void;
  // 测试按钮相关props
  onWorkflowTest?: () => void;
  onStopWorkflowTest?: () => void;
  isTestingWorkflow?: boolean;
  workflowId?: string;
  menuCollapsed?: boolean;
  // 节点测试相关props
  onStopNodeTest?: (nodeInstanceId: string) => Promise<any>;
  testingNodes?: Set<string>;
  nodeTestEventIds?: Record<string, string>;
  // 工作流日志数据
  workflowLogData?: any;
  // 节点详情映射
  nodesDetailsMap?: Record<string, any>;
  // 节点执行状态获取函数
  getNodeExecutionStatus?: (nodeId: string) => any;
  // Sticky note相关回调
  onAddStickyNote?: (position: { x: number; y: number }) => void;
  onUpdateStickyNote?: (id: string, data: any) => void;
  onDeleteStickyNote?: (id: string) => void;
}

/**
 * 应用层工作流画布组件
 */
export const WorkflowCanvas: React.FC<AppWorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onSelectionChange,
  onNodeUpdate,
  onNodeDoubleClick,
  selectedNodeDetails,
  onNodeIdChange,
  nodeWidth,
  onAutoLayout,
  onCopyNodes,
  onPasteNodes,
  nodesTestResultsMap,
  getLatestNodesTestResultsMap,
  connectConfigs = [],
  onFetchConnectInstances,
  onFetchConnectDetail,
  onMcpLabelClick,
  onResourceDelete,
  // 测试按钮相关props
  onWorkflowTest,
  onStopWorkflowTest,
  isTestingWorkflow,
  workflowId,
  menuCollapsed,
  // 节点测试相关props
  onStopNodeTest,
  testingNodes,
  nodeTestEventIds,
  // 工作流日志数据
  workflowLogData,
  // 节点详情映射
  nodesDetailsMap,
  // 节点执行状态获取函数
  getNodeExecutionStatus,
  // Sticky note相关回调
  onAddStickyNote,
  onUpdateStickyNote,
  onDeleteStickyNote
}) => {

  /**
   * 处理连接事件 - 添加应用层逻辑
   */
  const handleConnect = useCallback((connection: Connection) => {
    logger.debug('应用层处理连接', { connection });

    // 这里可以添加应用层特定的连接验证逻辑
    // 例如：业务规则验证、权限检查等

    if (onConnect) {
      onConnect(connection);
    }
  }, [onConnect]);

  /**
   * 处理拖拽放置 - 添加应用层逻辑
   */
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    logger.debug('应用层处理拖拽放置');

    // 这里可以添加应用层特定的拖拽逻辑
    // 例如：节点创建规则、位置计算等

    if (onDrop) {
      onDrop(event);
    }
  }, [onDrop]);

  /**
   * 处理节点双击 - 添加应用层逻辑
   */
  const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    logger.debug('应用层处理节点双击', { nodeId: node.id });

    // 这里可以添加应用层特定的双击逻辑
    // 例如：权限检查、节点状态验证等

    if (onNodeDoubleClick) {
      onNodeDoubleClick(event, node);
    }
  }, [onNodeDoubleClick]);

  /**
   * 处理选择变化 - 添加应用层逻辑
   */
  const handleSelectionChange = useCallback((elements: { nodes: Node[], edges: Edge[] }) => {
    logger.debug('应用层处理选择变化', {
      nodeCount: elements.nodes.length,
      edgeCount: elements.edges.length
    });

    // 这里可以添加应用层特定的选择逻辑
    // 例如：选择状态同步、工具栏更新等

    if (onSelectionChange) {
      onSelectionChange(elements);
    }
  }, [onSelectionChange]);

  /**
   * 转换连接配置格式以适配UI层
   */
  const uiConnectConfigs = useMemo(() => {
    return connectConfigs.map(config => ({
      id: config.id,
      name: config.name,
      // ctype: config.ctype,
      // mtype: config.mtype,
      // nodeinfo: config.nodeinfo,
      description: config.description
    }));
  }, [connectConfigs]);

  /**
   * 包装获取连接配置函数以适配UI层
   */
  const handleFetchConnectConfigs = useCallback(async (connectType?: string) => {
    if (!onFetchConnectInstances) return [];

    try {
      const configs = await onFetchConnectInstances(connectType);
      //logger.debug('应用层获取连接配置成功', { connectType, count: configs.length });

      // 转换格式以适配UI层
      return configs.map(config => ({
        id: config.id,
        name: config.name,
        description: config.description
      }));
    } catch (error) {
      logger.error('应用层获取连接配置失败', error);
      return [];
    }
  }, [onFetchConnectInstances]);

  /**
   * 包装获取表名函数以适配UI层
   */
  const handleFetchConnectDetail = useCallback(async (datasourceId: string, search?: string) => {
    if (!onFetchConnectDetail) {
      return {
        loading: false,
        error: '获取表名功能未实现',
        options: []
      };
    }

    try {
      const result = await onFetchConnectDetail(datasourceId, search);
      
      // 确保数据结构正确
      if (!result) {
        throw new Error('未返回数据');
      }
      
      // 验证数据格式
      const options = result.options || [];

      return {
        loading: false,
        error: null,
        options
      };
    } catch (error) {
      return {
        loading: false,
        error: error instanceof Error ? error.message : '获取数据失败',
        options: []
      };
    }
  }, [onFetchConnectDetail]);

  // 移除不必要的边状态监听日志

  // 配置联动回调函数
  const linkageCallbacks = useMemo(() => ({
    fetchConnectDetail: async (datasourceId: string) => {
      const result = await handleFetchConnectDetail(datasourceId);
      // 转换为联动回调期望的格式
      return result.options?.map(option => ({
        label: option.label,
        value: option.value
      })) || [];
    }
  }), [handleFetchConnectDetail]);

  return (
    <McpLabelProvider
      onMcpLabelClick={onMcpLabelClick}
      onResourceDelete={onResourceDelete}
      getNodeExecutionStatus={getNodeExecutionStatus}
    >
      <ActionProvider getNodeExecutionStatus={getNodeExecutionStatus}>
        <TriggerProvider getNodeExecutionStatus={getNodeExecutionStatus}>
          <UIWorkflowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onSelectionChange={handleSelectionChange}
        onNodeUpdate={onNodeUpdate}
        onNodeDoubleClick={handleNodeDoubleClick}
        selectedNodeDetails={selectedNodeDetails}
        onNodeIdChange={onNodeIdChange}
        nodeWidth={nodeWidth}
        onAutoLayout={onAutoLayout}
        onCopyNodes={onCopyNodes}
        onPasteNodes={onPasteNodes}
        nodesTestResultsMap={nodesTestResultsMap}
        getLatestNodesTestResultsMap={getLatestNodesTestResultsMap}
        //connectConfigs={uiConnectConfigs}
        onFetchConnectInstances={handleFetchConnectConfigs}
        onFetchConnectDetail={handleFetchConnectDetail}
        linkageCallbacks={linkageCallbacks}
        nodeTypes={nodeTypes}  // 传递静态的节点类型
        // 测试按钮相关props
        onWorkflowTest={onWorkflowTest}
        onStopWorkflowTest={onStopWorkflowTest}
        isTestingWorkflow={isTestingWorkflow}
        workflowId={workflowId}
        menuCollapsed={menuCollapsed}
        // 工作流日志数据
        workflowLogData={workflowLogData}
        // 节点详情映射
        nodesDetailsMap={nodesDetailsMap}
        // 节点执行状态获取函数
        getNodeExecutionStatus={getNodeExecutionStatus}
        // Sticky note相关回调
        onAddStickyNote={onAddStickyNote}
        onUpdateStickyNote={onUpdateStickyNote}
        onDeleteStickyNote={onDeleteStickyNote}
          />
        </TriggerProvider>
      </ActionProvider>
    </McpLabelProvider>
  );
};

export default WorkflowCanvas;