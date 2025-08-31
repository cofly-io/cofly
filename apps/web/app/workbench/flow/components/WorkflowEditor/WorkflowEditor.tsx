/**
 * 工作流编辑器组件 - 应用层组件，集成UI组件和业务逻辑
 */

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState, Node, Edge, NodeChange } from 'reactflow';
import styled, { useTheme } from 'styled-components';

// UI组件层导入

// 应用层组件导入
import { WorkflowCanvas } from './WorkflowCanvas';
import { NodeMenu } from '../NodeManagement/NodeMenu';
import { McpDrawer } from '../McpDrawer';
import { AgentSelectorModal } from '@repo/ui/components';
import { AgentData } from '@repo/common';

// 应用层hooks导入
import { useNodeTesting } from '@/workbench/flow';
import { useCanvasOperations } from '@/workbench/flow';
import { useConnectConfig } from '@/workbench/flow';
import { useMcpDrawer } from '@/workbench/flow';
import { useNodeExecutionStatus } from '../../hooks/useNodeExecutionStatus';
//import { useThemeIconUpdater } from '../../hooks/useThemeIcon';

// 工具函数导入
import { getAllPreviousNodeIds } from '@/workbench/flow';
import { handleNodeIdChange as handleNodeIdChangeUtil } from '../../utils/nodeIdUtils';
import { ErrorBoundary } from "../ErrorBoundary";

