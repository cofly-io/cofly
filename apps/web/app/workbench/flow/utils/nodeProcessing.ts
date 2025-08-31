/**
 * 节点处理相关工具函数
 */

import { Edge } from 'reactflow';
import { NodeDetails, NodeValidationResult, NodeExecutionContext } from '../types/node';
import { Result, handleSyncOperation, logger } from './errorHandling';

/**
 * 递归获取所有前置节点
 * @param nodeId 目标节点ID
 * @param edges 边数据
 * @param nodesDetailsMap 节点详情映射
 * @param visited 已访问的节点集合，用于防止循环引用
 * @returns 所有前置节点ID数组
 */
export const getAllPreviousNodeIds = (
  nodeId: string,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>,
  visited: Set<string> = new Set()
): string[] => {
  // 防止循环引用
  if (visited.has(nodeId)) {
    logger.warn('检测到循环引用', { nodeId, visited: Array.from(visited) });
    return [];
  }
  visited.add(nodeId);

  // 获取直接前置节点
  const directPreviousNodeIds = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source)
    .filter(sourceId => Object.keys(nodesDetailsMap).includes(sourceId));

  // 递归获取所有前置节点
  const allPreviousNodeIds = new Set<string>();

  for (const previousNodeId of directPreviousNodeIds) {
    // 添加直接前置节点
    allPreviousNodeIds.add(previousNodeId);

    // 递归获取间接前置节点
    const indirectPreviousNodeIds = getAllPreviousNodeIds(
      previousNodeId,
      edges,
      nodesDetailsMap,
      new Set(visited)
    );

    indirectPreviousNodeIds.forEach(id => allPreviousNodeIds.add(id));
  }

  logger.debug('获取前置节点完成', {
    nodeId,
    directCount: directPreviousNodeIds.length,
    totalCount: allPreviousNodeIds.size,
    previousNodes: Array.from(allPreviousNodeIds)
  });

  return Array.from(allPreviousNodeIds);
};

/**
 * 获取直接前置节点（只获取一层）
 */
export const getDirectPreviousNodeIds = (
  nodeId: string,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>
): string[] => {
  const directPreviousNodeIds = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source)
    .filter(sourceId => Object.keys(nodesDetailsMap).includes(sourceId));

  logger.debug('获取直接前置节点', { nodeId, previousNodes: directPreviousNodeIds });

  return directPreviousNodeIds;
};

/**
 * 获取所有后续节点
 */
export const getAllNextNodeIds = (
  nodeId: string,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>,
  visited: Set<string> = new Set()
): string[] => {
  // 防止循环引用
  if (visited.has(nodeId)) {
    logger.warn('检测到循环引用', { nodeId, visited: Array.from(visited) });
    return [];
  }
  visited.add(nodeId);

  // 获取直接后续节点
  const directNextNodeIds = edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target)
    .filter(targetId => Object.keys(nodesDetailsMap).includes(targetId));

  // 递归获取所有后续节点
  const allNextNodeIds = new Set<string>();

  for (const nextNodeId of directNextNodeIds) {
    // 添加直接后续节点
    allNextNodeIds.add(nextNodeId);

    // 递归获取间接后续节点
    const indirectNextNodeIds = getAllNextNodeIds(
      nextNodeId,
      edges,
      nodesDetailsMap,
      new Set(visited)
    );

    indirectNextNodeIds.forEach(id => allNextNodeIds.add(id));
  }

  logger.debug('获取后续节点完成', {
    nodeId,
    directCount: directNextNodeIds.length,
    totalCount: allNextNodeIds.size,
    nextNodes: Array.from(allNextNodeIds)
  });

  return Array.from(allNextNodeIds);
};

/**
 * 查找工作流的起始节点（没有前置节点的节点）
 */
