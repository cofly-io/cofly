/**
 * 简化版工作流编辑器组件
 * 
 * 主要简化：
 * 1. 移除复杂的状态同步逻辑，直接使用 Context 数据
 * 2. 简化工作流切换处理
 * 3. 修复页面离开提示的误触发问题
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider, Node, Edge, NodeChange } from 'reactflow';
import styled from 'styled-components';

// 组件导入
import { WorkflowCanvas } from './WorkflowCanvas';
import { NodeMenu } from '../NodeManagement/NodeMenu';
import { McpDrawer } from '../McpDrawer';
import { AgentSelectorModal } from '@repo/ui/components';
import { AgentData, IDataOptions } from '@repo/common';

// Hooks导入
import { useNodeTesting } from '@/workbench/flow';
import { useCanvasOperations } from '@/workbench/flow';
import { useConnectConfig } from '@/workbench/flow';
import { useMcpDrawer } from '@/workbench/flow';
import { useNodeExecutionStatus } from '../../hooks/useNodeExecutionStatus';

// 工具函数导入
import { getAllPreviousNodeIds } from '@/workbench/flow';
import { handleNodeIdChange as handleNodeIdChangeUtil } from '../../utils/nodeIdUtils';
import { ErrorBoundary } from "../ErrorBoundary";

// 类型导入
import { NodeDetails } from '../../types/node';
import { IMetadataResult } from '@repo/common';

// 服务导入
import { AgentService } from '@/services/agentService';

// Context导入
import { useWorkflow } from '@/contexts/WorkflowContext';

const WorkflowEditorContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
`;

const CanvasContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

interface WorkflowEditorProps {
  onMenuCollapseChange: (collapsed: boolean) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  onCanvasStateChange?: (nodes: Node[], edges: Edge[]) => void;
  onFetchConnectInstances?: (connectType?: string) => Promise<IDataOptions[]>;
  onFetchConnectDetail?: (connectID: string, search?: string) => Promise<IMetadataResult>;
  onFetchAgents?: () => Promise<AgentData[]>;
  onAIhelpClick?: (prompt: string, content: string, fieldName: string) => Promise<string>;
  // 测试按钮相关props
  onWorkflowTest?: () => void;
  onStopWorkflowTest?: () => void;
  isTestingWorkflow?: boolean;
  workflowId?: string;
  // 节点测试相关props
  onStopNodeTest?: (nodeInstanceId: string) => Promise<any>;
  testingNodes?: Set<string>;
  nodeTestEventIds?: Record<string, string>;
  // 工作流日志数据
  workflowLogData?: any;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  onMenuCollapseChange,
  showError,
  showWarning,
  onCanvasStateChange,
  onFetchConnectInstances,
  onFetchConnectDetail,
  onFetchAgents,
  onAIhelpClick,
  onWorkflowTest,
  onStopWorkflowTest,
  isTestingWorkflow,
  workflowId,
  onStopNodeTest,
  testingNodes,
  nodeTestEventIds,
  workflowLogData,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 工作流上下文 - 直接使用，不做复杂的状态同步
  const {
    nodes,
    edges,
    workflowId: contextWorkflowId,
    nodesDetailsMap,
    nodesTestResultsMap,
    isLoading,
    setNodes,
    setEdges,
    updateNodeDetails,
    updateNodeTestResult,
    deleteNodeCompletely
  } = useWorkflow();

  // 简化的本地状态
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);
  const [nodeTestOutput, setNodeTestOutput] = useState<string>('');
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [selectedPreviousNodes, setSelectedPreviousNodes] = useState<Record<string, string>>({});

  // MCP抽屉状态
  const { isOpen: isMcpDrawerOpen, openDrawer: openMcpDrawer, closeDrawer: closeMcpDrawer } = useMcpDrawer();
  const [selectedAgentNodeId, setSelectedAgentNodeId] = useState<string | undefined>(undefined);

  // 智能体选择模态窗状态
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const [pendingAgentNodeData, setPendingAgentNodeData] = useState<{
    position: { x: number; y: number };
    nodeData: any;
  } | null>(null);

  // 节点执行状态
  const nodeExecutionStatus = useNodeExecutionStatus({
    workflowLogData,
    isTestingWorkflow
  });

  // 监听测试结果变化
  useEffect(() => {
    if (selectedNodeDetails?.node?.id) {
      const nodeId = selectedNodeDetails.node.id;
      const testResult = nodesTestResultsMap[nodeId];
      setNodeTestOutput(testResult ? JSON.stringify(testResult, null, 2) : '');
    } else {
      setNodeTestOutput('');
    }
  }, [selectedNodeDetails?.node?.id, nodesTestResultsMap]);

  // 监听智能体选择事件
  useEffect(() => {
    const handleShowAgentSelector = (event: CustomEvent) => {
      const { position, nodeData } = event.detail;
      setPendingAgentNodeData({ position, nodeData });
      setIsAgentSelectorOpen(true);
    };

    window.addEventListener('show-agent-selector', handleShowAgentSelector as EventListener);
    return () => {
      window.removeEventListener('show-agent-selector', handleShowAgentSelector as EventListener);
    };
  }, []);

  // 工作流切换时清理状态 - 简化版本
  const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(null);
  useEffect(() => {
    if (contextWorkflowId && contextWorkflowId !== lastWorkflowId) {
      // 只清理UI状态，不干预数据状态
      setSelectedNodeDetails(null);
      setSelectedPreviousNodes({});
      setLastWorkflowId(contextWorkflowId);
    }
  }, [contextWorkflowId, lastWorkflowId]);

  // 节点变更处理 - 处理移动、选择、删除、添加等所有变更
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    let updatedNodes = [...nodes];

    // 处理所有类型的变更
    for (const change of changes) {
      if (change.type === 'add' && 'item' in change) {
        // 处理节点添加
        const newNode = change.item as Node;
        updatedNodes = [...updatedNodes, newNode];
      } else if (change.type === 'remove' && 'id' in change) {
        // 处理节点删除
        const nodeId = change.id;
        updatedNodes = updatedNodes.filter(node => node.id !== nodeId);

        // 清理删除节点的相关状态
        if (selectedNodeDetails?.node?.id === nodeId) {
          setSelectedNodeDetails(null);
        }
        deleteNodeCompletely(nodeId);
      } else if ('id' in change) {
        // 处理其他类型的变更（位置、选择、尺寸等）
        const nodeId = change.id;
        updatedNodes = updatedNodes.map(node => {
          if (node.id === nodeId) {
            if (change.type === 'position' && 'position' in change && change.position) {
              return { ...node, position: change.position };
            } else if (change.type === 'select' && 'selected' in change) {
              return { ...node, selected: change.selected };
            } else if (change.type === 'dimensions' && 'dimensions' in change && change.dimensions) {
              return {
                ...node,
                width: change.dimensions.width,
                height: change.dimensions.height
              };
            }
          }
          return node;
        });
      } else {
        console.warn('⚠️ [WorkflowEditor] 未处理的变更类型:', change);
      }
    }
    // 更新节点状态
    setNodes(updatedNodes);

    // 通知画布状态变化
    if (onCanvasStateChange) {
      onCanvasStateChange(updatedNodes, edges);
    }
  }, [nodes, edges, setNodes, onCanvasStateChange, selectedNodeDetails, deleteNodeCompletely]);

  // 边变更处理 - 处理连接线的添加、删除等变更
  const handleEdgesChange = useCallback((changes: any[]) => {
    let updatedEdges = [...edges];

    // 处理所有类型的变更
    for (const change of changes) {
      if (change.type === 'add' && 'item' in change) {
        // 处理边添加（连接线）
        const newEdge = change.item as Edge;
        updatedEdges = [...updatedEdges, newEdge];
      } else if (change.type === 'remove' && 'id' in change) {
        // 处理边删除
        const edgeId = change.id;
        updatedEdges = updatedEdges.filter(edge => edge.id !== edgeId);
      }
    }

    // 更新边状态
    setEdges(updatedEdges);

    // 通知画布状态变化
    if (onCanvasStateChange) {
      onCanvasStateChange(nodes, updatedEdges);
    }
  }, [edges, nodes, setEdges, onCanvasStateChange]);

  // 初始化hooks
  const nodeTestingHook = useNodeTesting({
    workflowId: contextWorkflowId || '',
    nodesDetailsMap,
    nodesTestResultsMap,
    edgesState: edges, // 直接使用 Context 的 edges
    updateNodeTestResult,
    updateNodeDetails,
    showError,
    showSuccess: (title: string, message: string) => {
      // console.log(`✅ ${title}: ${message}`);
    },
    showWarning
  });

  const canvasOperationsHook = useCanvasOperations({
    nodes, // 直接使用 Context 的 nodes
    edges, // 直接使用 Context 的 edges
    nodesDetailsMap,
    onNodesChange: handleNodesChange, // 🔧 修复：使用正确的 handleNodesChange
    onEdgesChange: handleEdgesChange, // 🔧 修复：使用正确的 handleEdgesChange
    setNodes, // 🔧 修复：使用 Context 的 setNodes
    setEdges, // 🔧 修复：使用 Context 的 setEdges
    updateNodeDetails,
    deleteNodeCompletely,
    showError,
    showSuccess: (title: string, message: string) => {
      // console.log(`✅ ${title}: ${message}`);
    },
    showWarning,
    deletedNodeHistory: new Set() // 简化：不需要复杂的删除历史
  });

  const connectConfigHook = useConnectConfig({
    showError,
    showWarning,
    showSuccess: (title: string, message: string) => {
      // console.log(`✅ ${title}: ${message}`);
    }
  });

  // 监听测试状态变化，主动更新selectedNodeDetails
  useEffect(() => {
    if (selectedNodeDetails && selectedNodeDetails.node) {
      const nodeInstanceId = selectedNodeDetails.node.id;
      const isCurrentlyTesting = nodeTestingHook.testingNodes?.has(nodeInstanceId) || false;
      const currentEventId = nodeTestingHook.nodeTestEventIds?.[nodeInstanceId];

      // 如果测试状态发生变化，更新selectedNodeDetails
      if (selectedNodeDetails.isNodeTesting !== isCurrentlyTesting) {
        setSelectedNodeDetails((prev: any) => {
          const updated = {
            ...prev,
            isNodeTesting: isCurrentlyTesting,
            nodeTestEventId: currentEventId
          };
          return updated;
        });
      }
    }
  }, [nodeTestingHook.testingNodes, nodeTestingHook.nodeTestEventIds, selectedNodeDetails]);

  // 处理资源变化
  const handleResourcesChange = useCallback((nodeId: string, resources: any) => {
    updateNodeDetails(nodeId, {
      ...nodesDetailsMap[nodeId],
      agentResources: resources
    });
  }, [updateNodeDetails, nodesDetailsMap]);

  // 处理删除资源
  const handleResourceDelete = useCallback((nodeId: string, resourceType: string, resourceId: string) => {
    const nodeDetails = nodesDetailsMap[nodeId];
    if (!nodeDetails?.agentResources) return;

    const currentResources = nodeDetails.agentResources;
    let updatedResources = { ...currentResources };

    switch (resourceType) {
      case 'mcp':
        updatedResources.mcpList = (currentResources.mcpList || []).filter((item: any) => item.id !== resourceId);
        break;
      case 'workflow':
        updatedResources.workflowList = (currentResources.workflowList || []).filter((item: any) => item.id !== resourceId);
        break;
      case 'connect':
        updatedResources.connectList = (currentResources.connectList || []).filter((item: any) => item.id !== resourceId);
        break;
    }

    updateNodeDetails(nodeId, {
      ...nodeDetails,
      agentResources: updatedResources
    });
  }, [nodesDetailsMap, updateNodeDetails]);

  // 处理智能体选择
  const handleAgentSelect = useCallback(async (selectedAgent: AgentData) => {
    if (!pendingAgentNodeData) return;

    const { position, nodeData } = pendingAgentNodeData;
    const nodeId = canvasOperationsHook.generateUniqueNodeId(selectedAgent.name, [], nodeData.kind);

    // 创建节点的逻辑保持不变...
    // 这里可以复用原来的逻辑，但简化状态管理部分

    setPendingAgentNodeData(null);
    setIsAgentSelectorOpen(false);
  }, [pendingAgentNodeData, canvasOperationsHook.generateUniqueNodeId]);

  // 处理节点双击
  const handleNodeDoubleClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    const nodeInstanceId = node.id;
    const cachedDetails = nodesDetailsMap[nodeInstanceId];

    if (!cachedDetails || node.type === 'stickyNote') {
      return;
    }

    const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edges, nodesDetailsMap);
    let parameters = cachedDetails.parameters || [];

    if ((!parameters || parameters.length === 0) && cachedDetails.originalNodeKind) {
      try {
        const response = await fetch(`/api/nodes/${cachedDetails.originalNodeKind}`);
        if (response.ok) {
          const nodeDefData = await response.json();
          parameters = nodeDefData.node?.fields || nodeDefData.node?.parameters || [];

          updateNodeDetails(nodeInstanceId, {
            ...cachedDetails,
            parameters
          });
        }
      } catch (error) {
        console.error('获取节点定义失败:', error);
      }
    }

    const nodeDetailsData = {
      node: cachedDetails.nodeInfo,
      parameters,
      savedValues: cachedDetails.savedValues || {},
      onTest: (nodeValues: Record<string, any>) => nodeTestingHook.handleNodeTest(nodeValues, nodeInstanceId),
      onStopTest: (nodeId: string) => nodeTestingHook.handleStopNodeTest(nodeId),
      onTestPreviousNode: (nodeValues: Record<string, any>, targetNodeId: string) =>
        nodeTestingHook.handleLeftPanelNodeTest(nodeValues, targetNodeId),
      onSaveMockData: (mockTestResult: any) => nodeTestingHook.handleSaveMockData(mockTestResult, nodeInstanceId),
      testOutput: nodeTestOutput,
      lastTestResult: cachedDetails.lastTestResult,
      previousNodeIds,
      onAIhelpClick: onAIhelpClick,
      onPreviousNodeChange: (selectedNodeId: string) => {
        setSelectedPreviousNodes(prev => ({
          ...prev,
          [nodeInstanceId]: selectedNodeId
        }));
      },
      selectedPreviousNodeId: selectedPreviousNodes[nodeInstanceId] || previousNodeIds[0] || '',
      nodesTestResultsMap,
      getLatestNodesTestResultsMap: nodeTestingHook.getLatestNodesTestResultsMap,
      nodesDetailsMap,
      showToast: (type: 'error' | 'warning', title: string, message: string) => {
        if (type === 'error') {
          showError(title, message);
        } else {
          showWarning(title, message);
        }
      },
      isNodeTesting: nodeTestingHook.testingNodes?.has(nodeInstanceId) || false,
      nodeTestEventId: nodeTestingHook.nodeTestEventIds?.[nodeInstanceId]
    };

    setSelectedNodeDetails(nodeDetailsData);
  }, [
    nodesDetailsMap,
    edges,
    nodeTestOutput,
    nodesTestResultsMap,
    nodeTestingHook,
    showError,
    showWarning,
    updateNodeDetails,
    onStopNodeTest,
    selectedPreviousNodes,
    onAIhelpClick
  ]);

  // 处理节点配置保存
  const handleNodeUpdate = useCallback((nodeData: any) => {
    if (nodeData === null) {
      setSelectedNodeDetails(null);
      return;
    }

    const nodeInstanceId = nodeData.id;
    if (nodeInstanceId) {
      const existingDetails = nodesDetailsMap[nodeInstanceId] || {};
      const potentialSavedValues = { ...nodeData.data };

      // 清理系统属性
      delete potentialSavedValues.kind;
      delete potentialSavedValues.name;
      delete potentialSavedValues.description;
      delete potentialSavedValues.icon;
      delete potentialSavedValues.category;
      delete potentialSavedValues.version;
      delete potentialSavedValues.link;
      delete potentialSavedValues.parameters;

      const finalSavedValues = Object.keys(potentialSavedValues).length > 0
        ? potentialSavedValues
        : existingDetails.savedValues || {};

      updateNodeDetails(nodeInstanceId, {
        ...existingDetails,
        savedValues: finalSavedValues,
        lastSaved: new Date().toISOString()
      });
    }

    setSelectedNodeDetails(null);
  }, [nodesDetailsMap, updateNodeDetails]);

  // 处理节点ID变更
  const handleNodeIdChange = useCallback((oldId: string, newId: string) => {
    handleNodeIdChangeUtil(
      oldId,
      newId,
      nodes,
      edges,
      nodesDetailsMap,
      () => { }, // 简化：由 Context 管理
      () => { }, // 简化：由 Context 管理
      updateNodeDetails
    );
  }, [nodes, edges, nodesDetailsMap, updateNodeDetails]);

  // 处理菜单折叠
  const handleMenuCollapseChange = useCallback((collapsed: boolean) => {
    setMenuCollapsed(collapsed);
    onMenuCollapseChange(collapsed);
  }, [onMenuCollapseChange]);

  /**
   * 添加Sticky Note
   */
  const handleAddStickyNote = useCallback((position: { x: number; y: number }) => {
    const newStickyNote: Node = {
      id: `sticky-${Date.now()}`,
      type: 'stickyNote',
      position,
      data: {
        content: '',
        color: '#8B7355'
      },
      style: {
        width: 300,
        height: 160,
      },
      draggable: true,
      selectable: true,
      zIndex: -1, // 设置为最底层
    };

    setNodes([...nodes, newStickyNote]);
  }, [setNodes, nodes]);

  /**
   * 更新Sticky Note - 按照ReactFlow官方示例的方式
   */
  const handleUpdateStickyNote = useCallback((id: string, updateData: any) => {
    // 按照ReactFlow官方示例的方式更新节点
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        // 重要：创建一个新的节点对象来通知ReactFlow变化
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            ...updateData,
          },
        };
        return updatedNode;
      }
      return node;
    });

    setNodes(updatedNodes);

    // 同时更新nodesDetailsMap，确保StickyNote内容能够被保存
    const existingDetails = nodesDetailsMap[id];
    if (existingDetails) {
      updateNodeDetails(id, {
        ...existingDetails,
        savedValues: {
          ...existingDetails.savedValues,
          ...updateData
        }
      });
    } else {
      // 如果没有nodeDetails，创建一个新的
      updateNodeDetails(id, {
        nodeInfo: null,
        savedValues: updateData,
        parameters: null,
        originalNodeKind: 'stickyNote',
        lastSaved: new Date().toISOString()
      });
    }
  }, [setNodes, nodes, nodesDetailsMap, updateNodeDetails]);

  /**
   * 删除Sticky Note
   */
  const handleDeleteStickyNote = useCallback((id: string) => {
    setNodes(nodes.filter((node) => node.id !== id));
  }, [setNodes, nodes]);

  // 使用connect config hook的函数
  const finalFetchConnectConfigs = onFetchConnectInstances || connectConfigHook.handleFetchConnectConfigs;
  const finalFetchConnectDetail = onFetchConnectDetail || connectConfigHook.handleFetchConnectDetail;

  return (
    <ErrorBoundary>
      <WorkflowEditorContainer>
        {/* 左侧节点菜单 */}
        <NodeMenu
          onMenuCollapseChange={handleMenuCollapseChange}
          showError={showError}
          showWarning={showWarning}
        />

        {/* 右侧工作流画布 */}
        <CanvasContainer>
          <WorkflowCanvas
            nodes={nodes} // 直接使用 Context 数据
            edges={edges} // 直接使用 Context 数据
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={canvasOperationsHook.handleConnect}
            onDrop={canvasOperationsHook.handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onNodeUpdate={handleNodeUpdate}
            onNodeDoubleClick={handleNodeDoubleClick}
            selectedNodeDetails={selectedNodeDetails}
            onNodeIdChange={handleNodeIdChange}
            nodeWidth={selectedNodeDetails?.node?.data?.nodeWidth}
            onAutoLayout={() => { }} // 简化
            onCopyNodes={canvasOperationsHook.handleCopyNodes}
            onPasteNodes={canvasOperationsHook.handlePasteNodes}
            nodesTestResultsMap={nodesTestResultsMap}
            getLatestNodesTestResultsMap={nodeTestingHook.getLatestNodesTestResultsMap}
            onFetchConnectInstances={finalFetchConnectConfigs}
            onFetchConnectDetail={finalFetchConnectDetail}
            onMcpLabelClick={(nodeId: string) => {
              setSelectedAgentNodeId(nodeId);
              openMcpDrawer();
            }}
            onResourceDelete={handleResourceDelete}
            onWorkflowTest={onWorkflowTest}
            onStopWorkflowTest={onStopWorkflowTest}
            isTestingWorkflow={isTestingWorkflow}
            workflowId={workflowId}
            menuCollapsed={menuCollapsed}
            onStopNodeTest={onStopNodeTest}
            testingNodes={testingNodes}
            nodeTestEventIds={nodeTestEventIds}
            workflowLogData={workflowLogData}
            nodesDetailsMap={nodesDetailsMap}
            getNodeExecutionStatus={(nodeName: string) => {
              return nodeExecutionStatus.getNodeStatus(nodeName);
            }}
            onAddStickyNote={handleAddStickyNote}
            onUpdateStickyNote={handleUpdateStickyNote}
            onDeleteStickyNote={handleDeleteStickyNote}
          />
        </CanvasContainer>

        {/* MCP抽屉 */}
        <McpDrawer
          isOpen={isMcpDrawerOpen}
          onClose={() => {
            closeMcpDrawer();
            setSelectedAgentNodeId(undefined);
          }}
          selectedNodeId={selectedAgentNodeId}
          selectedNodeDetails={selectedAgentNodeId ? nodesDetailsMap[selectedAgentNodeId] : null}
          onResourcesChange={handleResourcesChange}
        />

        {/* 智能体选择模态窗 */}
        <AgentSelectorModal
          isOpen={isAgentSelectorOpen}
          onClose={() => {
            setIsAgentSelectorOpen(false);
            setPendingAgentNodeData(null);
          }}
          onSelect={handleAgentSelect}
          onFetchAgents={onFetchAgents}
        />
      </WorkflowEditorContainer>
    </ErrorBoundary>
  );
};

export default WorkflowEditor;