// 类型导入
import { NodeDetails, FetchTablesResponse, ConnectConfig } from '../../types/node';

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
  onFetchConnectInstances?: (ctype?: string) => Promise<ConnectConfig[]>;
  onFetchConnectDetail?: (datasourceId: string, search?: string) => Promise<FetchTablesResponse>;
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
  // 测试按钮相关props
  onWorkflowTest,
  onStopWorkflowTest,
  isTestingWorkflow,
  workflowId,
  // 节点测试相关props
  onStopNodeTest,
  testingNodes,
  nodeTestEventIds,
  // 工作流日志数据
  workflowLogData,
}) => {
  const theme = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 工作流上下文
  const {
    nodes,
    edges,
    workflowId: contextWorkflowId,
    nodesDetailsMap,
    nodesTestResultsMap,
    setNodes,
    setEdges,
    updateNodeDetails,
    updateNodeTestResult,
    deleteNodeCompletely
  } = useWorkflow();

  // 本地状态管理
  const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);

  // 🔧 添加边变更的调试包装器
  const handleEdgesChange = useCallback((changes: any[]) => {
    console.log('🔗 [WorkflowEditor] onEdgesChange 被调用:', {
      changes,
      changesCount: changes.length,
      changeTypes: changes.map(c => c.type),
      changeIds: changes.map(c => c.id),
      currentEdgesCount: edgesState.length
    });

    // 调用原始的 onEdgesChange
    onEdgesChange(changes);

    // 验证变更是否生效
    setTimeout(() => {
      console.log('🔗 [WorkflowEditor] 边变更后验证:', {
        newEdgesCount: edgesState.length,
        remainingEdgeIds: edgesState.map(e => e.id)
      });
    }, 100);
  }, [onEdgesChange, edgesState]);

  // 移除不必要的边状态监听日志
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);
  const [nodeTestOutput, setNodeTestOutput] = useState<string>('');
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  // 监听测试结果变化，更新nodeTestOutput
  useEffect(() => {
    if (selectedNodeDetails?.node?.id) {
      const nodeId = selectedNodeDetails.node.id;
      const testResult = nodesTestResultsMap[nodeId];

      if (testResult) {
        const testOutputString = JSON.stringify(testResult, null, 2);
        setNodeTestOutput(testOutputString);

        console.log('🔄 [WorkflowEditor] 更新nodeTestOutput:', {
          nodeId,
          hasTestResult: !!testResult,
          testOutputLength: testOutputString.length
        });
      } else {
        setNodeTestOutput('');
      }
    } else {
      setNodeTestOutput('');
    }
  }, [selectedNodeDetails?.node?.id, nodesTestResultsMap]);

  // 用户选择的前置节点状态管理 - 按节点ID存储用户的选择
  const [selectedPreviousNodes, setSelectedPreviousNodes] = useState<Record<string, string>>({});



  // MCP抽屉状态管理
  const { isOpen: isMcpDrawerOpen, openDrawer: openMcpDrawer, closeDrawer: closeMcpDrawer } = useMcpDrawer();
  const [selectedAgentNodeId, setSelectedAgentNodeId] = useState<string | undefined>(undefined);

  // 节点执行状态管理
  const nodeExecutionStatus = useNodeExecutionStatus({
    workflowLogData,
    isTestingWorkflow
  });

  // 智能体选择模态窗状态管理
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const [pendingAgentNodeData, setPendingAgentNodeData] = useState<{
    position: { x: number; y: number };
    nodeData: any;
  } | null>(null);

  // 处理资源变化的函数
  const handleResourcesChange = useCallback((nodeId: string, resources: any) => {
    // 更新节点详情，将选中的资源保存到节点中
    updateNodeDetails(nodeId, {
      ...nodesDetailsMap[nodeId],
      agentResources: resources
    });
  }, [updateNodeDetails, nodesDetailsMap]);

  // 处理删除资源的函数
  const handleResourceDelete = useCallback((nodeId: string, resourceType: string, resourceId: string) => {
    const nodeDetails = nodesDetailsMap[nodeId];
    if (!nodeDetails?.agentResources) return;

    const currentResources = nodeDetails.agentResources;
    let updatedResources = { ...currentResources };

    // 根据资源类型删除对应的资源
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

    // 更新节点详情
    updateNodeDetails(nodeId, {
      ...nodeDetails,
      agentResources: updatedResources
    });
  }, [nodesDetailsMap, updateNodeDetails]);



  // 工作流ID变化时重置状态
  const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(null);

  // 删除历史记录，防止节点ID重用
  const [deletedNodeHistory, setDeletedNodeHistory] = useState<Set<string>>(new Set());

  // 添加删除操作标记，防止删除后立即恢复节点
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (contextWorkflowId && contextWorkflowId !== lastWorkflowId) {
      setNodesState([]);
      setEdgesState([]);
      setLastWorkflowId(contextWorkflowId);
    }
  }, [contextWorkflowId, lastWorkflowId, setNodesState, setEdgesState]);

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

  // 主题图标更新器
  //useThemeIconUpdater(nodesState, setNodesState);

  // 🚫 临时禁用从 Context 到 ReactFlow 的状态同步，避免删除后节点恢复的问题
  // 同步Context数据到ReactFlow状态 - 添加调试日志
  useEffect(() => {
    // 如果正在删除操作中，不要从 Context 恢复节点
    if (isDeleting) {

      return;
    }

    // 只在真正的初始化场景下从 Context 同步到 ReactFlow
    // 避免在删除操作后立即恢复节点
    const isInitialLoad = nodesState.length === 0 && nodes.length > 0;
    const isWorkflowSwitch = nodes.length > 0 && nodesState.length > 0 &&
      !nodes.some(contextNode => nodesState.some(reactFlowNode => reactFlowNode.id === contextNode.id));

    if (isInitialLoad) {
      console.log('🔄 [WorkflowEditor] 初始化节点状态从 Context');
      setNodesState(nodes);
    }

    if (edges.length > 0 && edgesState.length === 0) {
      console.log('🔄 [WorkflowEditor] 初始化边状态从 Context');
      setEdgesState(edges);
    }

    // 检测工作流切换
    if (isWorkflowSwitch) {
      console.log('🔄 [WorkflowEditor] 检测到工作流切换，重置状态');
      setNodesState(nodes);
      setEdgesState(edges);
    }
  }, [nodes, edges, setNodesState, setEdgesState, isDeleting]);

  // 同步 nodesDetailsMap 中的 agentResources 到节点的 data 属性
  useEffect(() => {
    setNodesState(currentNodes =>
      currentNodes.map(node => {
        const nodeDetails = nodesDetailsMap[node.id];
        if (nodeDetails?.agentResources && node.type === 'agentNode') {
          return {
            ...node,
            data: {
              ...node.data,
              agentResources: nodeDetails.agentResources
            }
          };
        }
        return node;
      })
    );
  }, [nodesDetailsMap, setNodesState]);

  // 🔧 同步 ReactFlow 状态变化回 Context - 修复无限循环问题
  useEffect(() => {
    // 同步节点状态到 Context - 使用更简单的比较方式，但移除nodes依赖避免循环
    const nodesChanged = nodesState.length !== nodes.length ||
      nodesState.some((node, index) => nodes[index]?.id !== node.id);

    if (nodesChanged) {
      console.log('🔄 [WorkflowEditor] 同步节点状态到 Context:', {
        nodesStateCount: nodesState.length,
        contextNodesCount: nodes.length,
        nodesStateIds: nodesState.map(n => n.id),
        contextNodesIds: nodes.map(n => n.id)
      });
      setNodes(nodesState);
    }

    // 同步边状态到 Context - 使用更简单的比较方式
    const edgesChanged = edgesState.length !== edges.length ||
      edgesState.some((edge, index) => edges[index]?.id !== edge.id);

    if (edgesChanged) {
      console.log('🔄 [WorkflowEditor] 同步边状态到 Context:', {
        edgesStateCount: edgesState.length,
        contextEdgesCount: edges.length,
        edgesStateIds: edgesState.map(e => e.id),
        contextEdgesIds: edges.map(e => e.id)
      });
      setEdges(edgesState);
    }
  }, [nodesState, edgesState, setNodes, setEdges]); // 移除nodes和edges依赖避免循环

  // 移除导致无限重新渲染的 useEffect

  // 移除不必要的日志输出

  // 初始化hooks - 直接传递参数，不使用 useMemo
  const nodeTestingHook = useNodeTesting({
    workflowId: contextWorkflowId || '',
    nodesDetailsMap,
    nodesTestResultsMap,
    edgesState,
    updateNodeTestResult,
    updateNodeDetails,
    showError,
    showSuccess: (title: string, message: string) => {
      // 这里可以调用父组件的showSuccess，或者使用toast
      console.log(`✅ ${title}: ${message}`);
    },
    showWarning
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
          console.log('🔄 [WorkflowEditor] Updated selectedNodeDetails:', {
            oldIsNodeTesting: prev?.isNodeTesting,
            newIsNodeTesting: updated.isNodeTesting,
            nodeInstanceId
          });
          return updated;
        });
      }
    }
  }, [nodeTestingHook.testingNodes, nodeTestingHook.nodeTestEventIds]); // 移除 selectedNodeDetails 依赖，避免循环更新

  const canvasOperationsHook = useCanvasOperations({
    nodes: nodesState,
    edges: edgesState,
    nodesDetailsMap,
    onNodesChange,
    onEdgesChange,
    setNodes: setNodesState,
    setEdges: setEdgesState,
    updateNodeDetails,
    deleteNodeCompletely,
    showError,
    showSuccess: (title: string, message: string) => {
      console.log(`✅ ${title}: ${message}`);
    },
    showWarning,
    deletedNodeHistory
  });

  const connectConfigHook = useConnectConfig({
    showError,
    showWarning,
    showSuccess: (title: string, message: string) => {
      console.log(`✅ ${title}: ${message}`);
    }
  });

  // 设置画布状态变化回调
  useEffect(() => {
    canvasOperationsHook.setCanvasStateChangeCallback((nodes, edges) => {
      onCanvasStateChange?.(nodes, edges);
    });
  }, [canvasOperationsHook, onCanvasStateChange]);

  // 处理智能体选择 - 乐观渲染版本
  const handleAgentSelect = useCallback(async (selectedAgent: AgentData) => {
    if (!pendingAgentNodeData) return;

    const { position, nodeData } = pendingAgentNodeData;

    // 🎯 使用智能体名称生成唯一的节点ID（支持递增命名）
    const nodeId = canvasOperationsHook.generateUniqueNodeId(selectedAgent.name, [], nodeData.kind);

    // 🚀 乐观渲染：先创建节点并立即渲染到画布
    const newNode: Node = {
      id: nodeId,
      type: nodeData.type || 'agentNode',
      position,
      data: {
        ...nodeData,
        kind: nodeData.kind,
        name: nodeId, // 🎯 使用生成的唯一ID作为节点名称
        // 使用基础智能体信息，避免等待API调用
        selectedAgent: {
          id: selectedAgent.id,
          name: selectedAgent.name,
          description: selectedAgent.description,
          avatar: selectedAgent.avatar,
          modelId: selectedAgent.modelId,
          connectid: selectedAgent.connectid
        },
        // 添加加载状态标识
        isLoading: true
      },
      style: {
        width: 300,
        height: 100,
      }
    };

    // 🚀 立即创建基础的节点详情并渲染到画布
    //     parameters：节点的参数定义（schema），包含字段类型、默认值等元数据
    // nodeValues：用户在界面中输入的实际值
    // savedValues：保存到数据库的用户输入值
    const basicSavedValues: Record<string, any> = {
      // 基础配置，使用选中智能体的基本信息
      connectid: selectedAgent.connectid || '',
      model: selectedAgent.modelId || '',
      userprompt: '', // 用户需要手动填写

      // 保存智能体引用信息
      _agentReference: {
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        originalConnectId: selectedAgent.connectid,
        originalModelId: selectedAgent.modelId,
        originalModelName: selectedAgent.modelName
      }
    };

    // 创建基础节点详情
    const basicNodeDetails: NodeDetails = {
      nodeInfo: newNode,
      savedValues: basicSavedValues,
      originalNodeKind: nodeData.kind,
      parameters: null,
      createdAt: Date.now()
    };

    try {
      // 🎯 立即更新节点详情到 nodesDetailsMap（确保 generateUniqueNodeId 正常工作）
      updateNodeDetails(nodeId, basicNodeDetails);

      // 🎯 立即添加节点到画布（用户立即看到节点）
      onNodesChange([{
        type: 'add',
        item: newNode
      }]);

      // 通知画布状态变化
      const newNodes = [...nodesState, newNode];
      onCanvasStateChange?.(newNodes, edgesState);

      // 清理状态
      setPendingAgentNodeData(null);
      setIsAgentSelectorOpen(false);

      console.log('🎉 [handleAgentSelect] 智能体节点立即创建完成:', nodeId);

      // 🔄 异步加载完整的智能体信息和节点定义
      const loadFullAgentData = async () => {
        try {
          console.log('🔄 [handleAgentSelect] 开始异步加载完整智能体信息:', selectedAgent.id);

          let fullAgentData = selectedAgent;

          // 如果选中的智能体有ID，获取完整信息
          if (selectedAgent.id) {
            const agentResponse = await AgentService.getAgent(selectedAgent.id);
            if (agentResponse.success && agentResponse.data) {
              fullAgentData = agentResponse.data;
              console.log('✅ [handleAgentSelect] 异步获取到完整智能体信息:', fullAgentData);
            }
          }

          // 构建完整的配置信息
          let fullSavedValues: Record<string, any> = {
            connectid: fullAgentData.connectid || '',
            model: fullAgentData.modelId || '',
            userprompt: '', // 用户需要手动填写
          };

          // nodeMode为agent节点类型，保存智能体配置信息供后续使用
          // 注意：不直接设置addBy字段，这些字段应该由用户主动添加
          if (nodeData.nodeMode === 'agent' && fullAgentData.agentInfo) {
            try {
              const agentConfig = JSON.parse(fullAgentData.agentInfo);
              // 将智能体配置保存到特殊字段，供addBy机制使用
              fullSavedValues._agentConfig = agentConfig;
            } catch (error) {
              console.warn('⚠️ [handleAgentSelect] 解析 agentInfo 失败:', error);
            }
          }

          // 更新智能体引用信息
          fullSavedValues._agentReference = {
            agentId: fullAgentData.id,
            agentName: fullAgentData.name,
            originalConnectId: fullAgentData.connectid,
            originalModelId: fullAgentData.modelId,
            originalModelName: fullAgentData.modelName
          };

          // 同时获取节点定义
          const nodeDefinition = await fetch(`/api/nodes/${nodeData.kind}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          let nodeParameters = null;
          if (nodeDefinition.ok) {
            const nodeDefData = await nodeDefinition.json();
            nodeParameters = nodeDefData.node?.fields || nodeDefData.node?.parameters || [];
          }

          // 更新节点的完整信息
          const updatedNode: Node = {
            ...newNode,
            data: {
              ...newNode.data,
              selectedAgent: {
                id: fullAgentData.id,
                name: fullAgentData.name,
                description: fullAgentData.description,
                avatar: fullAgentData.avatar,
                modelId: fullAgentData.modelId,
                connectid: fullAgentData.connectid
              },
              isLoading: false // 移除加载状态
            }
          };

          const updatedNodeDetails: NodeDetails = {
            nodeInfo: updatedNode,
            savedValues: fullSavedValues,
            originalNodeKind: nodeData.kind,
            parameters: nodeParameters,
            createdAt: basicNodeDetails.createdAt
          };

          // 更新节点详情
          updateNodeDetails(nodeId, updatedNodeDetails);

          // 更新画布上的节点 - 使用React Flow的正确方式
          setNodesState(prevNodes =>
            prevNodes.map(node =>
              node.id === nodeId ? updatedNode : node
            )
          );

          console.log('✅ [handleAgentSelect] 异步更新完成:', nodeId);

        } catch (error) {
          console.error('❌ [handleAgentSelect] 异步加载失败:', error);
          // 移除加载状态，即使加载失败
          const errorNode: Node = {
            ...newNode,
            data: {
              ...newNode.data,
              isLoading: false
            }
          };
          // 更新画布上的节点 - 移除加载状态
          setNodesState(prevNodes =>
            prevNodes.map(node =>
              node.id === nodeId ? errorNode : node
            )
          );
        }
      };

      // 启动异步加载
      loadFullAgentData();

    } catch (error) {
      console.error('❌ [handleAgentSelect] 处理智能体选择失败:', error);
      showError('创建节点失败', error instanceof Error ? error.message : '未知错误');

      // 清理状态
      setPendingAgentNodeData(null);
      setIsAgentSelectorOpen(false);
    }
  }, [pendingAgentNodeData, canvasOperationsHook.generateUniqueNodeId, onNodesChange, updateNodeDetails, nodesState, edgesState, onCanvasStateChange, showError]);

  // 注意：复制粘贴状态已经在 canvasOperationsHook 中管理，这里不需要重复定义



  /**
   * 处理节点变化事件
   * 响应节点的移动、删除等操作，并清理相关数据
   */
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);

    // 通知父组件画布状态变化
    setTimeout(() => {
      if (onCanvasStateChange) {
        onCanvasStateChange(nodesState, edgesState);
      }
    }, 0);

    // 处理节点删除事件，使用统一的删除方法
    const deleteChanges = changes.filter((change): change is NodeChange & { type: 'remove'; id: string } =>
      change.type === 'remove'
    );
    if (deleteChanges.length > 0) {
      console.log('🗑️ [WorkflowEditor] 处理节点删除事件:', {
        deleteCount: deleteChanges.length,
        nodeIds: deleteChanges.map(c => c.id)
      });

      // 设置删除标记，防止状态同步冲突
      setIsDeleting(true);

      deleteChanges.forEach((change) => {
        const nodeId = change.id;

        // 检查节点是否存在，避免重复删除
        if (!nodesDetailsMap[nodeId]) {
          console.log('🔄 [WorkflowEditor] 节点已被删除，跳过重复删除:', { nodeId });
          return;
        }

        console.log('🗑️ [WorkflowEditor] 开始删除节点:', {
          nodeId,
          beforeDeletion: {
            hasNodeDetails: !!nodesDetailsMap[nodeId],
            nodesDetailsMapKeys: Object.keys(nodesDetailsMap),
            timestamp: Date.now()
          }
        });

        // 添加到删除历史记录
        setDeletedNodeHistory(prev => {
          const newHistory = new Set(prev);
          newHistory.add(nodeId);
          return newHistory;
        });

        // 5秒后从删除历史中移除，避免永久占用内存
        setTimeout(() => {
          setDeletedNodeHistory(prev => {
            const newHistory = new Set(prev);
            if (newHistory.has(nodeId)) {
              newHistory.delete(nodeId);
              console.log('🧹 [WorkflowEditor] Removed from deletion history after 5s:', nodeId);
            }
            return newHistory;
          });
        }, 5000);

        // 如果当前正在显示被删除节点的详情，关闭详情面板
        if (selectedNodeDetails?.node?.id === nodeId) {
          setSelectedNodeDetails(null);
        }

        // 立即删除节点详情，确保即时性
        deleteNodeCompletely(nodeId);

        // 立即从删除历史中移除，允许重新使用相同名称
        setTimeout(() => {
          setDeletedNodeHistory(prev => {
            const newHistory = new Set(prev);
            if (newHistory.has(nodeId)) {
              newHistory.delete(nodeId);
              console.log('🧹 [WorkflowEditor] 立即从删除历史中移除:', nodeId);
            }
            return newHistory;
          });
        }, 100); // 100ms后清理，确保删除操作完成

        // 验证删除结果
        setTimeout(() => {
          console.log('🗑️ [WorkflowEditor] 删除后验证:', {
            nodeId,
            afterDeletion: {
              hasNodeDetails: !!nodesDetailsMap[nodeId],
              nodesDetailsMapKeys: Object.keys(nodesDetailsMap),
              timestamp: Date.now()
            }
          });
        }, 0);
      });

      // 删除操作完成后，延迟清除删除标记
      setTimeout(() => {
        setIsDeleting(false);
        console.log('🔄 [WorkflowEditor] 删除操作完成，清除删除标记');
      }, 200); // 200ms 延迟，确保状态更新完成
    }
  }, [onNodesChange, deleteNodeCompletely, selectedNodeDetails, nodesState, edgesState, onCanvasStateChange]);

  // 移除重复的键盘事件处理，现在由WorkflowCanvas组件统一处理

  /**
   * 处理节点双击 - 打开节点配置面板
   */
  const handleNodeDoubleClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    const nodeInstanceId = node.id;
    const cachedDetails = nodesDetailsMap[nodeInstanceId];

    if (!cachedDetails) {
      showError('节点错误', `找不到节点详情: ${nodeInstanceId}`);
      return;
    }

    // 检查是否为sticky note节点，如果是则不处理
    if (node.type === 'stickyNote') {
      console.log('📝 [handleNodeDoubleClick] Sticky note node clicked, no configuration needed');
      return;
    }

    // 计算前置节点列表
    const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);

    // 检查是否已有参数数据，如果没有则尝试获取
    let parameters = cachedDetails.parameters || cachedDetails.nodeInfo?.data?.parameters || [];

    // 如果参数为 null 或空数组，且有 originalNodeKind，尝试从 API 获取
    if ((!parameters || parameters.length === 0) && cachedDetails.originalNodeKind) {
      try {
        console.log('🔄 [handleNodeDoubleClick] Fetching parameters for node:', nodeInstanceId);
        const response = await fetch(`/api/nodes/${cachedDetails.originalNodeKind}`);
        if (response.ok) {
          const nodeDefData = await response.json();
          parameters = nodeDefData.node?.fields || nodeDefData.node?.parameters || [];

          // 更新缓存的节点详情
          const updatedDetails = {
            ...cachedDetails,
            parameters,
            nodeInfo: {
              ...cachedDetails.nodeInfo,
              data: {
                ...cachedDetails.nodeInfo.data,
                parameters
              }
            }
          };
          updateNodeDetails(nodeInstanceId, updatedDetails);
          console.log('✅ [handleNodeDoubleClick] Updated parameters for node:', nodeInstanceId);
        } else {
          console.warn('⚠️ [handleNodeDoubleClick] Failed to fetch node definition');
        }
      } catch (error) {
        console.error('❌ [handleNodeDoubleClick] Error fetching node definition:', error);
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
        console.log('📥 [WorkflowEditor] onPreviousNodeChange called:', {
          nodeInstanceId,
          selectedNodeId,
          previousSelectedPreviousNodes: selectedPreviousNodes
        });

        // 保存用户选择的前置节点
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

    // 添加调试日志
    console.log('🔧 [WorkflowEditor] Setting nodeDetailsData:', {
      nodeInstanceId,
      testingNodesSize: nodeTestingHook.testingNodes?.size || 0,
      testingNodesArray: Array.from(nodeTestingHook.testingNodes || []),
      isNodeTesting: nodeTestingHook.testingNodes?.has(nodeInstanceId) || false,
      nodeTestEventId: nodeTestingHook.nodeTestEventIds?.[nodeInstanceId]
    });

    setSelectedNodeDetails(nodeDetailsData);
  }, [
    nodesDetailsMap,
    edgesState,
    nodeTestOutput,
    nodesTestResultsMap,
    nodeTestingHook.testingNodes,
    nodeTestingHook.nodeTestEventIds,
    nodeTestingHook.handleNodeTest,
    nodeTestingHook.handleLeftPanelNodeTest,
    nodeTestingHook.handleSaveMockData,
    nodeTestingHook.getLatestNodesTestResultsMap,
    showError,
    showWarning,
    updateNodeDetails,
    onStopNodeTest,
    selectedPreviousNodes
  ]);

  /**
   * 处理节点配置保存 - 完整实现，与 page_backup.tsx 保持一致
   */
  const handleNodeUpdate = useCallback((nodeData: any) => {
    if (nodeData === null) {
      // 关闭配置面板
      setSelectedNodeDetails(null);
      return;
    }

    const nodeInstanceId = nodeData.id;

    if (nodeInstanceId) {
      const existingDetails = nodesDetailsMap[nodeInstanceId] || {};

      // 提取用户配置的值，排除系统属性
      const potentialSavedValues = { ...nodeData.data };
      delete potentialSavedValues.kind;
      delete potentialSavedValues.name;
      delete potentialSavedValues.description;
      delete potentialSavedValues.icon;
      delete potentialSavedValues.category;
      delete potentialSavedValues.version;
      delete potentialSavedValues.link;
      delete potentialSavedValues.parameters;

      // 判断是否包含实际配置数据
      const isRealSave = Object.keys(potentialSavedValues).length > 0;

      let finalSavedValues;
      if (isRealSave) {
        finalSavedValues = potentialSavedValues;
      } else {
        // 保留原有数据，避免数据库数据丢失
        finalSavedValues = existingDetails.savedValues || {};
      }

      // 更新节点详情，保持完整的数据结构
      updateNodeDetails(nodeInstanceId, {
        ...existingDetails,
        savedValues: finalSavedValues,
        //parameters: existingDetails.parameters || null,
        lastSaved: new Date().toISOString() // 添加保存时间戳
      });

      // 只有在保存数据时才更新节点状态
      setNodesState(nds => nds.map(node =>
        node.id === nodeData.id ? { ...node, data: { ...node.data, ...nodeData.data } } : node
      ));

      console.log('✅ [WorkflowEditor] 节点配置已保存:', {
        nodeInstanceId,
        isRealSave,
        savedValuesKeys: Object.keys(finalSavedValues),
        finalSavedValues
      });
    }

    // 关闭配置面板
    setSelectedNodeDetails(null);
  }, [setNodesState, nodesDetailsMap, updateNodeDetails]);

  /**
   * 处理节点ID变更
   */
  const handleNodeIdChange = useCallback((oldId: string, newId: string) => {
    handleNodeIdChangeUtil(
      oldId,
      newId,
      nodesState,
      edgesState,
      nodesDetailsMap,
      setNodesState,
      setEdgesState,
      updateNodeDetails
    );
  }, [nodesState, edgesState, nodesDetailsMap, setNodesState, setEdgesState, updateNodeDetails]);

  /**
   * 处理菜单折叠状态变化
   */
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

    setNodesState((nodes) => [...nodes, newStickyNote]);
  }, [setNodesState]);

  /**
   * 更新Sticky Note - 按照ReactFlow官方示例的方式
   */
  const handleUpdateStickyNote = useCallback((id: string, updateData: any) => {
    console.log('🔄 [WorkflowEditor] 更新Sticky Note:', { id, updateData });

    // 按照ReactFlow官方示例的方式更新节点
    setNodesState((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // 重要：创建一个新的节点对象来通知ReactFlow变化
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              ...updateData,
            },
          };
          console.log('✅ [WorkflowEditor] 节点更新:', {
            oldData: node.data,
            newData: updatedNode.data,
            updateData
          });
          return updatedNode;
        }
        return node;
      }),
    );

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
  }, [setNodesState, nodesDetailsMap, updateNodeDetails]);

  /**
   * 删除Sticky Note
   */
  const handleDeleteStickyNote = useCallback((id: string) => {
    setNodesState((nodes) => nodes.filter((node) => node.id !== id));
  }, [setNodesState]);

  // 使用connect config hook的函数，如果父组件没有提供的话
  const finalFetchConnectConfigs = onFetchConnectInstances || connectConfigHook.handleFetchConnectConfigs;
  const finalFetchTables = onFetchConnectDetail || connectConfigHook.handleFetchTables;

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
            nodes={nodesState}
            edges={edgesState}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={canvasOperationsHook.handleConnect}
            onDrop={canvasOperationsHook.handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            // onSelectionChange={(elements) => {
            //   console.log('选择变化:', elements);
            // }}
            onNodeUpdate={handleNodeUpdate}
            onNodeDoubleClick={handleNodeDoubleClick}
            selectedNodeDetails={selectedNodeDetails}
            onNodeIdChange={handleNodeIdChange}
            nodeWidth={selectedNodeDetails?.node?.data?.nodeWidth}
            onAutoLayout={(layoutedNodes) => {
              setNodesState(layoutedNodes);
            }}
            onCopyNodes={canvasOperationsHook.handleCopyNodes}
            onPasteNodes={async () => {
              // 首先检查是否有内部复制的节点
              if (canvasOperationsHook.copyPasteState.copiedNodes.length > 0) {
                canvasOperationsHook.handlePasteNodes();
                return;
              }

              // 如果没有内部复制的节点，尝试从系统剪贴板导入
              try {
                const clipboardText = await navigator.clipboard.readText();
                if (clipboardText.trim()) {
                  try {
                    const clipboardData = JSON.parse(clipboardText);
                    if (clipboardData && clipboardData.nodes && clipboardData.edges) {
                      console.log('📋 [画布粘贴] 从系统剪贴板导入工作流数据');
                      await canvasOperationsHook.handleImportFromClipboard(clipboardText);
                      return;
                    }
                  } catch (parseError) {
                    // 不是JSON格式，忽略
                  }
                }
              } catch (error) {
                console.error('❌ [画布粘贴] 读取剪贴板失败:', error);
              }

              // 如果都失败了，尝试普通粘贴
              canvasOperationsHook.handlePasteNodes();
            }}
            nodesTestResultsMap={nodesTestResultsMap}
            getLatestNodesTestResultsMap={nodeTestingHook.getLatestNodesTestResultsMap}
            connectConfigs={[]} // 这里传入空数组，依赖动态获取
            onFetchConnectInstances={finalFetchConnectConfigs}
            onFetchConnectDetail={finalFetchTables}
            onMcpLabelClick={(nodeId: string) => {
              setSelectedAgentNodeId(nodeId);
              openMcpDrawer();
            }}
            onResourceDelete={handleResourceDelete}
            // 测试按钮相关props
            onWorkflowTest={onWorkflowTest}
            onStopWorkflowTest={onStopWorkflowTest}
            isTestingWorkflow={isTestingWorkflow}
            workflowId={workflowId}
            menuCollapsed={menuCollapsed}
            // 节点测试相关props
            onStopNodeTest={onStopNodeTest}
            testingNodes={testingNodes}
            nodeTestEventIds={nodeTestEventIds}
            // 工作流日志数据
            workflowLogData={workflowLogData}
            // 节点详情映射
            nodesDetailsMap={nodesDetailsMap}
            // 节点执行状态获取函数
            getNodeExecutionStatus={(nodeName: string) => {
              const result = nodeExecutionStatus.getNodeStatus(nodeName);
              return result;
            }}
            // Sticky note相关回调
            onAddStickyNote={handleAddStickyNote}
            onUpdateStickyNote={handleUpdateStickyNote}
            onDeleteStickyNote={handleDeleteStickyNote}
          />
        </CanvasContainer>

        {/* MCP抽屉 - 渲染在WorkflowEditor层级，不受画布缩放影响 */}
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