export const findStartNodes = (
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>
): string[] => {
  const allNodeIds = Object.keys(nodesDetailsMap);
  const targetNodeIds = new Set(edges.map(edge => edge.target));

  const startNodes = allNodeIds.filter(nodeId => !targetNodeIds.has(nodeId));

  logger.debug('查找起始节点', { startNodes, totalNodes: allNodeIds.length });

  return startNodes;
};

/**
 * 查找工作流的结束节点（没有后续节点的节点）
 */
export const findEndNodes = (
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>
): string[] => {
  const allNodeIds = Object.keys(nodesDetailsMap);
  const sourceNodeIds = new Set(edges.map(edge => edge.source));

  const endNodes = allNodeIds.filter(nodeId => !sourceNodeIds.has(nodeId));

  logger.debug('查找结束节点', { endNodes, totalNodes: allNodeIds.length });

  return endNodes;
};

/**
 * 验证节点配置的完整性
 */
export const validateNodeConfiguration = (
  nodeId: string,
  nodeDetails: NodeDetails
): Result<NodeValidationResult> => {
  return handleSyncOperation(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查基本信息
    if (!nodeDetails.nodeInfo) {
      errors.push('缺少节点信息');
    }

    if (!nodeDetails.originalNodeKind) {
      warnings.push('缺少原始节点类型');
    }

    // 检查保存的值
    if (!nodeDetails.savedValues || Object.keys(nodeDetails.savedValues).length === 0) {
      warnings.push('节点未配置任何参数');
    }

    // 检查必填字段（这里可以根据具体的节点类型进行扩展）
    const nodeInfo = nodeDetails.nodeInfo;
    if (nodeInfo?.data?.required) {
      const requiredFields = nodeInfo.data.required;
      const savedValues = nodeDetails.savedValues || {};

      for (const field of requiredFields) {
        if (!savedValues[field] || savedValues[field] === '') {
          errors.push(`必填字段 "${field}" 未配置`);
        }
      }
    }

    const result: NodeValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    logger.debug('节点配置验证完成', { nodeId, result });

    return result;
  }, `验证节点${nodeId}配置失败`);
};

/**
 * 检查节点是否可以执行
 */
export const canNodeExecute = (
  nodeId: string,
  nodeDetails: NodeDetails,
  previousNodeIds: string[],
  nodesTestResultsMap: Record<string, any>
): boolean => {
  // 检查节点本身是否配置完整
  const validationResult = validateNodeConfiguration(nodeId, nodeDetails);
  if (!validationResult.success || !validationResult.data.isValid) {
    logger.warn('节点配置不完整，无法执行', { nodeId, validation: validationResult });
    return false;
  }

  // 检查前置节点是否都已执行成功
  for (const prevNodeId of previousNodeIds) {
    const testResult = nodesTestResultsMap[prevNodeId];
    if (!testResult || !testResult.success) {
      logger.warn('前置节点未成功执行，无法执行当前节点', {
        nodeId,
        prevNodeId,
        hasResult: !!testResult,
        success: testResult?.success
      });
      return false;
    }
  }

  return true;
};

/**
 * 构建节点执行上下文
 */
export const buildNodeExecutionContext = (
  nodeId: string,
  nodeDetails: NodeDetails,
  previousNodeIds: string[],
  nodesTestResultsMap: Record<string, any>
): Result<NodeExecutionContext> => {
  return handleSyncOperation(() => {
    const context: NodeExecutionContext = {
      nodeId,
      inputs: nodeDetails.savedValues || {},
      previousNodes: previousNodeIds,
      testResultsMap: nodesTestResultsMap
    };

    logger.debug('构建节点执行上下文', { nodeId, context });

    return context;
  }, `构建节点${nodeId}执行上下文失败`);
};

/**
 * 提取节点输入中的模板变量
 */
