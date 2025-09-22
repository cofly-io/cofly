/**
 * 画布操作相关的自定义hooks
 */

import { useCallback, useState, useRef } from 'react';
import { Node, Edge, Connection, addEdge, NodeChange, EdgeChange, ReactFlowInstance } from 'reactflow';
import { CanvasState, CopyPasteState, NodePosition } from '../types/canvas';
import { NodeDetails } from '../types/node';
import { nodeApiService } from '@/services/nodeApiService';
import {
  createEdge,
  validateEdgeConnection,
  wouldCreateCycle,
  removeEdgesForNode
} from '../utils/edgeProcessing';
import { handleSyncOperation, handleAsyncOperation, logger } from '../utils/errorHandling';
import { PASTE_OFFSET, NODE_SPACING, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from '../utils/constants';

interface UseCanvasOperationsProps {
  nodes: Node[];
  edges: Edge[];
  nodesDetailsMap: Record<string, NodeDetails>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setNodes?: (nodes: Node[]) => void;
  setEdges?: (edges: Edge[]) => void;
  updateNodeDetails: (nodeId: string, details: Partial<NodeDetails>) => void;
  deleteNodeCompletely: (nodeId: string) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  reactFlowInstance?: ReactFlowInstance;
  deletedNodeHistory?: Set<string>;
}

export const useCanvasOperations = ({
  nodes,
  edges,
  nodesDetailsMap,
  onNodesChange,
  onEdgesChange,
  setNodes,
  setEdges,
  updateNodeDetails,
  deleteNodeCompletely,
  showError,
  showSuccess,
  showWarning,
  reactFlowInstance,
  deletedNodeHistory = new Set()
}: UseCanvasOperationsProps) => {

  // 复制粘贴状态
  const [copyPasteState, setCopyPasteState] = useState<CopyPasteState>({
    copiedNodes: [],
    copiedEdges: [],
    pasteOffset: PASTE_OFFSET
  });

  // 画布状态变化回调的引用
  const canvasStateChangeRef = useRef<((nodes: Node[], edges: Edge[]) => void) | null>(null);

  /**
   * 生成唯一的节点ID（基于同类节点最大序号+1）
   * 在nodesDetailsMap中寻找同类节点最大的序号，然后给序号+1生成新node
   */
  const generateUniqueNodeId = useCallback((baseName: string, excludeIds: string[] = [], nodeKind?: string) => {
    // 获取当前画布上所有节点的ID
    const existingNames = nodes.map(node => node.id).filter(id => !excludeIds.includes(id));

    // 创建不可用ID集合（包括现有ID、排除ID和删除历史）
    const unavailableIds = new Set([
      ...existingNames,
      ...excludeIds,
      ...deletedNodeHistory
    ]);

    // 在nodesDetailsMap中寻找同类节点的最大序号
    const sameTypeNodes = Object.entries(nodesDetailsMap).filter(([nodeId, nodeDetails]) => {
      // 优先使用传入的nodeKind，否则使用baseName作为类型判断
      const targetKind = nodeKind || baseName;
      const nodeKindToCompare = nodeDetails.originalNodeKind || nodeDetails.nodeInfo?.data?.kind;
      return nodeKindToCompare === targetKind && !excludeIds.includes(nodeId);
    });

    // 提取所有同类节点ID中的数字序号
    const existingNumbers: number[] = [];

    sameTypeNodes.forEach(([nodeId]) => {
      if (nodeId === baseName) {
        // 如果存在基础名称（没有数字后缀），认为是序号1
        existingNumbers.push(1);
      } else if (nodeId.startsWith(baseName)) {
        // 提取baseName后的数字部分
        const suffix = nodeId.substring(baseName.length);
        const number = parseInt(suffix, 10);
        if (!isNaN(number) && number > 0) {
          existingNumbers.push(number);
        }
      }
    });

    // 如果没有找到任何同类节点，从1开始
    if (existingNumbers.length === 0) {
      const candidateId = baseName;
      if (!unavailableIds.has(candidateId)) {
        return candidateId;
      }
    }

    // 找到最大序号，然后+1
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    let nextNumber = maxNumber + 1;
    let candidateId = nextNumber === 1 ? baseName : `${baseName}${nextNumber}`;

    // 确保生成的ID不在不可用列表中
    while (unavailableIds.has(candidateId)) {
      nextNumber++;
      candidateId = `${baseName}${nextNumber}`;
    }

    return candidateId;
  }, [nodes, deletedNodeHistory, nodesDetailsMap]);

  /**
   * 设置画布状态变化回调
   */
  const setCanvasStateChangeCallback = useCallback((callback: (nodes: Node[], edges: Edge[]) => void) => {
    canvasStateChangeRef.current = callback;
  }, []);

  /**
   * 通知画布状态变化
   */
  const notifyCanvasStateChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (canvasStateChangeRef.current) {
      canvasStateChangeRef.current(newNodes, newEdges);
    }
  }, []);

  /**
   * 处理节点连接
   */
  const handleConnect = useCallback((connection: Connection) => {
    const result = handleSyncOperation(() => {
      // 验证连接的有效性
      const validationResult = validateEdgeConnection(connection, edges);
      if (!validationResult.success) {
        throw new Error(validationResult.error);
      }

      // 检查是否会形成循环
      if (wouldCreateCycle(connection, edges)) {
        throw new Error('不能创建循环连接');
      }

      // 创建新边
      const newEdge = createEdge(connection);

      // 添加边到画布
      const newEdges = addEdge(newEdge, edges);
      onEdgesChange([{
        type: 'add',
        item: newEdge
      }]);

      logger.info('创建节点连接', {
        from: connection.source,
        to: connection.target,
        edgeId: newEdge.id
      });

      // 通知画布状态变化
      notifyCanvasStateChange(nodes, newEdges);

      return newEdge;
    }, '创建连接失败');

    if (!result.success) {
      showError('连接失败', result.error);
    }

    return result;
  }, [edges, nodes, onEdgesChange, notifyCanvasStateChange, showError]);

  /**
   * 处理节点拖拽放置
   */
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    // 预先检查拖拽数据
    const data = event.dataTransfer.getData('application/reactflow');
    
    if (!data) {
      showError('拖拽失败', '无效的拖拽数据');
      return { success: false, error: '无效的拖拽数据' };
    }

    const nodeData = JSON.parse(data);

    // 如果拖拽的节点是触发器类型，检查画布上是否已经存在任何触发器节点
    if (nodeData.catalog === 'trigger') {
      const existingTrigger = Object.values(nodesDetailsMap).find((nodeDetails: any) =>
        nodeDetails.nodeInfo?.data?.catalog === 'trigger'
      );

      if (existingTrigger) {
        showError('重复触发器', '画布上只能存在一个触发器');
        return { success: false, error: '画布上只能存在一个触发器' };
      }
    }

    const result = handleSyncOperation(() => {
      if (!event.currentTarget) {
        throw new Error('无法获取画布容器元素');
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();

      // 计算节点位置 - 使用 ReactFlow 的 screenToFlowPosition 方法
      let position;
      const globalReactFlowInstance = reactFlowInstance || (window as any).reactFlowInstance;

      if (globalReactFlowInstance) {
        // 使用 ReactFlow 实例的 screenToFlowPosition 方法来准确计算位置
        position = globalReactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        // 调整位置，使节点中心对齐鼠标位置
        position.x -= DEFAULT_NODE_WIDTH / 2;
        position.y -= DEFAULT_NODE_HEIGHT / 2;
      } else {
        // 回退到原有的计算方式
        position = {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 50,
        };
      }

      // 检查是否是 agent-system 节点，如果是则触发智能体选择模态窗
      if (nodeData.kind === 'agent-system') {
        // 触发智能体选择模态窗
        const agentSelectorEvent = new CustomEvent('show-agent-selector', {
          detail: {
            position,
            nodeData
          }
        });
        window.dispatchEvent(agentSelectorEvent);

        // 对于 agent-system 节点，不直接创建节点，而是等待用户选择智能体
        return null;
      }

      // 生成唯一的节点ID（基于同类节点最大序号+1）
      const nodeId = generateUniqueNodeId(nodeData.name, [], nodeData.kind);

      // 创建新节点
      const newNode: Node = {
        id: nodeId,
        type: nodeData.type || 'actionNode',
        position,
        data: {
          ...nodeData,
          kind: nodeData.kind,
          name: nodeId,
        },
        style: {
          width: DEFAULT_NODE_WIDTH,
          height: DEFAULT_NODE_HEIGHT,
        }
      };

      // 先创建基本的节点详情，确保双击时能找到节点信息
      const basicNodeDetails: NodeDetails = {
        nodeInfo: newNode,
        savedValues: {},
        originalNodeKind: nodeData.kind,
        parameters: null, // 标记为未加载
        createdAt: Date.now()
      };

      // 立即设置基本节点详情
      updateNodeDetails(nodeId, basicNodeDetails);

      onNodesChange([{
        type: 'add',
        item: newNode
      }]);
      
      // 异步获取节点的完整定义（包括 parameters）
      const fetchAndUpdateNodeDetails = async (retryCount = 0) => {
        const maxRetries = 3;

        try {
          const response = await nodeApiService.fetchNodeDetails(nodeData.kind);
          if (response.success) {
            const updatedNodeDetails: NodeDetails = {
              ...basicNodeDetails,
              nodeInfo: {
                ...newNode,
                data: {
                  ...newNode.data,
                  parameters: response.node?.fields || response.node?.parameters || []
                }
              },
              parameters: response.node?.fields || response.node?.parameters || []
            };
            updateNodeDetails(nodeId, updatedNodeDetails);
          } else {
            if (response.error) {
              console.error('❌ [handleDrop] 获取节点定义失败:', response.error);
              return;
            }

            // 其他错误尝试重试
            if (retryCount < maxRetries) {
              setTimeout(() => fetchAndUpdateNodeDetails(retryCount + 1), 1000);
            }
          }
        } catch (error) {
          // 网络错误尝试重试
          if (retryCount < maxRetries) {
            setTimeout(() => fetchAndUpdateNodeDetails(retryCount + 1), 1000);
          } else {
            console.error('❌ [handleDrop] Max retries reached, giving up');
          }
        }
      };

      // 立即执行异步获取
      fetchAndUpdateNodeDetails();

      logger.info('添加新节点', {
        nodeId,
        kind: nodeData.kind,
        position
      });

      // 通知画布状态变化
      const newNodes = [...nodes, newNode];
      notifyCanvasStateChange(newNodes, edges);

      return newNode;
    }, '添加节点失败');

    if (result.success && result.data) {
      showSuccess('成功', '节点已添加到画布');
    } else if (result.success && !result.data) {
      // agent-system 节点的情况，不显示成功消息
    }
    return result;
  }, [
    nodes,
    edges,
    deletedNodeHistory,
    onNodesChange,
    updateNodeDetails,
    notifyCanvasStateChange,
    generateUniqueNodeId,
    showError,
    showSuccess
  ]);

  /**
   * 复制选中的节点
   */
  const handleCopyNodes = useCallback((selectedNodes: Node[]) => {
    if (selectedNodes.length === 0) {
      showWarning('提示', '请先选择要复制的节点');
      return;
    }

    const result = handleSyncOperation(() => {
      // 获取相关的边
      const selectedNodeIds = selectedNodes.map(n => n.id);
      const relatedEdges = edges.filter(edge =>
        selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
      );

      setCopyPasteState({
        copiedNodes: selectedNodes,
        copiedEdges: relatedEdges,
        pasteOffset: PASTE_OFFSET
      });

      return { nodes: selectedNodes, edges: relatedEdges };
    }, '复制节点失败');

    if (result.success) {
      showSuccess('成功', `已复制 ${selectedNodes.length} 个节点`);
    } else {
      showError('复制失败', result.error);
    }

    return result;
  }, [edges, showError, showSuccess, showWarning]);

  /**
   * 粘贴复制的节点
   */
  const handlePasteNodes = useCallback(() => {
    if (copyPasteState.copiedNodes.length === 0) {
      // console.warn('⚠️ [handlePasteNodes] 没有可粘贴的节点，copyPasteState:', copyPasteState);
      showWarning('提示', '没有可粘贴的节点');
      return;
    }

    const result = handleSyncOperation(() => {
      const { copiedNodes, copiedEdges, pasteOffset } = copyPasteState;
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const nodeIdMapping: Record<string, string> = {};
      const usedNewIds: string[] = []; // 记录已使用的新ID

      // 创建新节点
      copiedNodes.forEach((originalNode, index) => {
        // 获取原节点的详情以确定节点类型
        const originalDetails = nodesDetailsMap[originalNode.id];
        const nodeKind = originalDetails?.originalNodeKind || originalDetails?.nodeInfo?.data?.kind;

        // 获取基础名称，去除数字后缀
        let baseName = originalNode.data?.name || originalNode.id;
        const baseNameMatch = baseName.match(/^(.+?)(\d+)$/);
        if (baseNameMatch) {
          baseName = baseNameMatch[1];
        }

        // 使用generateUniqueNodeId生成新的节点ID
        const newNodeId = generateUniqueNodeId(baseName, usedNewIds, nodeKind);
        usedNewIds.push(newNodeId); // 将新ID加入已使用列表
        nodeIdMapping[originalNode.id] = newNodeId;

        // 创建新节点
        const newNode: Node = {
          ...originalNode,
          id: newNodeId,
          position: {
            x: originalNode.position.x + pasteOffset.x,
            y: originalNode.position.y + pasteOffset.y
          },
          selected: false,
          data: {
            ...originalNode.data,
            name: newNodeId,
          },
        };

        newNodes.push(newNode);

        // 创建节点详情
        if (originalDetails) {
          const newDetails: NodeDetails = {
            ...originalDetails,
            nodeInfo: newNode
          };
          updateNodeDetails(newNodeId, newDetails);
        }
      });

      // 创建新边
      copiedEdges.forEach(originalEdge => {
        const newSourceId = nodeIdMapping[originalEdge.source];
        const newTargetId = nodeIdMapping[originalEdge.target];

        if (newSourceId && newTargetId) {
          const newEdge: Edge = {
            ...originalEdge,
            id: `${newSourceId}-${newTargetId}`,
            source: newSourceId,
            target: newTargetId
          };
          newEdges.push(newEdge);
        }
      });

      // 添加到画布
      const nodeChanges: NodeChange[] = newNodes.map(node => ({
        type: 'add',
        item: node
      }));

      const edgeChanges: EdgeChange[] = newEdges.map(edge => ({
        type: 'add',
        item: edge
      }));

      onNodesChange(nodeChanges);
      onEdgesChange(edgeChanges);

      // 更新粘贴偏移量
      setCopyPasteState(prev => ({
        ...prev,
        pasteOffset: {
          x: prev.pasteOffset.x + PASTE_OFFSET.x,
          y: prev.pasteOffset.y + PASTE_OFFSET.y
        }
      }));

      logger.info('粘贴节点', {
        nodeCount: newNodes.length,
        edgeCount: newEdges.length
      });

      // 通知画布状态变化
      const allNodes = [...nodes, ...newNodes];
      const allEdges = [...edges, ...newEdges];
      notifyCanvasStateChange(allNodes, allEdges);

      return { nodes: newNodes, edges: newEdges };
    }, '粘贴节点失败');

    if (result.success) {
      showSuccess('成功', `已粘贴 ${result.data.nodes.length} 个节点`);
    } else {
      showError('粘贴失败', result.error);
    }

    return result;
  }, [
    copyPasteState,
    nodes,
    edges,
    deletedNodeHistory,
    nodesDetailsMap,
    onNodesChange,
    onEdgesChange,
    updateNodeDetails,
    notifyCanvasStateChange,
    generateUniqueNodeId,
    showError,
    showSuccess,
    showWarning
  ]);

  /**
   * 删除节点
   */
  const handleDeleteNode = useCallback((nodeId: string) => {
    const result = handleSyncOperation(() => {
      // 移除相关的边
      const filteredEdges = removeEdgesForNode(nodeId, edges);
      const removedEdges = edges.filter(edge =>
        edge.source === nodeId || edge.target === nodeId
      );

      // 删除节点
      onNodesChange([{
        type: 'remove',
        id: nodeId
      }]);

      // 删除相关边
      if (removedEdges.length > 0) {
        const edgeChanges: EdgeChange[] = removedEdges.map(edge => ({
          type: 'remove',
          id: edge.id
        }));
        onEdgesChange(edgeChanges);
      }

      // 完全删除节点详情
      deleteNodeCompletely(nodeId);

      // 注意：删除历史记录现在由外部管理

      logger.info('删除节点', {
        nodeId,
        removedEdgesCount: removedEdges.length
      });

      // 通知画布状态变化
      const remainingNodes = nodes.filter(n => n.id !== nodeId);
      notifyCanvasStateChange(remainingNodes, filteredEdges);

      return { nodeId, removedEdgesCount: removedEdges.length };
    }, '删除节点失败');

    if (result.success) {
      showSuccess('成功', '节点已删除');
    } else {
      showError('删除失败', result.error);
    }

    return result;
  }, [
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    deleteNodeCompletely,
    notifyCanvasStateChange,
    showError,
    showSuccess
  ]);

  /**
   * 批量删除节点
   */
  const handleDeleteNodes = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;

    const result = handleSyncOperation(() => {
      let totalRemovedEdges = 0;

      nodeIds.forEach(nodeId => {
        // 移除相关的边
        const removedEdges = edges.filter(edge =>
          edge.source === nodeId || edge.target === nodeId
        );
        totalRemovedEdges += removedEdges.length;

        // 完全删除节点详情
        deleteNodeCompletely(nodeId);

        // 注意：删除历史记录现在由外部管理
      });

      // 批量删除节点
      const nodeChanges: NodeChange[] = nodeIds.map(nodeId => ({
        type: 'remove',
        id: nodeId
      }));

      // 批量删除边
      const edgeChanges: EdgeChange[] = edges
        .filter(edge => nodeIds.includes(edge.source) || nodeIds.includes(edge.target))
        .map(edge => ({
          type: 'remove',
          id: edge.id
        }));

      onNodesChange(nodeChanges);
      if (edgeChanges.length > 0) {
        onEdgesChange(edgeChanges);
      }

      // 通知画布状态变化
      const remainingNodes = nodes.filter(n => !nodeIds.includes(n.id));
      const remainingEdges = edges.filter(edge =>
        !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      );
      notifyCanvasStateChange(remainingNodes, remainingEdges);

      return { nodeCount: nodeIds.length, edgeCount: totalRemovedEdges };
    }, '批量删除节点失败');

    if (result.success) {
      showSuccess('成功', `已删除 ${nodeIds.length} 个节点`);
    } else {
      showError('删除失败', result.error);
    }

    return result;
  }, [
    edges,
    nodes,
    onNodesChange,
    onEdgesChange,
    deleteNodeCompletely,
    notifyCanvasStateChange,
    showError,
    showSuccess
  ]);

  /**
   * 清空画布
   */
  const handleClearCanvas = useCallback(() => {
    const result = handleSyncOperation(() => {
      const nodeCount = nodes.length;
      const edgeCount = edges.length;

      // 删除所有节点详情
      nodes.forEach(node => {
        deleteNodeCompletely(node.id);
        // 注意：删除历史记录现在由外部管理
      });

      // 清空画布
      onNodesChange(nodes.map(node => ({ type: 'remove', id: node.id })));
      onEdgesChange(edges.map(edge => ({ type: 'remove', id: edge.id })));

      logger.info('清空画布', { nodeCount, edgeCount });

      // 通知画布状态变化
      notifyCanvasStateChange([], []);

      return { nodeCount, edgeCount };
    }, '清空画布失败');

    if (result.success) {
      showSuccess('成功', '画布已清空');
    } else {
      showError('清空失败', result.error);
    }

    return result;
  }, [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    deleteNodeCompletely,
    notifyCanvasStateChange,
    showError,
    showSuccess
  ]);

  /**
   * 获取当前画布状态
   */
  const getCurrentCanvasState = useCallback((): CanvasState => {
    return { nodes, edges };
  }, [nodes, edges]);

  /**
   * 检查是否有选中的元素
   */
  const hasSelection = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    return selectedNodes.length > 0 || selectedEdges.length > 0;
  }, [nodes, edges]);

  /**
   * 从剪贴板导入工作流数据
   */
  const handleImportFromClipboard = useCallback(async (clipboardData: string) => {
    const result = await handleAsyncOperation(async () => {
      const workflowData = JSON.parse(clipboardData);

      // 验证数据格式
      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('无效的工作流数据格式');
      }

      // 清空当前画布（可选，根据需求调整）
      const shouldClearCanvas = confirm('是否清空当前画布并导入新的工作流？\n点击"取消"将在当前画布上追加导入。');

      if (shouldClearCanvas) {
        // 清空现有数据
        nodes.forEach(node => {
          deleteNodeCompletely(node.id);
        });
        onNodesChange(nodes.map(node => ({ type: 'remove', id: node.id })));
        onEdgesChange(edges.map(edge => ({ type: 'remove', id: edge.id })));
      }

      // 创建ID映射，避免冲突
      const oldToNewIdMap: Record<string, string> = {};
      const usedNewIds: string[] = shouldClearCanvas ? [] : nodes.map((n: any) => n.id);

      // 首先处理节点
      const newNodes: Node[] = [];

      for (const nodeData of workflowData.nodes) {
        // 生成新的唯一ID
        let baseName = nodeData.data?.name || nodeData.id;
        const baseNameMatch = baseName.match(/^(.+?)(\d+)$/);
        if (baseNameMatch) {
          baseName = baseNameMatch[1];
        }

        const newId = generateUniqueNodeId(baseName, usedNewIds, nodeData.kind);
        usedNewIds.push(newId);
        oldToNewIdMap[nodeData.id] = newId;

        // 创建新节点
        const newNode: Node = {
          id: newId,
          type: nodeData.type || 'triggerNode',
          position: nodeData.position || { x: 100, y: 100 },
          data: {
            ...nodeData.data,
            name: newId
          }
        };

        newNodes.push(newNode);

        // 创建节点详情
        const nodeDetails = {
          parameters: null,
          originalNodeKind: nodeData.kind,
          nodeInfo: newNode,
          savedValues: nodeData.inputs || {},
          createdAt: Date.now()
        };

        updateNodeDetails(newId, nodeDetails);
      }

      // 然后处理边
      const newEdges: Edge[] = [];

      if (workflowData.edges && Array.isArray(workflowData.edges)) {
        for (const edgeData of workflowData.edges) {
          const newSourceId = oldToNewIdMap[edgeData.source];
          const newTargetId = oldToNewIdMap[edgeData.target];

          if (newSourceId && newTargetId) {
            const newEdge: Edge = {
              id: `${newSourceId}-${newTargetId}`,
              source: newSourceId,
              target: newTargetId,
              sourceHandle: edgeData.sourceHandle || '',
              targetHandle: edgeData.targetHandle || '',
              label: edgeData.label || ''
            };

            newEdges.push(newEdge);
          }
        }
      }

      // 更新画布状态
      if (setNodes && setEdges) {
        if (shouldClearCanvas) {
          setNodes(newNodes);
          setEdges(newEdges);
        } else {
          setNodes([...nodes, ...newNodes]);
          setEdges([...edges, ...newEdges]);
        }
      } else {
        // 如果没有提供 setNodes/setEdges，则通过变更事件更新
        if (shouldClearCanvas) {
          // 先清空
          onNodesChange(nodes.map(node => ({ type: 'remove', id: node.id })));
          onEdgesChange(edges.map(edge => ({ type: 'remove', id: edge.id })));
          // 再添加新的
          setTimeout(() => {
            onNodesChange(newNodes.map(node => ({ type: 'add', item: node })));
            onEdgesChange(newEdges.map(edge => ({ type: 'add', item: edge })));
          }, 100);
        } else {
          // 直接添加新节点和边
          onNodesChange(newNodes.map(node => ({ type: 'add', item: node })));
          onEdgesChange(newEdges.map(edge => ({ type: 'add', item: edge })));
        }
      }

      // 通知画布状态变化
      const finalNodes = shouldClearCanvas ? newNodes : [...nodes, ...newNodes];
      const finalEdges = shouldClearCanvas ? newEdges : [...edges, ...newEdges];
      notifyCanvasStateChange(finalNodes, finalEdges);

      return {
        importedNodes: newNodes.length,
        importedEdges: newEdges.length,
        workflowName: workflowData.metadata?.workflowName || '未命名工作流'
      };
    }, '导入工作流失败');

    if (result.success) {
      showWarning('成功', `成功导入工作流：${result.data.workflowName}`);
    } else {
      showError('导入失败', result.error);
    }

    return result;
  }, [
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    deleteNodeCompletely,
    updateNodeDetails,
    generateUniqueNodeId,
    notifyCanvasStateChange,
    showError,
    showWarning
  ]);

  return {
    // 状态
    copyPasteState,
    deletedNodeHistory,

    // 画布操作
    handleConnect,
    handleDrop,
    handleCopyNodes,
    handlePasteNodes,
    handleDeleteNode,
    handleDeleteNodes,
    handleClearCanvas,
    handleImportFromClipboard,

    // 工具函数
    getCurrentCanvasState,
    hasSelection,
    setCanvasStateChangeCallback,
    notifyCanvasStateChange,
    generateUniqueNodeId
  };
};