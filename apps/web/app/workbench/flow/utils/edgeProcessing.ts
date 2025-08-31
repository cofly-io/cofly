/**
 * 边处理相关工具函数
 */

import { Edge, Connection } from 'reactflow';
import { WorkflowEdge, SaveWorkflowEdge } from '../types/workflow';
import { EdgeStyleConfig } from '../types/canvas';
import { Result, handleSyncOperation, logger } from './errorHandling';

/**
 * 统一边样式配置
 */
export const EDGE_STYLE_CONFIG: EdgeStyleConfig = {
  style: {
    stroke: '#878787',
    strokeWidth: 1
  },
  labelStyle: {
    fill: '#bfbfbf',
    fontSize: 12,
    fontWeight: 500
  },
  labelBgStyle: {
    fill: '#333F50',
    fillOpacity: 0.8,
  }
};

/**
 * 创建新的边
 */
export const createEdge = (connection: Connection): Edge => {
  const edge: Edge = {
    id: `${connection.source}-${connection.target}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle || '',
    targetHandle: connection.targetHandle || '',
    ...EDGE_STYLE_CONFIG
  };

  logger.debug('创建新边', { edge });

  return edge;
};

/**
 * 验证边连接的有效性
 */
export const validateEdgeConnection = (
  connection: Connection,
  existingEdges: Edge[]
): Result<boolean> => {
  return handleSyncOperation(() => {
    const errors: string[] = [];

    // 检查基本信息
    if (!connection.source || !connection.target) {
      errors.push('边缺少源节点或目标节点');
    }

    // 检查是否自连接
    if (connection.source === connection.target) {
      errors.push('不允许节点连接到自身');
    }

    // 检查是否已存在相同连接
    const existingConnection = existingEdges.find(edge =>
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );

    if (existingConnection) {
      errors.push('连接已存在');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    return true;
  }, '验证边连接失败');
};

/**
 * 处理边的subflow属性
 */
export const processEdgeSubflow = (
  edge: Edge,
  sourceNode: any
): Edge => {
  const processedEdge = { ...edge };

  // 检查源节点是否有 subflow 输出
  if (sourceNode?.data?.link?.outputs) {
    const sourceHandleIndex = edge.sourceHandle ?
      parseInt(edge.sourceHandle.replace('right-', '')) : 0;
    const sourceOutput = sourceNode.data.link.outputs[sourceHandleIndex];

    if (sourceOutput?.subflow === true) {
      if (sourceOutput.desc === '循环') {
        processedEdge.data = { ...processedEdge.data, subflow: 'loop' };
      } else if (sourceOutput.desc === '组合') {
        processedEdge.data = { ...processedEdge.data, subflow: 'composite' };
      } else {
        processedEdge.data = { ...processedEdge.data, subflow: 'subflow' };
      }
    }
  }

  logger.debug('处理边subflow属性', {
    edgeId: edge.id,
    subflow: processedEdge.data?.subflow
  });

  return processedEdge;
};

/**
 * 转换ReactFlow边为工作流边格式
 */
export const convertToWorkflowEdge = (edge: Edge): WorkflowEdge => {


  const workflowEdge: WorkflowEdge = {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || '',
    targetHandle: edge.targetHandle || '',
    //label: edge.label || ''
  };

  // 处理subflow属性
  if (edge.data?.subflow) {
    workflowEdge.subflow = edge.data.subflow;
  }

  return workflowEdge;
};

/**
 * 转换边为保存格式
 */
export const convertToSaveEdge = (edge: Edge): SaveWorkflowEdge => {
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

  const saveEdge: SaveWorkflowEdge = temp;

  // 处理subflow属性
  if (edge.data?.subflow) {
    saveEdge.subflow = edge.data.subflow;
  }

  return saveEdge;
};

/**
 * 批量处理边数据
 */
export const processEdgesForSave = (
  edges: Edge[],
  configuredNodeIds: string[],
  nodes: any[]
): Result<SaveWorkflowEdge[]> => {
  return handleSyncOperation(() => {
    const edgesToSave: SaveWorkflowEdge[] = [];

    // 找出第一个节点（没有其他边指向它的节点）
    const firstNodeId = configuredNodeIds.find(nodeId =>
      !edges.some(edge => edge.target === nodeId && configuredNodeIds.includes(edge.source))
    );
    logger.debug('🔍 [Save Debug] firstNodeId:', firstNodeId);

    // 如果存在第一个节点，添加从 $source 到第一个节点的边
    if (firstNodeId) {
      edgesToSave.push({
        to: firstNodeId,
        from: "$source"
      });
      logger.debug('✅ [Save Debug] 添加起始边:', '$source -> ' + firstNodeId);
    }

    // 添加节点之间的连接边
    for (const edge of edges) {
      logger.debug('🔍 [Save Debug] 检查边:', `${edge.source} -> ${edge.target}`);

      if (configuredNodeIds.includes(edge.source) && configuredNodeIds.includes(edge.target)) {
        const edgeToSave: SaveWorkflowEdge = {
          to: edge.target,
          from: edge.source,
          //label: edge.label || ''
        };
        
        // 只有当sourceHandle和targetHandle存在时才添加这些字段
        if (edge.sourceHandle) {
          edgeToSave.sourceHandle = edge.sourceHandle;
        }
        if (edge.targetHandle) {
          edgeToSave.targetHandle = edge.targetHandle;
        }

        // 检查源节点是否有 subflow 输出
        const sourceNode = nodes.find((node: any) => node.id === edge.source);
        if (sourceNode?.data?.link?.outputs) {
          const sourceHandleIndex = edge.sourceHandle ?
            parseInt(edge.sourceHandle.replace('right-', '')) : 0;
          const sourceOutput = sourceNode.data.link.outputs[sourceHandleIndex];

          if (sourceOutput?.subflow === true) {
            if (sourceOutput.desc === '循环') {
              edgeToSave.subflow = 'loop';
            } else {
              edgeToSave.subflow = 'subflow';
            }
          }
        }

        edgesToSave.push(edgeToSave);
        logger.debug('✅ [Save Debug] 成功添加边:', `${edge.source} -> ${edge.target}`);
      } else {
        logger.debug('❌ [Save Debug] 跳过边 (节点不在配置列表中):', `${edge.source} -> ${edge.target}`);
      }
    }

    logger.info('边数据处理完成', {
      totalEdges: edges.length,
      processedEdges: edgesToSave.length
    });

    return edgesToSave;
  }, '处理边数据失败');
};

/**
 * 查找连接到指定节点的所有边
 */
export const findEdgesConnectedToNode = (
  nodeId: string,
  edges: Edge[]
): { incoming: Edge[], outgoing: Edge[] } => {
  const incoming = edges.filter(edge => edge.target === nodeId);
  const outgoing = edges.filter(edge => edge.source === nodeId);

  logger.debug('查找节点连接的边', {
    nodeId,
    incomingCount: incoming.length,
    outgoingCount: outgoing.length
  });

  return { incoming, outgoing };
};

/**
 * 移除与指定节点相关的所有边
 */
export const removeEdgesForNode = (
  nodeId: string,
  edges: Edge[]
): Edge[] => {
  const filteredEdges = edges.filter(edge =>
    edge.source !== nodeId && edge.target !== nodeId
  );

  logger.debug('移除节点相关边', {
    nodeId,
    originalCount: edges.length,
    filteredCount: filteredEdges.length
  });

  return filteredEdges;
};

/**
 * 更新边的样式
 */
export const updateEdgeStyle = (
  edge: Edge,
  styleUpdates: Partial<EdgeStyleConfig>
): Edge => {
  const updatedEdge = {
    ...edge,
    style: { ...edge.style, ...styleUpdates.style },
    labelStyle: { ...edge.labelStyle, ...styleUpdates.labelStyle },
    labelBgStyle: { ...edge.labelBgStyle, ...styleUpdates.labelBgStyle }
  };

  logger.debug('更新边样式', { edgeId: edge.id, styleUpdates });

  return updatedEdge;
};

/**
 * 检查边是否形成循环
 */
export const wouldCreateCycle = (
  newConnection: Connection,
  existingEdges: Edge[]
): boolean => {
  if (!newConnection.source || !newConnection.target) {
    return false;
  }

  // 创建临时边列表
  const tempEdges = [...existingEdges, {
    id: 'temp',
    source: newConnection.source,
    target: newConnection.target
  } as Edge];

  // 使用DFS检查是否存在从target到source的路径
  const visited = new Set<string>();

  const dfs = (currentNode: string, targetNode: string): boolean => {
    if (currentNode === targetNode) {
      return true;
    }

    if (visited.has(currentNode)) {
      return false;
    }

    visited.add(currentNode);

    const outgoingEdges = tempEdges.filter(edge => edge.source === currentNode);

    for (const edge of outgoingEdges) {
      if (dfs(edge.target, targetNode)) {
        return true;
      }
    }

    return false;
  };

  const hasCycle = dfs(newConnection.target, newConnection.source);

  logger.debug('检查边是否形成循环', {
    connection: newConnection,
    hasCycle
  });

  return hasCycle;
};

/**
 * 获取边的显示标签
 */
export const getEdgeLabel = (edge: Edge, sourceNode?: any): string => {
  // 如果边已有标签，直接返回
  if (edge.label) {
    return String(edge.label);
  }

  // 根据源节点的输出端口生成标签
  if (sourceNode?.data?.link?.outputs && edge.sourceHandle) {
    const handleIndex = parseInt(edge.sourceHandle.replace('right-', '')) || 0;
    const output = sourceNode.data.link.outputs[handleIndex];
    if (output?.desc) {
      return output.desc;
    }
  }

  return '';
};

/**
 * 批量更新边标签
 */
export const updateEdgeLabels = (
  edges: Edge[],
  nodes: any[]
): Edge[] => {
  return edges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const label = getEdgeLabel(edge, sourceNode);

    return {
      ...edge,
      label
    };
  });
};