export const extractTemplateVariables = (inputs: Record<string, any>): string[] => {
  const inputsString = JSON.stringify(inputs);
  const templateVariableRegex = /\{\{\s*\$\.([^.\s}]+)/g;
  const directNodeIdRegex = /\$\.([^.\s}]+)/g;

  const templateNodeIds: string[] = [];
  const directNodeIds: string[] = [];
  let match;

  while ((match = templateVariableRegex.exec(inputsString)) !== null) {
    if (match[1]) {
      templateNodeIds.push(match[1]);
    }
  }
  while ((match = directNodeIdRegex.exec(inputsString)) !== null) {
    if (match[1]) {
      directNodeIds.push(match[1]);
    }
  }

  const allExtractedNodeIds = [...new Set([...templateNodeIds, ...directNodeIds])];

  // logger.debug('提取模板变量', {
  //   inputs: Object.keys(inputs),
  //   templateNodeIds,
  //   directNodeIds,
  //   allExtractedNodeIds
  // });

  return allExtractedNodeIds;
};

/**
 * 检查是否存在循环依赖
 */
export const detectCircularDependency = (
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>
): Result<string[]> => {
  return handleSyncOperation(() => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    const dfs = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        const cycle = path.slice(cycleStart).concat(nodeId);
        cycles.push(cycle.join(' -> '));
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const nextNodes = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target)
        .filter(targetId => Object.keys(nodesDetailsMap).includes(targetId));

      for (const nextNode of nextNodes) {
        if (dfs(nextNode, [...path, nodeId])) {
          // 找到循环，但继续检查其他路径
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // 从所有节点开始检查
    for (const nodeId of Object.keys(nodesDetailsMap)) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    }

    logger.debug('循环依赖检测完成', { cycles });

    return cycles;
  }, '检测循环依赖失败');
};

/**
 * 准备节点测试请求数据
 * 根据 page_backup.tsx 中 handleNodeTest 的逻辑构建测试请求
 */
export const prepareNodeTestRequest = (
  nodeId: string,
  nodeValues: Record<string, any>,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>,
  nodesTestResultsMap: Record<string, any>
): Result<{
  debugRequest: any;
  hasTemplateVariables: boolean;
  extractedNodeIds: string[];
}> => {
  return handleSyncOperation(() => {
    const nodeDetails = nodesDetailsMap[nodeId];
    if (!nodeDetails || !nodeDetails.nodeInfo) {
      throw new Error(`找不到节点详情: ${nodeId}`);
    }

    const node = nodeDetails.nodeInfo;
    const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

    // 提取模板变量
    const extractedNodeIds = extractTemplateVariables(nodeValues);
    const hasTemplateVariables = extractedNodeIds.length > 0;

    // 获取前置节点列表
    const previousNodeIds = getAllPreviousNodeIds(nodeId, edges, nodesDetailsMap);

    // 构造调试请求 - 包含所有相关的节点
    const actions = [];

    // 添加所有前置节点到actions
    previousNodeIds.forEach(prevNodeId => {
      const prevNodeDetails = nodesDetailsMap[prevNodeId];
      if (prevNodeDetails && prevNodeDetails.nodeInfo) {
        const prevNode = prevNodeDetails.nodeInfo;
        actions.push({
          id: prevNodeId,
          inputs: {
            ...(prevNodeDetails.savedValues || {}),
            id: prevNodeId
          },
          kind: prevNodeDetails.originalNodeKind || prevNode.data.kind,
          nodeName: prevNode.data.name || prevNodeId,
          position: prevNode.position,
          type: prevNode.type || 'triggerNode'
        });
      }
    });

    // 添加当前测试节点
    actions.push({
      id: nodeId,
      inputs: { ...nodeValues, id: nodeId },
      kind: nodeKind,
      nodeName: node.data.name || nodeId,
      position: node.position,
      type: node.type || 'triggerNode'
    });

    // 构建edges - 包含完整的连接关系
    const debugEdges = [];

    // 获取所有相关节点ID
    const allNodeIds = [...previousNodeIds, nodeId];

    // 找到第一个节点（没有前置节点的节点）
    const firstNodeId = allNodeIds.find(nodeId =>
      !edges.some(edge => edge.target === nodeId && allNodeIds.includes(edge.source))
    );

    // 从$source到第一个节点的连接
    if (firstNodeId) {
      debugEdges.push({
        from: "$source",
        to: firstNodeId
      });
    }

    // 添加节点之间的连接
    edges.forEach(edge => {
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
        if (edge.sourceHandle) temp.sourceHandle = edge.sourceHandle;
        if (edge.targetHandle) temp.targetHandle = edge.targetHandle;
        if (edge.label) temp.label = String(edge.label);
        debugEdges.push(temp);
      }
    });

    const debugRequest: any = {
      actions,
      edges: debugEdges
    };

    // 如果包含模板变量，添加state字段
    if (hasTemplateVariables) {
      // 构建state对象，包含所有前置节点的lastTestResult
      const state: Record<string, any> = {};

      // 为每个前置节点添加其lastTestResult到state中
      previousNodeIds.forEach(prevNodeId => {
        const prevNodeTestResult = nodesTestResultsMap[prevNodeId];
        if (prevNodeTestResult) {
          state[prevNodeId] = prevNodeTestResult;
        } else {
          logger.warn(`前置节点 ${prevNodeId} 没有测试结果`);
        }
      });

      debugRequest.state = state;
    }

    logger.debug('准备节点测试请求完成', {
      nodeId,
      hasTemplateVariables,
      extractedNodeIds,
      previousNodeIds,
      actionsCount: actions.length,
      edgesCount: debugEdges.length
    });

    return {
      debugRequest,
      hasTemplateVariables,
      extractedNodeIds
    };
  }, `准备节点${nodeId}测试请求失败`);
};

