/**
 * 节点测试相关的自定义hooks
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { Edge } from 'reactflow';
import { NodeDetails, NodeTestResult } from '../types/node';
import { getAllPreviousNodeIds, getAllNextNodeIds, extractTemplateVariables, canNodeExecute, filterNodeSavedValues } from '../utils/nodeProcessing';
import { handleAsyncOperation, logger } from '../utils/errorHandling';
import { debugNode } from '@/services/nodeDebugService';
import { testWorkflow, stopWorkflow } from '@/services/workflowTestService';
import {
  NODE_ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WORKFLOW_ERROR_MESSAGES
} from '../utils/constants';

interface UseNodeTestingProps {
  workflowId: string;
  nodesDetailsMap: Record<string, NodeDetails>;
  nodesTestResultsMap: Record<string, NodeTestResult>;
  edgesState: Edge[];
  updateNodeTestResult: (nodeId: string, result: NodeTestResult) => void;
  updateNodeDetails: (nodeId: string, details: Partial<NodeDetails>) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

export const useNodeTesting = ({
  workflowId,
  nodesDetailsMap,
  nodesTestResultsMap,
  edgesState,
  updateNodeTestResult,
  updateNodeDetails,
  showError,
  showSuccess,
  showWarning
}: UseNodeTestingProps) => {
  // 移除不必要的 Hook 调用日志

  // 使用 ref 保存最新的 edgesState，避免闭包问题
  const edgesStateRef = useRef(edgesState);
  edgesStateRef.current = edgesState;

  // 移除不必要的边状态监听日志
  const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
  const [testingNodes, setTestingNodes] = useState<Set<string>>(new Set());
  // 存储节点测试的eventId，用于停止测试
  const [nodeTestEventIds, setNodeTestEventIds] = useState<Record<string, string>>({});
  // 工作流日志数据
  const [workflowLogData, setWorkflowLogData] = useState<any>(null);
  // 工作流测试的eventId
  const [workflowTestEventId, setWorkflowTestEventId] = useState<string | null>(null);

  /**
   * 过滤节点输入参数，移除系统属性
   */
  const filterNodeInputs = useCallback((savedValues: Record<string, any>) => {
    const filteredInputs = filterNodeSavedValues(savedValues);

    // 移除额外的系统属性
    delete filteredInputs.catalog;
    delete filteredInputs.category;
    delete filteredInputs.nodeWidth;
    delete filteredInputs.parameters;
    delete filteredInputs.type;

    return filteredInputs;
  }, []);

  /**
   * 从触发器开始构建可达节点图
   */
  const buildReachableNodesFromTrigger = useCallback((
    triggerNodeId: string,
    edges: Edge[],
    nodesDetailsMap: Record<string, NodeDetails>
  ): string[] => {
    console.log('🚀 [buildReachableNodesFromTrigger] 开始构建可达节点图:', {
      triggerNodeId,
      totalEdges: edges.length,
      totalNodes: Object.keys(nodesDetailsMap).length,
      allEdges: edges.map(e => `${e.source} -> ${e.target}`),
      allNodeIds: Object.keys(nodesDetailsMap)
    });

    const reachableNodes = new Set<string>();
    const visited = new Set<string>();

    // 深度优先搜索，从触发器开始遍历所有可达节点
    const dfs = (nodeId: string, depth = 0) => {
      const indent = '  '.repeat(depth);
      console.log(`${indent}🔍 [DFS] 访问节点: ${nodeId}`);

      if (visited.has(nodeId)) {
        console.log(`${indent}⚠️ [DFS] 节点已访问，跳过: ${nodeId}`);
        return;
      }

      visited.add(nodeId);
      reachableNodes.add(nodeId);
      console.log(`${indent}✅ [DFS] 添加可达节点: ${nodeId}`);

      // 查找从当前节点出发的所有边
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);

      console.log(`${indent}🔗 [DFS] 从 ${nodeId} 出发的边:`, {
        count: outgoingEdges.length,
        edges: outgoingEdges.map(e => `${e.source} -> ${e.target}`)
      });

      // 递归遍历所有目标节点
      outgoingEdges.forEach(edge => {
        const targetExists = !!nodesDetailsMap[edge.target];
        console.log(`${indent}🎯 [DFS] 检查目标节点 ${edge.target}: 存在=${targetExists}`);

        // 确保目标节点在nodesDetailsMap中存在
        if (targetExists) {
          dfs(edge.target, depth + 1);
        } else {
          console.log(`${indent}❌ [DFS] 目标节点不存在于nodesDetailsMap: ${edge.target}`);
        }
      });
    };

    // 检查触发器节点是否存在
    if (!nodesDetailsMap[triggerNodeId]) {
      console.error('❌ [buildReachableNodesFromTrigger] 触发器节点不存在于nodesDetailsMap:', {
        triggerNodeId,
        availableNodes: Object.keys(nodesDetailsMap)
      });
      return [];
    }

    // 从触发器开始遍历
    console.log('🎬 [buildReachableNodesFromTrigger] 开始DFS遍历，起点:', triggerNodeId);
    dfs(triggerNodeId);

    const result = Array.from(reachableNodes);

    console.log('🏁 [buildReachableNodesFromTrigger] 构建完成:', {
      triggerNodeId,
      totalReachableNodes: result.length,
      reachableNodeIds: result,
      totalEdges: edges.length,
      visitedNodes: Array.from(visited)
    });

    logger.info('从触发器构建可达节点图完成', {
      triggerNodeId,
      totalReachableNodes: result.length,
      reachableNodeIds: result,
      totalEdges: edges.length
    });

    return result;
  }, []);


  // 使用ref来获取最新的测试结果映射，避免闭包问题
  const nodesTestResultsMapRef = useRef(nodesTestResultsMap);
  nodesTestResultsMapRef.current = nodesTestResultsMap;

  const getLatestNodesTestResultsMap = useCallback(() => {
    return nodesTestResultsMapRef.current;
  }, []);

  /**
   * 重新构建edges，跳过被排除的节点
   * 当某些节点因为有state值而被排除时，需要重新连接edges
   */
  const rebuildEdgesSkippingNodes = useCallback((
    originalEdges: Edge[],
    executingNodeIds: string[],
    skippedNodeIds: string[]
  ) => {
    const rebuiltEdges: Array<{
      from: string;
      to: string;
      sourceHandle?: string;
      targetHandle?: string;
      label?: string;
    }> = [];

    // 为每个执行节点找到它应该连接到的下一个执行节点
    executingNodeIds.forEach(sourceNodeId => {
      const targetNodes = findNextExecutingNodes(sourceNodeId, originalEdges, executingNodeIds, skippedNodeIds);

      targetNodes.forEach(({ nodeId: targetNodeId, originalEdge }) => {
        const temp: {
          from: string;
          to: string;
          sourceHandle?: string;
          targetHandle?: string;
          label?: string;
        } = {
          from: sourceNodeId,
          to: targetNodeId
        };

        // 保留原始edge的属性（如果有的话）
        if (originalEdge) {
          if (originalEdge.sourceHandle) {
            temp.sourceHandle = originalEdge.sourceHandle;
          }
          if (originalEdge.targetHandle) {
            temp.targetHandle = originalEdge.targetHandle;
          }
          if (originalEdge.label && String(originalEdge.label).trim() !== '') {
            temp.label = String(originalEdge.label);
          }
        }

        rebuiltEdges.push(temp);
      });
    });

    return rebuiltEdges;
  }, []);

  /**
   * 找到从指定节点开始的下一个执行节点
   * 跳过被排除的节点，直到找到执行节点
   */
  const findNextExecutingNodes = useCallback((
    startNodeId: string,
    originalEdges: Edge[],
    executingNodeIds: string[],
    skippedNodeIds: string[],
    visited: Set<string> = new Set()
  ): Array<{ nodeId: string; originalEdge?: Edge }> => {
    if (visited.has(startNodeId)) {
      return []; // 防止循环
    }
    visited.add(startNodeId);

    const directTargets = originalEdges.filter(edge => edge.source === startNodeId);
    const results: Array<{ nodeId: string; originalEdge?: Edge }> = [];

    for (const edge of directTargets) {
      const targetNodeId = edge.target;

      if (executingNodeIds.includes(targetNodeId)) {
        // 找到了执行节点，直接连接
        results.push({ nodeId: targetNodeId, originalEdge: edge });
      } else if (skippedNodeIds.includes(targetNodeId)) {
        // 这是被跳过的节点，继续寻找它的下一个节点
        const nextNodes = findNextExecutingNodes(
          targetNodeId,
          originalEdges,
          executingNodeIds,
          skippedNodeIds,
          new Set(visited)
        );
        results.push(...nextNodes);
      }
    }

    return results;
  }, []);


  /**
   * 公共的执行逻辑 - 用于节点测试和工作流测试
   */
  const executeTestWithPolling = useCallback(async (
    actions: any[],
    edges: any[],
    state?: Record<string, any>,
    progressCallback?: (data: any) => void,
    testType: string = '测试'
  ) => {
    // 构建调试请求
    const debugRequest: any = {
      actions,
      edges
    };

    if (state && Object.keys(state).length > 0) {
      debugRequest.state = state;
    }

    logger.debug(`执行${testType}请求`, {
      actionsCount: actions.length,
      edgesCount: edges.length,
      hasState: !!state,
      stateKeys: state ? Object.keys(state) : []
    });

    // 调用debugNode获取eventId
    const { debugNode } = await import('@/services/nodeDebugService');
    const initialResult = await debugNode(debugRequest, false);

    if (!initialResult.eventId) {
      throw new Error('未获得执行事件ID');
    }

    logger.info(`获得${testType}eventId`, { eventId: initialResult.eventId });

    // 保存eventId用于停止测试
    if (testType === '节点测试') {
      // 这里需要传入nodeId，但当前函数签名不支持，暂时跳过
      // 可以在调用方处理eventId的保存
    } else if (testType === '工作流测试') {
      // 保存工作流测试的eventId
      setWorkflowTestEventId(initialResult.eventId);
    }

    // 使用pollWorkflowLog轮询获取结果
    const { pollWorkflowLog } = await import('@/services/workflowTestService');
    const executionResult = await pollWorkflowLog(
      initialResult.eventId,
      (data) => {
        // 更新工作流日志数据
        setWorkflowLogData(data);
        // 调用原始的进度回调
        progressCallback?.(data);
      },
      2000, // 轮询间隔2秒
      60    // 最多轮询60次（2分钟）
    );

    // 🔍 DEBUG: 添加详细日志用于调试
    console.log('🔍 [executeTestWithPolling] 轮询执行结果:', {
      success: executionResult.success,
      status: executionResult.status,
      error: executionResult.error,
      testType,
      eventId: initialResult.eventId,
      fullResult: executionResult
    });
    logger.info('轮询执行结果详情', {
      success: executionResult.success,
      status: executionResult.status,
      error: executionResult.error,
      testType,
      eventId: initialResult.eventId
    });

    if (!executionResult.success) {
      // 如果是取消状态，不抛出错误
      if (executionResult.status === 'cancelled') {
        console.log('🛑 [executeTestWithPolling] 轮询已被用户取消');
        return { ...executionResult, eventId: initialResult.eventId };
      }
      throw new Error(executionResult.error || '执行失败');
    }

    console.log('✅ [executeTestWithPolling] 轮询执行成功');
    return { ...executionResult, eventId: initialResult.eventId };
  }, []);

  /**
   * 停止节点测试
   */
  const handleStopNodeTest = useCallback(async (nodeInstanceId: string) => {
    // 使用函数式更新来获取最新的 eventId
    let eventId: string | null = null;
    setNodeTestEventIds(prev => {
      eventId = prev[nodeInstanceId] || null;
      console.log('🔍 [useNodeTesting] 从最新状态获取eventId:', {
        nodeInstanceId,
        eventId,
        allEventIds: prev
      });
      return prev; // 不修改状态，只是获取最新值
    });

    if (!eventId) {
      console.error('❌ [useNodeTesting] 未找到eventId:', {
        nodeInstanceId,
        nodeTestEventIds,
        allKeys: Object.keys(nodeTestEventIds)
      });
      showWarning('无法停止', '未找到该节点的测试事件ID');
      return;
    }

    const result = await handleAsyncOperation(async () => {
      logger.info('停止节点测试', { nodeInstanceId, eventId });

      const { stopWorkflow, clearWorkflowLogCache } = await import('@/services/workflowTestService');
      const stopResult = await stopWorkflow(eventId!);

      // 清理该eventId的所有缓存，避免残留请求
      clearWorkflowLogCache(eventId!);

      if (!stopResult.success) {
        throw new Error(stopResult.error || '停止测试失败');
      }

      logger.info('节点测试已停止', { nodeInstanceId, eventId });
      return stopResult;
    }, `停止节点 ${nodeInstanceId} 测试失败`);

    // 清理测试状态和eventId
    setTestingNodes(prev => {
      const newSet = new Set(prev);
      newSet.delete(nodeInstanceId);
      return newSet;
    });

    setNodeTestEventIds(prev => {
      const newEventIds = { ...prev };
      delete newEventIds[nodeInstanceId];
      return newEventIds;
    });

    if (result.success) {
      showSuccess('成功', '节点测试已停止');
    } else {
      showError('停止失败', result.error);
    }

    return result;
  }, [nodeTestEventIds, showError, showSuccess, showWarning]);

  /**
   * 测试单个节点 important
   */
  const handleNodeTest = useCallback(async (
    nodeValues: Record<string, any>,
    nodeInstanceId: string
  ) => {
    if (testingNodes.has(nodeInstanceId)) {
      showWarning('测试进行中', '该节点正在测试中，请稍候');
      return;
    }

    console.log('🚀 [useNodeTesting] Adding node to testingNodes:', nodeInstanceId);
    setTestingNodes(prev => {
      const newSet = new Set(prev).add(nodeInstanceId);
      console.log('🚀 [useNodeTesting] testingNodes updated (start):', {
        nodeInstanceId,
        newSetSize: newSet.size,
        newSetArray: Array.from(newSet)
      });
      return newSet;
    });

    const result = await handleAsyncOperation(async () => {
      logger.info('开始节点测试', { nodeInstanceId, nodeValues: Object.keys(nodeValues) });

      // 获取节点详情
      const nodeDetails = nodesDetailsMap[nodeInstanceId];
      if (!nodeDetails || !nodeDetails.nodeInfo) {
        throw new Error(`${NODE_ERROR_MESSAGES.NODE_NOT_FOUND}: ${nodeInstanceId}`);
      }

      const node = nodeDetails.nodeInfo;
      const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

      // 获取前置节点列表（采用宽松策略，不进行严格的执行条件检查）
      const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);

      // 提取当前节点参数中引用的其他节点
      const referencedNodeIds = extractTemplateVariables(nodeValues);
      const hasTemplateVariables = referencedNodeIds.length > 0;

      logger.debug('模板变量提取结果', {
        nodeInstanceId,
        referencedNodeIds,
        hasTemplateVariables
      });

      // 如果有模板变量，检查被引用节点的测试结果是否存在
      if (hasTemplateVariables) {
        const latestResults = getLatestNodesTestResultsMap();

        for (const referencedNodeId of referencedNodeIds) {
          if (!latestResults[referencedNodeId]) {
            const errorMessage = `请先测试 ${referencedNodeId} 节点，该节点输出未知`;
            logger.warn(errorMessage, { nodeInstanceId, referencedNodeId });
            showWarning('依赖节点未测试', errorMessage);
            throw new Error(errorMessage);
          }
        }
      }

      // 构造调试请求
      const actions = [];

      // 根据是否有模板变量决定添加逻辑
      if (hasTemplateVariables) {
        // 如果有模板变量，只添加未被引用的前置节点
        previousNodeIds.forEach(prevNodeId => {
          // 如果该前置节点被当前节点引用，则跳过
          if (referencedNodeIds.includes(prevNodeId)) {
            logger.debug(`跳过被引用的前置节点: ${prevNodeId}`);
            return;
          }

          const prevNodeDetails = nodesDetailsMap[prevNodeId];
          if (prevNodeDetails && prevNodeDetails.nodeInfo) {
            const prevNode = prevNodeDetails.nodeInfo;
            const prevAgentResources = prevNodeDetails.agentResources || {};
            const prevNodeKind = prevNodeDetails.originalNodeKind || prevNode.data.kind;
            const isPrevAINode = prevNodeKind === 'agent-custom' || prevNodeKind === 'agent-system' ||
              prevNode.data.category === 'AI' || prevNode.type === 'agentNode';

            const prevInputs: any = {
              ...(prevNodeDetails.savedValues || {}),
              id: prevNodeId
            };

            // 只为AI类型的节点添加agentResources
            if (isPrevAINode) {
              prevInputs.agentResources = prevAgentResources;
            }

            actions.push({
              id: prevNodeId,
              inputs: prevInputs,
              kind: prevNodeKind,
              nodeName: prevNode.data.name || prevNodeId,
              type: prevNode.type || 'triggerNode'
            });
          }
        });
      } else {
        // 如果没有模板变量，添加所有前置节点（保持现状）
        previousNodeIds.forEach(prevNodeId => {
          const prevNodeDetails = nodesDetailsMap[prevNodeId];
          if (prevNodeDetails && prevNodeDetails.nodeInfo) {
            const prevNode = prevNodeDetails.nodeInfo;
            const prevAgentResources = prevNodeDetails.agentResources || {};
            const prevNodeKind = prevNodeDetails.originalNodeKind || prevNode.data.kind;
            const isPrevAINode = prevNodeKind === 'agent-custom' || prevNodeKind === 'agent-system' ||
              prevNode.data.category === 'AI' || prevNode.type === 'agentNode';

            const prevInputs: any = {
              ...(prevNodeDetails.savedValues || {}),
              id: prevNodeId
            };

            // 只为AI类型的节点添加agentResources
            if (isPrevAINode) {
              prevInputs.agentResources = prevAgentResources;
            }

            actions.push({
              id: prevNodeId,
              inputs: prevInputs,
              kind: prevNodeKind,
              nodeName: prevNode.data.name || prevNodeId,
              type: prevNode.type || 'triggerNode'
            });
          }
        });
      }

      // 添加当前测试节点
      // 获取节点的agentResources
      const currentNodeDetails = nodesDetailsMap[nodeInstanceId];
      const agentResources = currentNodeDetails?.agentResources || {};
      const isCurrentAINode = nodeKind === 'agent-custom' || nodeKind === 'agent-system' ||
        node.data.category === 'AI' || node.type === 'agentNode';

      const currentInputs: any = {
        ...nodeValues,
        id: nodeInstanceId
      };

      // 只为AI类型的节点添加agentResources
      if (isCurrentAINode) {
        currentInputs.agentResources = agentResources;
      }

      actions.push({
        id: nodeInstanceId,
        inputs: currentInputs,
        kind: nodeKind,
        nodeName: node.data.name || nodeInstanceId,
        type: node.type || 'triggerNode'
      });

      // 构建edges - 必须与 actions 保持一致
      const edges: Array<{
        from: string;
        to: string;
        sourceHandle?: string;
        targetHandle?: string;
        label?: string;
      }> = [];

      // 获取实际参与执行的节点ID（即 actions 中的节点）
      const executingNodeIds = actions.map(a => a.id);
      const allExecutingNodeIds = [...executingNodeIds, nodeInstanceId];

      if (hasTemplateVariables) {
        // 🎯 有模板变量时：只包含未被引用的节点的连接关系
        // 被引用的节点不在 actions 中，也不在 edges 中保持连接关系

        // 1. 找到真正的入口节点（在原始图中没有前驱的节点）
        const entryNodes = allExecutingNodeIds.filter(nodeId => {
          // 检查在原始图中是否有任何节点指向这个节点
          const hasIncomingEdge = edgesState.some(edge => edge.target === nodeId);
          return !hasIncomingEdge;
        });

        // 去重入口节点，防止重复
        const uniqueEntryNodes = [...new Set(entryNodes)];

        console.log('🔍 [useNodeTesting] 模板变量场景入口节点分析:', {
          allExecutingNodeIds,
          entryNodes,
          uniqueEntryNodes,
          edgesState: edgesState.map(e => `${e.source} -> ${e.target}`)
        });

        // 2. 从 $source 连接到所有入口节点
        uniqueEntryNodes.forEach(entryNodeId => {
          edges.push({
            from: "$source",
            to: entryNodeId
          });
        });

        // 3. 重新构建edges，跳过被引用的节点
        const rebuiltEdges = rebuildEdgesSkippingNodes(edgesState, allExecutingNodeIds, referencedNodeIds);
        edges.push(...rebuiltEdges);
      } else {
        // 🎯 无模板变量时：使用完整的有向无环图逻辑
        const allNodeIds = [...previousNodeIds, nodeInstanceId];

        // 1. 找到所有入口节点（没有前驱节点的节点）
        const entryNodes = allNodeIds.filter(nodeId =>
          !edgesState.some(edge => edge.target === nodeId && allNodeIds.includes(edge.source))
        );

        // 去重入口节点，防止重复
        const uniqueEntryNodes = [...new Set(entryNodes)];

        console.log('🔍 [useNodeTesting] 无模板变量场景入口节点分析:', {
          allNodeIds,
          entryNodes,
          uniqueEntryNodes,
          edgesState: edgesState.map(e => `${e.source} -> ${e.target}`)
        });

        // 2. 从 $source 连接到所有入口节点
        uniqueEntryNodes.forEach(entryNodeId => {
          edges.push({
            from: "$source",
            to: entryNodeId
          });
        });

        // 3. 添加节点之间的所有连接（无模板变量场景，直接连接）
        edgesState.forEach(edge => {
          if (allNodeIds.includes(edge.source) && allNodeIds.includes(edge.target)) {
            const temp: {
              from: string;
              to: string;
              sourceHandle?: string;
              targetHandle?: string;
              label?: string;
            } = {
              from: edge.source,
              to: edge.target
            };

            // 只有当sourceHandle存在且不是默认值时才添加
            if (edge.sourceHandle) {
              temp.sourceHandle = edge.sourceHandle;
            }

            // 只有当targetHandle存在且不是默认值时才添加
            if (edge.targetHandle) {
              temp.targetHandle = edge.targetHandle;
            }

            // 只有当label存在且不为空时才添加
            if (edge.label && String(edge.label).trim() !== '') {
              temp.label = String(edge.label);
            }

            edges.push(temp);
          }
        });

        logger.debug('构建完整有向无环图边连接', {
          nodeInstanceId,
          allNodeIds,
          entryNodes,
          totalEdges: edges.length,
          sourceToEntryEdges: entryNodes.length,
          nodeToNodeEdges: edges.length - entryNodes.length
        });
      }

      // 如果包含模板变量，添加state字段
      let state: Record<string, any> | undefined;
      if (hasTemplateVariables) {
        state = {};
        const latestResults = getLatestNodesTestResultsMap();

        referencedNodeIds.forEach(referencedNodeId => {
          const testResult = latestResults[referencedNodeId];
          if (testResult) {
            // 🎯 保留data结构，去掉success、timestamp等元数据
            state![referencedNodeId] = {
              data: testResult.data
            };
          }
        });

        logger.debug('添加模板变量状态', { referencedNodeIds, state });
      }

      // 🎯 修改执行逻辑，在获得eventId后立即保存
      const debugRequest: any = {
        actions,
        edges
      };

      if (state && Object.keys(state).length > 0) {
        debugRequest.state = state;
      }

      logger.debug('最终调试请求', {
        nodeInstanceId,
        hasTemplateVariables,
        referencedNodeIds,
        actionsCount: actions.length,
        actionIds: actions.map(a => a.id),
        edgesCount: edges.length,
        debugRequest
      });

      logger.debug(`执行节点测试请求`, {
        actionsCount: actions.length,
        edgesCount: edges.length,
        hasState: !!state,
        stateKeys: state ? Object.keys(state) : []
      });

      // 调用debugNode获取eventId
      const { debugNode } = await import('@/services/nodeDebugService');
      const initialResult = await debugNode(debugRequest, false);

      if (!initialResult.eventId) {
        throw new Error('未获得执行事件ID');
      }

      logger.info(`获得节点测试eventId`, { eventId: initialResult.eventId });

      // 🎯 立即保存eventId用于停止测试
      console.log('💾 [useNodeTesting] 立即保存eventId:', {
        nodeInstanceId,
        eventId: initialResult.eventId
      });
      setNodeTestEventIds(prev => ({
        ...prev,
        [nodeInstanceId]: initialResult.eventId!
      }));

      // 使用pollWorkflowLog轮询获取结果
      const { pollWorkflowLog } = await import('@/services/workflowTestService');
      const executionResult = await pollWorkflowLog(
        initialResult.eventId,
        (progressData) => {
          console.log('📊 [useNodeTesting] 节点测试进度更新:', progressData);
        },
        2000, // 轮询间隔2秒
        60    // 最多轮询60次（2分钟）
      );

      if (!executionResult.success) {
        throw new Error(executionResult.error || '执行失败');
      }

      const debugResult = { ...executionResult, eventId: initialResult.eventId };

      // 🎯 处理执行结果
      if (!debugResult) {
        throw new Error('未获得执行结果');
      }

      // 检查是否有错误
      if (debugResult.error) {
        throw new Error(debugResult.error);
      }

      // 检查最终状态（如果存在）
      if (debugResult.success === false) {
        throw new Error(debugResult.error || '工作流执行失败');
      }

      // 从结果中提取节点测试结果
      let nodeTestResult;

      if (debugResult.data && typeof debugResult.data === 'object') {
        // debugResult.data 现在直接是节点输出映射
        const nodeOutputs = debugResult.data;
        console.log('🔍 [useNodeTesting] 可用的节点输出:', Object.keys(nodeOutputs));

        // 尝试多种方式匹配节点ID
        let targetOutput = null;

        // 1. 直接匹配节点ID
        if (nodeOutputs[nodeInstanceId]) {
          targetOutput = nodeOutputs[nodeInstanceId];
          console.log(`✅ [useNodeTesting] 找到节点输出 (直接匹配): ${nodeInstanceId}`);
        }
        // 2. 匹配节点名称
        else if (node?.data?.name) {
          const nodeName = node.data.name;
          if (nodeOutputs[nodeName]) {
            targetOutput = nodeOutputs[nodeName];
            console.log(`✅ [useNodeTesting] 找到节点输出 (名称匹配): ${nodeName}`);
          }
        }
        // 3. 匹配节点类型
        else if (node?.data?.kind) {
          const nodeKind = node.data.kind;
          if (nodeOutputs[nodeKind]) {
            targetOutput = nodeOutputs[nodeKind];
            console.log(`✅ [useNodeTesting] 找到节点输出 (类型匹配): ${nodeKind}`);
          }
        }
        // 4. 如果只有一个输出，直接使用
        else if (Object.keys(nodeOutputs).length === 1) {
          const singleKey = Object.keys(nodeOutputs)[0];
          if (singleKey && nodeOutputs[singleKey]) {
            targetOutput = nodeOutputs[singleKey];
            console.log(`✅ [useNodeTesting] 使用唯一输出: ${singleKey}`);
          }
        }

        if (targetOutput) {
          nodeTestResult = targetOutput;
        } else {
          console.warn('⚠️ [useNodeTesting] 未找到匹配的节点输出，使用完整数据');
          nodeTestResult = debugResult.data;
        }
      }
      else if (debugResult.data) {
        nodeTestResult = debugResult.data;
      } else if (Array.isArray(debugResult) && debugResult.length > 0) {
        // 如果是数组格式，取最后一个结果
        const lastIndex = debugResult.length - 1;
        nodeTestResult = debugResult[lastIndex];
      } else {
        nodeTestResult = debugResult;
      }

      console.log('🎯 [useNodeTesting] 最终节点测试结果:', nodeTestResult);

      // 🎯 修复：存储处理后的节点结果，而不是原始的 debugResult.data
      updateNodeTestResult(nodeInstanceId, {
        success: debugResult.success || true,
        data: nodeTestResult, // 使用处理后的节点结果
        // timestamp: Date.now(),
        // nodeId: nodeInstanceId
      });

      // 获取当前节点详情并保存用户配置的参数
      // 重用之前定义的 currentNodeDetails 变量
      if (currentNodeDetails) {
        // 过滤掉系统属性，只保存用户配置的值
        const filteredSavedValues = { ...nodeValues };

        // 移除系统属性（如果存在）
        delete filteredSavedValues.kind;
        delete filteredSavedValues.name;
        delete filteredSavedValues.description;
        delete filteredSavedValues.icon;
        delete filteredSavedValues.category;
        delete filteredSavedValues.version;
        delete filteredSavedValues.link;
        delete filteredSavedValues.id; // 移除ID字段

        // 更新节点详情，保存用户配置
        const updatedNodeDetails = {
          ...currentNodeDetails,
          savedValues: filteredSavedValues,
          lastSaved: new Date().toISOString() // 添加保存时间戳
        };

        updateNodeDetails(nodeInstanceId, updatedNodeDetails);
        logger.info('节点参数已保存到 nodeDetailsMap', { nodeInstanceId, savedValues: filteredSavedValues });
      }

      logger.info('节点测试成功', { nodeInstanceId, result: debugResult });

      return debugResult;
    }, `节点 ${nodeInstanceId} 测试失败`);

    // 清理测试状态和eventId
    console.log('🧹 [useNodeTesting] Cleaning up test state for node:', nodeInstanceId);
    setTestingNodes(prev => {
      const newSet = new Set(prev);
      const wasInSet = newSet.has(nodeInstanceId);
      newSet.delete(nodeInstanceId);
      console.log('🧹 [useNodeTesting] testingNodes updated:', {
        nodeInstanceId,
        wasInSet,
        newSetSize: newSet.size,
        newSetArray: Array.from(newSet)
      });
      return newSet;
    });

    setNodeTestEventIds(prev => {
      const newEventIds = { ...prev };
      const hadEventId = !!newEventIds[nodeInstanceId];
      delete newEventIds[nodeInstanceId];
      console.log('🧹 [useNodeTesting] nodeTestEventIds updated:', {
        nodeInstanceId,
        hadEventId,
        remainingEventIds: Object.keys(newEventIds)
      });
      return newEventIds;
    });

    if (result.success) {
      showSuccess('成功', SUCCESS_MESSAGES.NODE_TESTED);
    } else {
      showError('出错:', result.error);

      // 记录失败的测试结果
      const failedResult = {
        // error: result.error,
        success: false,
        // timestamp: Date.now(),
        // nodeId: nodeInstanceId
      };
      updateNodeTestResult(nodeInstanceId, failedResult);
    }

    return result;
  }, [
    nodesDetailsMap,
    edgesState,
    nodesTestResultsMap,
    testingNodes,
    updateNodeTestResult,
    updateNodeDetails,
    getLatestNodesTestResultsMap,
    executeTestWithPolling,
    showError,
    showSuccess,
    showWarning
  ]);

  /**
   * 左侧面板节点测试（测试前置节点）
   */
  const handleLeftPanelNodeTest = useCallback(async (
    nodeValues: Record<string, any>,
    nodeInstanceId: string
  ) => {
    return handleNodeTest(nodeValues, nodeInstanceId);
  }, [handleNodeTest]);

  /**
   * 停止工作流测试
   */
  const handleStopWorkflowTest = useCallback(async () => {
    console.log('🔍 [handleStopWorkflowTest] 开始停止工作流测试:', {
      workflowId,
      workflowTestEventId,
      isTestingWorkflow
    });

    if (!isTestingWorkflow) {
      console.log('⚠️ [handleStopWorkflowTest] 当前没有工作流测试在进行中');
      showWarning('无测试进行', '当前没有工作流测试在进行中');
      return;
    }

    if (!workflowTestEventId) {
      console.error('❌ [handleStopWorkflowTest] 未找到工作流测试eventId:', {
        workflowId,
        workflowTestEventId
      });
      showWarning('无法停止', '未找到工作流测试的事件ID');
      return;
    }

    const result = await handleAsyncOperation(async () => {
      console.log('🛑 [handleStopWorkflowTest] 调用停止工作流API:', { workflowId, eventId: workflowTestEventId });
      logger.info('停止工作流测试', { workflowId, eventId: workflowTestEventId });

      const { stopWorkflow, clearWorkflowLogCache } = await import('@/services/workflowTestService');
      const stopResult = await stopWorkflow(workflowTestEventId!);

      console.log('🔍 [handleStopWorkflowTest] 停止工作流API返回结果:', stopResult);

      // 清理该eventId的所有缓存，避免残留请求
      clearWorkflowLogCache(workflowTestEventId!);

      if (!stopResult.success) {
        throw new Error(stopResult.error || '停止工作流测试失败');
      }

      console.log('✅ [handleStopWorkflowTest] 工作流测试停止成功');
      logger.info('工作流测试已停止', { workflowId, eventId: workflowTestEventId });
      return stopResult;
    }, '停止工作流测试失败');

    // 在清理状态前，将仍在运行的节点标记为失败状态
    if (result.success && workflowLogData?.childrenSpans) {
      console.log('🔍 [handleStopWorkflowTest] 检查并更新运行中的节点状态');
      const runningNodes = workflowLogData.childrenSpans.filter((span: any) => span.status === 'RUNNING');

      
      if (runningNodes.length > 0) {
        console.log('⚠️ [handleStopWorkflowTest] 发现运行中的节点，将其标记为失败:', runningNodes.map((n: any) => n.name));
        
        // 创建更新后的日志数据，将RUNNING状态的节点改为FAILED
        const updatedChildrenSpans = workflowLogData.childrenSpans.map((span: any) => {
          if (span.status === 'RUNNING') {
            return { ...span, status: 'FAILED' };
          }
          return span;
        });
        
        const updatedLogData = {
          ...workflowLogData,
          childrenSpans: updatedChildrenSpans
        };
        
        // 更新状态以触发UI重新渲染
        setWorkflowLogData(updatedLogData);
        
        // 短暂延迟后再清理，确保UI能显示失败状态，但保留日志数据
         setTimeout(() => {
           console.log('🧹 [handleStopWorkflowTest] 延迟清理测试状态，保留日志数据');
           setIsTestingWorkflow(false);
           setWorkflowTestEventId(null);
           // 不清空 workflowLogData，保持 DebugTaskbar 的数据显示
         }, 500);
      } else {
         // 没有运行中的节点，立即清理测试状态，但保留日志数据
         console.log('🧹 [handleStopWorkflowTest] 立即清理测试状态，保留日志数据');
         setIsTestingWorkflow(false);
         setWorkflowTestEventId(null);
         // 不清空 workflowLogData，保持 DebugTaskbar 的数据显示
       }
     } else {
       // 停止失败或没有日志数据，立即清理测试状态
       console.log('🧹 [handleStopWorkflowTest] 立即清理测试状态');
       setIsTestingWorkflow(false);
       setWorkflowTestEventId(null);
       // 如果没有日志数据，则不需要保留
       if (!workflowLogData) {
         setWorkflowLogData(null);
       }
     }

    console.log('🔍 [handleStopWorkflowTest] 停止操作最终结果:', {
      success: result.success,
      error: (result as any).error,
      fullResult: result
    });

    if (result.success) {
      console.log('🎉 [handleStopWorkflowTest] 显示停止成功提示');
      showSuccess('成功', '工作流测试已停止');
    } else {
      console.log('❌ [handleStopWorkflowTest] 显示停止失败提示');
      showError('停止失败', result.error || '未知错误');
    }
  }, [isTestingWorkflow, workflowTestEventId, workflowId, showWarning, showSuccess, showError]);

  /**
   * 测试整个工作流 - 精简版本
   */
  const handleWorkflowTest = useCallback(async () => {
    if (!workflowId) {
      showError('出错:', WORKFLOW_ERROR_MESSAGES.MISSING_WORKFLOW_ID);
      return;
    }

    if (isTestingWorkflow) {
      showWarning('测试进行中', '工作流正在测试中，请稍候');
      return;
    }

    setIsTestingWorkflow(true);
    setWorkflowTestEventId(null); // 清理之前的eventId
    setWorkflowLogData(null); // 清理之前的日志数据

    let result;
    try {
      logger.info('开始工作流测试', { workflowId });

      // 1. 找到触发器节点
      const triggerNodes = Object.entries(nodesDetailsMap).filter(([nodeId, nodeDetails]) => {
        const nodeData = nodeDetails?.nodeInfo?.data;
        if (!nodeData) return false;

        // 检查 catalog 字段
        if (nodeData.catalog) {
          return nodeData.catalog === 'trigger';
        }

        // 检查单个 category 字段（向后兼容）
        if (nodeData.category) {
          return nodeData.category === 'trigger';
        }

        // 检查节点类型是否为触发器类型
        if (nodeData.kind) {
          // 支持所有触发器节点类型
          const triggerKinds = ['manual', 'webhook', 'schedule'];
          return triggerKinds.includes(nodeData.kind);
        }

        return false;
      });

      if (triggerNodes.length === 0) {
        throw new Error('画布中需要一个触发器');
      }

      const triggerNodeId = triggerNodes[0]![0];

      // 2. 从触发器开始递归构建RAG图
      const currentEdgesState = edgesStateRef.current.length > 0
        ? edgesStateRef.current
        : (window as any).reactFlowInstance?.getEdges() || [];

      const reachableNodeIds = buildReachableNodesFromTrigger(triggerNodeId, currentEdgesState, nodesDetailsMap);

      if (reachableNodeIds.length <= 1) {
        throw new Error('画布中没有连接到触发器的节点');
      }

      // 3. 构建actions数组
      const actions = reachableNodeIds.map(nodeId => {
        const nodeDetails = nodesDetailsMap[nodeId];
        if (!nodeDetails?.nodeInfo) {
          throw new Error(`节点详情不存在: ${nodeId}`);
        }

        const node = nodeDetails.nodeInfo;
        const filteredInputs = filterNodeInputs(nodeDetails.savedValues || {});
        const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

        // 构建基础inputs
        const inputs: any = {
          ...filteredInputs,
          id: nodeId
        };

        // 只为AI类型的节点添加agentResources
        const isAINode = nodeKind === 'agent_custom' || nodeKind === 'agent-system' ||
          node.data.category === 'AI' || node.type === 'agentNode';

        if (isAINode) {
          const agentResources = nodeDetails.agentResources || {};
          inputs.agentResources = agentResources;
        }

        return {
          id: nodeId,
          inputs,
          kind: nodeKind,
          nodeName: node.data.name || nodeId,
          type: node.type || 'triggerNode'
        };
      });

      // 4. 构建edges数组 - 移除sourceHandle和targe
      const edges = [
        { from: "$source", to: triggerNodeId },
        ...currentEdgesState
          .filter((edge: Edge) => reachableNodeIds.includes(edge.source) && reachableNodeIds.includes(edge.target))
          .map((edge: Edge) => ({
            from: edge.source,
            to: edge.target,
            // ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
            // ...(edge.targetHandle && { targetHandle: edge.targetHandle }),
            // ...(edge.label && String(edge.label).trim() && { label: String(edge.label) })
          }))
      ];

      // 5. 调用log接口执行测试
      const workflowResult = await executeTestWithPolling(
        actions,
        edges,
        undefined,
        (progressData) => logger.debug('工作流测试进度', progressData),
        '工作流测试'
      );

      // 🔍 DEBUG: 检查 workflowResult 的状态
      console.log('🔍 [handleWorkflowTest] executeTestWithPolling 直接返回结果:', workflowResult);

      // 如果是取消状态，直接返回，不进行后续处理
      if ((workflowResult as any).status === 'cancelled') {
        console.log('🛑 [handleWorkflowTest] 检测到取消状态，直接返回');
        result = workflowResult;
      } else {
        // 6. 保存结果到各节点
        if (workflowResult.data && typeof workflowResult.data === 'object') {
          const nodeOutputs = workflowResult.data;

          reachableNodeIds.forEach(nodeId => {
            const nodeDetails = nodesDetailsMap[nodeId];
            const node = nodeDetails?.nodeInfo;

            const nodeTestResult = nodeOutputs[nodeId] ||
              nodeOutputs[node?.data?.name] ||
              nodeOutputs[node?.data?.kind];

            if (nodeTestResult) {
              updateNodeTestResult(nodeId, {
                success: true,
                data: nodeTestResult
              });
            }
          });
        }

        logger.info('工作流测试完成', { workflowId, nodeCount: reachableNodeIds.length });
        result = { success: true, data: workflowResult.data };
      }
    } catch (error) {
      console.log('❌ [handleWorkflowTest] 工作流测试出错:', error);
      result = { success: false, error: error instanceof Error ? error.message : '工作流测试失败' };
    }

    setIsTestingWorkflow(false);
    setWorkflowTestEventId(null); // 清理工作流测试的eventId

    // 🔍 DEBUG: 添加详细日志用于调试
    console.log('🔍 [handleWorkflowTest] 工作流测试结果:', {
      success: result.success,
      status: (result as any).status,
      error: (result as any).error,
      fullResult: result
    });
    logger.info('工作流测试结果详情', {
      success: result.success,
      status: (result as any).status,
      error: (result as any).error,
      workflowId
    });

    if (result.success && (result as any).status !== 'cancelled') {
      console.log('🎉 [handleWorkflowTest] 显示工作流测试完成提示');
      showSuccess('成功', '工作流测试完成');
    } else if ((result as any).status === 'cancelled') {
      // 工作流被停止，不显示任何提示
      console.log('🛑 [handleWorkflowTest] 工作流被取消，不显示完成提示');
      logger.info('工作流测试已停止', { workflowId });
    } else {
      console.log('❌ [handleWorkflowTest] 显示工作流测试错误提示');
      showError('出错:', (result as any).error);
    }

    return result;
  }, [workflowId, isTestingWorkflow, nodesDetailsMap, buildReachableNodesFromTrigger, filterNodeInputs, executeTestWithPolling, updateNodeTestResult, showError, showSuccess, showWarning]);

  /**
   * 保存模拟测试数据
   */
  const handleSaveMockData = useCallback((
    mockTestResult: any,
    nodeInstanceId: string
  ) => {
    // 直接传递完整的 mockTestResult 对象，保留 source 字段
    updateNodeTestResult(nodeInstanceId, mockTestResult);

    logger.info('保存模拟测试数据', { nodeInstanceId, mockTestResult });
    showSuccess('成功', '模拟测试数据已保存');
  }, [updateNodeTestResult, showSuccess]);

  /**
   * 清除节点测试结果
   */
  const clearNodeTestResult = useCallback((nodeInstanceId: string) => {
    updateNodeTestResult(nodeInstanceId, {
      // error: '测试结果已清除',
      success: false,

    });

    logger.info('清除节点测试结果', { nodeInstanceId });
  }, [updateNodeTestResult]);

  /**
   * 批量测试多个节点
   */
  const handleBatchNodeTest = useCallback(async (nodeIds: string[]) => {
    const results = [];

    for (const nodeId of nodeIds) {
      const nodeDetails = nodesDetailsMap[nodeId];
      if (nodeDetails && nodeDetails.savedValues) {
        const result = await handleNodeTest(nodeDetails.savedValues, nodeId);
        results.push({ nodeId, result });
      }
    }

    const successCount = results.filter(r => r.result?.success).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      showSuccess('成功', `所有节点测试成功 (${successCount}/${totalCount})`);
    } else if (successCount > 0) {
      showWarning('部分成功', `部分节点测试成功 (${successCount}/${totalCount})`);
    } else {
      showError('出错:', '所有节点测试失败');
    }

    return results;
  }, [nodesDetailsMap, handleNodeTest, showError, showSuccess, showWarning]);

  /**
   * 获取节点测试状态
   */
  const getNodeTestStatus = useCallback((nodeInstanceId: string) => {
    const isCurrentlyTesting = testingNodes.has(nodeInstanceId);
    const testResult = nodesTestResultsMap[nodeInstanceId];

    return {
      isTesting: isCurrentlyTesting,
      hasResult: !!testResult,
      isSuccess: testResult?.success || false,
      // lastTestTime: testResult?.timestamp,
      // error: testResult?.error,
      data: testResult?.data
    };
  }, [testingNodes, nodesTestResultsMap]);

  /**
   * 检查节点是否可以测试
   */
  const canTestNode = useCallback((nodeInstanceId: string) => {
    const nodeDetails = nodesDetailsMap[nodeInstanceId];
    if (!nodeDetails) return false;

    const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);
    return canNodeExecute(nodeInstanceId, nodeDetails, previousNodeIds, nodesTestResultsMap);
  }, [nodesDetailsMap, edgesState, nodesTestResultsMap]);

  return {
    // 状态
    isTestingWorkflow,
    testingNodes,
    nodeTestEventIds,
    workflowLogData,
    workflowTestEventId,

    // 测试操作
    handleNodeTest,
    handleStopNodeTest,
    handleLeftPanelNodeTest,
    handleWorkflowTest,
    handleStopWorkflowTest,
    handleSaveMockData,
    handleBatchNodeTest,

    // 工具函数
    clearNodeTestResult,
    getNodeTestStatus,
    canTestNode,
    getLatestNodesTestResultsMap
  };
};