/**
 * 过滤节点保存值，移除系统属性
 */
export const filterNodeSavedValues = (nodeValues: Record<string, any>): Record<string, any> => {
  const filteredValues = { ...nodeValues };

  // 移除系统属性
  delete filteredValues.kind;
  delete filteredValues.name;
  delete filteredValues.description;
  delete filteredValues.icon;
  delete filteredValues.category;
  delete filteredValues.version;
  delete filteredValues.link;
  delete filteredValues.id;

  return filteredValues;
};

/**
 * 处理节点测试结果
 */
export const processNodeTestResult = (
  nodeId: string,
  fullTestResult: any,
  nodeValues: Record<string, any>,
  nodesDetailsMap: Record<string, NodeDetails>
): Result<{
  testResult: any;
  filteredSavedValues: Record<string, any>;
  updatedNodeDetails: NodeDetails;
}> => {
  return handleSyncOperation(() => {
    // 从完整结果中提取当前节点的测试结果
    const testResult = fullTestResult[nodeId] || fullTestResult;

    // 过滤保存值
    const filteredSavedValues = filterNodeSavedValues(nodeValues);

    // 获取当前节点详情
    const currentNodeDetails = nodesDetailsMap[nodeId];
    if (!currentNodeDetails) {
      throw new Error(`找不到节点详情: ${nodeId}`);
    }

    // 更新节点详情
    const updatedNodeDetails: NodeDetails = {
      ...currentNodeDetails,
      savedValues: filteredSavedValues,
      lastSaved: new Date().toISOString(),
      lastTestResult: {
        success: !testResult.error,
        data: testResult,
        error: testResult.error ? testResult.message : undefined,
        timestamp: Date.now(),
        nodeId
      }
    };

    logger.debug('处理节点测试结果完成', {
      nodeId,
      hasError: !!testResult.error,
      savedValuesCount: Object.keys(filteredSavedValues).length
    });

    return {
      testResult,
      filteredSavedValues,
      updatedNodeDetails
    };
  }, `处理节点${nodeId}测试结果失败`);
};

/**
 * 处理节点测试错误
 */
export const processNodeTestError = (
  nodeId: string,
  error: any,
  nodesDetailsMap: Record<string, NodeDetails>
): Result<any> => {
  return handleSyncOperation(() => {
    const nodeDetails = nodesDetailsMap[nodeId];
    const nodeKind = nodeDetails?.originalNodeKind || nodeDetails?.nodeInfo?.data?.kind || 'unknown';

    let testResult: any = null;

    if (error instanceof Error && (error as any).debugResponse) {
      // 如果有debugResponse，使用完整的错误响应
      const debugResponse = (error as any).debugResponse;

      testResult = {
        ...debugResponse,
        nodeId: nodeId,
        nodeKind: nodeKind,
        executionTime: new Date().toISOString(),
        // 保留原始的错误响应数据用于JSON展示
        originalError: debugResponse.responseData || debugResponse
      };
    } else {
      // 如果没有debugResponse，创建简单的错误对象
      testResult = {
        error: true,
        message: error instanceof Error ? error.message : '节点执行失败',
        nodeId: nodeId,
        nodeKind: nodeKind,
        timestamp: new Date().toISOString(),
        // 尝试从错误对象中提取更多信息
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : { error: String(error) }
      };
    }

    logger.error('节点测试失败', {
      nodeId,
      nodeKind,
      hasDebugResponse: !!(error instanceof Error && (error as any).debugResponse),
      errorMessage: error instanceof Error ? error.message : String(error)
    });

    return testResult;
  }, `处理节点${nodeId}测试错误失败`);
};

/**
 * 完整的节点测试处理函数 - 完全实现 handleNodeTest 的逻辑和功能
 * 包括 UI 状态更新回调
 */
export const handleNodeTestComplete = async (
  nodeId: string,
  nodeValues: Record<string, any>,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>,
  nodesTestResultsMap: Record<string, any>,
  debugNodeApi: (request: any, flag: boolean) => Promise<any>,
  callbacks: {
    updateNodeTestResult: (nodeId: string, result: any) => void;
    updateNodeDetails: (nodeId: string, details: NodeDetails) => void;
    updateSelectedNodeDetails?: (updater: (prev: any) => any) => void;
    getCurrentSelectedNodeDetails?: () => any;
  }
): Promise<Result<{
  testResult: any;
  updatedNodeDetails: NodeDetails;
  filteredSavedValues: Record<string, any>;
  hasTemplateVariables: boolean;
  extractedNodeIds: string[];
}>> => {
  const currentSelectedNodeDetails = callbacks.getCurrentSelectedNodeDetails?.();

  try {
    // 1. 验证节点详情
    const nodeDetails = nodesDetailsMap[nodeId];
    if (!nodeDetails || !nodeDetails.nodeInfo) {
      logger.error('找不到对应的节点详情', { nodeId });
      return {
        success: false,
        error: `找不到对应的节点详情: ${nodeId}`
      };
    }

    const node = nodeDetails.nodeInfo;
    const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

    // 2. 提取模板变量 - 使用内联实现以保持与原代码完全一致
    const inputsString = JSON.stringify(nodeValues);

    // 提取模板变量 {{ }} 中的 nodeid
    // 当正则匹配到某个前置节点时，该节点不会被包含在 actions 中执行，但仍然会在 edges 中保持连接关系，并且其测试结果仍然会在 state 中提供给模板变量使用
    const templateVariableRegex = /\{\{\s*\$\.([^.\s}]+)/g;
    const templateNodeIds = [];
    let templateMatch;
    while ((templateMatch = templateVariableRegex.exec(inputsString)) !== null) {
      if (templateMatch[1]) {
        templateNodeIds.push(templateMatch[1]);
      }
    }

    // 提取 $.nodeid. 格式中的 nodeid（支持尾部有点或无点）
    const directNodeIdRegex = /\$\.([^.\s}]+)\.?/g;
    const directNodeIds = [];
    let directMatch;
    while ((directMatch = directNodeIdRegex.exec(inputsString)) !== null) {
      if (directMatch[1]) {
        directNodeIds.push(directMatch[1]);
      }
    }

    // 合并并去重所有提取的 nodeId
    const allExtractedNodeIds = [...new Set([...templateNodeIds, ...directNodeIds])];
    const hasTemplateVariables = allExtractedNodeIds.length > 0;

    // 3. 获取前置节点列表
    const previousNodeIds = getAllPreviousNodeIds(nodeId, edges, nodesDetailsMap);

    // 4. 构造调试请求 - 包含所有相关的节点
    const actions = [];

    // 添加所有前置节点到actions
    previousNodeIds.forEach(prevNodeId => {
      const prevNodeDetails = nodesDetailsMap[prevNodeId];
      if (prevNodeDetails && prevNodeDetails.nodeInfo) {
        const prevNode = prevNodeDetails.nodeInfo;
        actions.push({
          id: prevNodeId,
          inputs: {
            ...(prevNodeDetails.savedValues || {}),
            id: prevNodeId
          },
          kind: prevNodeDetails.originalNodeKind || prevNode.data.kind,
          nodeName: prevNode.data.name || prevNodeId,
          position: prevNode.position,
          type: prevNode.type || 'triggerNode'
        });
      }
    });

    // 添加当前测试节点（当前节点总是要添加的）
    actions.push({
      id: nodeId,
      inputs: { ...nodeValues, id: nodeId },
      kind: nodeKind,
      nodeName: node.data.name || nodeId,
      position: node.position,
      type: node.type || 'triggerNode'
    });

    // 5. 构建edges - 包含完整的连接关系
    const debugEdges = [];
    const allNodeIds = [...previousNodeIds, nodeId];

    // 找到第一个节点（没有前置节点的节点）
    const firstNodeId = allNodeIds.find(nodeId =>
      !edges.some(edge => edge.target === nodeId && allNodeIds.includes(edge.source))
    );

    // 从$source到第一个节点的连接
    if (firstNodeId) {
      debugEdges.push({
        from: "$source",
        to: firstNodeId
      });
    }

    // 添加节点之间的连接
    edges.forEach(edge => {
      if (allNodeIds.includes(edge.source) && allNodeIds.includes(edge.target)) {
        const temp = {
          from: edge.source,
          to: edge.target
        };
        if (edge.sourceHandle) edge.sourceHandle;
        if (edge.targetHandle) edge.targetHandle;
        if (edge.label) edge.label;
        label: edge.label || ''
        debugEdges.push(temp);
      }
    });

    const debugRequest: any = {
      actions,
      edges: debugEdges
    };

    // 6. 如果包含模板变量，添加state字段
    if (hasTemplateVariables) {
      const state: Record<string, any> = {};
      previousNodeIds.forEach(prevNodeId => {
        const prevNodeTestResult = nodesTestResultsMap[prevNodeId];
        if (prevNodeTestResult) {
          state[prevNodeId] = prevNodeTestResult;
        } else {
          logger.warn(`前置节点 ${prevNodeId} 没有测试结果`);
        }
      });
      debugRequest.state = state;
    }

    // 7. 执行 API 调用
    const result = await debugNodeApi(debugRequest, true);

    // 8. 处理成功结果
    const fullTestResult = result.runData[0];
    const testResult = fullTestResult[nodeId] || fullTestResult;

    // 存储测试结果
    callbacks.updateNodeTestResult(nodeId, testResult);

    // 9. 更新节点详情
    const currentNodeDetails = nodesDetailsMap[nodeId];
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
      delete filteredSavedValues.id;

      // 更新节点详情，保存用户配置
      const updatedNodeDetails: NodeDetails = {
        ...currentNodeDetails,
        savedValues: filteredSavedValues,
        lastSaved: new Date().toISOString(),
        lastTestResult: {
          success: !testResult.error,
          data: testResult,
          error: testResult.error ? testResult.message : undefined,
          timestamp: Date.now(),
          nodeId
        }
      };

      callbacks.updateNodeDetails(nodeId, updatedNodeDetails);

      // 10. 更新UI状态（如果提供了回调）
      if (callbacks.updateSelectedNodeDetails) {
        const shouldUpdate = currentSelectedNodeDetails?.node?.id === nodeId;

        if (shouldUpdate) {
          setTimeout(() => {
            callbacks.updateSelectedNodeDetails!((prev: any) => {
              if (prev && prev.node.id === nodeId) {
                const latestNodeDetails = nodesDetailsMap[nodeId];
                return {
                  ...prev,
                  savedValues: latestNodeDetails?.savedValues || prev.savedValues || {},
                  testOutput: JSON.stringify(testResult, null, 2),
                  lastTestResult: testResult
                };
              }
              return prev;
            });
          }, 0);
        }
      }

      logger.info('节点测试执行成功', {
        nodeId,
        hasTemplateVariables,
        extractedNodeIds: allExtractedNodeIds,
        testResultKeys: Object.keys(testResult)
      });

      return {
        success: true,
        data: {
          testResult,
          updatedNodeDetails,
          filteredSavedValues,
          hasTemplateVariables,
          extractedNodeIds: allExtractedNodeIds
        }
      };
    }

    return {
      success: false,
      error: `无法获取节点详情: ${nodeId}`
    };

  } catch (error) {
    // 11. 处理错误情况
    const nodeDetails = nodesDetailsMap[nodeId];
    const nodeKind = nodeDetails?.originalNodeKind || nodeDetails?.nodeInfo?.data?.kind || 'unknown';

    let testResult: any = null;

    if (error instanceof Error && (error as any).debugResponse) {
      // 如果有debugResponse，使用完整的错误响应
      const debugResponse = (error as any).debugResponse;

      testResult = {
        ...debugResponse,
        nodeId: nodeId,
        nodeKind: nodeKind,
        executionTime: new Date().toISOString(),
        originalError: debugResponse.responseData || debugResponse
      };
    } else {
      // 如果没有debugResponse，创建简单的错误对象
      testResult = {
        error: true,
        message: error instanceof Error ? error.message : '节点执行失败',
        nodeId: nodeId,
        nodeKind: nodeKind,
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : { error: String(error) }
      };
    }

    // 存储错误结果
    callbacks.updateNodeTestResult(nodeId, testResult);

    // 更新UI状态（如果提供了回调）
    if (callbacks.updateSelectedNodeDetails) {
      const errorOutput = JSON.stringify(testResult, null, 2);
      const shouldUpdate = currentSelectedNodeDetails?.node?.id === nodeId;

      if (shouldUpdate) {
        setTimeout(() => {
          callbacks.updateSelectedNodeDetails!((prev: any) => {
            if (prev && prev.node.id === nodeId) {
              return {
                ...prev,
                testOutput: errorOutput,
                lastTestResult: testResult,
              };
            }
            return prev;
          });
        }, 0);
      }
    }

    logger.error('节点测试执行失败', {
      nodeId,
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      error: `节点${nodeId}测试失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * 简化版的节点测试执行函数（保持向后兼容）
 */
export const executeNodeTest = async (
  nodeId: string,
  nodeValues: Record<string, any>,
  edges: Edge[],
  nodesDetailsMap: Record<string, NodeDetails>,
  nodesTestResultsMap: Record<string, any>,
  debugNodeApi: (request: any, flag: boolean) => Promise<any>
): Promise<Result<{
  testResult: any;
  updatedNodeDetails: NodeDetails;
  filteredSavedValues: Record<string, any>;
  hasTemplateVariables: boolean;
  extractedNodeIds: string[];
}>> => {
  return handleNodeTestComplete(
    nodeId,
    nodeValues,
    edges,
    nodesDetailsMap,
    nodesTestResultsMap,
    debugNodeApi,
    {
      updateNodeTestResult: () => { }, // 空实现
      updateNodeDetails: () => { }, // 空实现
    }
  );
};