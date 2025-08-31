/**
 * 工作流导出相关工具函数
 */

import { Edge, Node } from 'reactflow';
import { WorkflowData, WorkflowNode, WorkflowEdge } from '../types/workflow';
import { NodeDetails } from '../types/node';
import { Result, handleSyncOperation, logger } from './errorHandling';

export interface CanvasData {
  nodes: Node[];
  edges: Edge[];
}

export interface ExportWorkflowDataParams {
  currentEdges?: Edge[];
  nodes: Node[];
  edges: Edge[];
  nodesDetailsMap: Record<string, NodeDetails>;
  workflowName: string;
  workflowId: string;
}

/**
 * 导出工作流数据
 * 将当前画布的节点和边数据序列化为可传输的格式
 */
export const exportWorkflowData = (params: ExportWorkflowDataParams): Result<WorkflowData> => {
  return handleSyncOperation(() => {
    const { currentEdges, nodes, edges, nodesDetailsMap, workflowName, workflowId } = params;
    
    // 使用传入的边数据，如果没有则使用本地的edges
    const edgesToUse = currentEdges || edges;
    const nodesToExport: WorkflowNode[] = [];
    const edgesToExport: WorkflowEdge[] = [];

    logger.debug('📤 [Export] 开始导出，nodesDetailsMap 键:', Object.keys(nodesDetailsMap));
    logger.debug('📤 [Export] 当前 nodes 数量:', nodes.length);
    logger.debug('📤 [Export] 当前 edges 数量:', edges.length);

    // 导出节点数据
    for (const [nodeInstanceId, nodeDetails] of Object.entries(nodesDetailsMap)) {
      logger.debug(`🔍 [Export] 检查节点: ${nodeInstanceId} 有nodeDetails: ${!!nodeDetails}`);

      if (nodeDetails && nodeDetails.nodeInfo) {
        const nodeInfo = nodeDetails.nodeInfo;
        const nodeToExport: WorkflowNode = {
          id: nodeInstanceId,
          kind: nodeDetails.originalNodeKind || nodeInfo.data?.kind || 'unknown',
          type: nodeInfo.type || 'triggerNode',
          position: nodeInfo.position || { x: 0, y: 0 },
          inputs: nodeDetails.savedValues || {},
          data: {
            kind: nodeInfo.data?.kind,
            name: nodeInfo.data?.name || nodeInstanceId,
            description: nodeInfo.data?.description || '',
            icon: nodeInfo.data?.icon,
            catalog: nodeInfo.data?.catalog || nodeInfo.data?.category,
            version: nodeInfo.data?.version || '1.0.0',
            link: nodeInfo.data?.link || null,
            nodeWidth: nodeInfo.data?.nodeWidth
          }
        };
        nodesToExport.push(nodeToExport);
        logger.debug('✅ [Export] 导出节点:', nodeInstanceId);
      } else {
        logger.debug(`❌ [Export] 跳过节点:' ${nodeInstanceId} '缺少nodeDetails或nodeInfo`);
      }
    }

    // 获取相关的边数据
    const configuredNodeIds = nodesToExport.map(node => node.id);

    logger.debug('🔗 [Export] 配置的节点IDs:', configuredNodeIds);
    logger.debug('🔗 [Export] 当前边数量:', edgesToUse.length);

    // 添加节点之间的连接边
    for (const edge of edgesToUse) {
      if (configuredNodeIds.includes(edge.source) && configuredNodeIds.includes(edge.target)) {
        const edgeToExport: WorkflowEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || '',
          targetHandle: edge.targetHandle || '',
          //label: edge.label || ''
        };

        // 检查源节点是否有 subflow 输出
        const sourceNode = nodes.find((node: any) => node.id === edge.source);
        if (sourceNode?.data?.link?.outputs) {
          const sourceHandleIndex = edge.sourceHandle ? parseInt(edge.sourceHandle.replace('right-', '')) : 0;
          const sourceOutput = sourceNode.data.link.outputs[sourceHandleIndex];

          if (sourceOutput?.subflow === true) {
            if (sourceOutput.desc === '循环') {
              edgeToExport.subflow = 'loop';
            } else if(sourceOutput.desc === '组合') {
              edgeToExport.subflow = 'composite';
            } else {
              edgeToExport.subflow = 'subflow';
            }
          }
        }

        edgesToExport.push(edgeToExport);
      }
    }

    const workflowData: WorkflowData = {
      metadata: {
        workflowName: workflowName || '工作流',
        workflowId,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      nodes: nodesToExport,
      edges: edgesToExport
    };

    logger.info('工作流数据导出成功', {
      nodesCount: nodesToExport.length,
      edgesCount: edgesToExport.length
    });

    return workflowData;
  }, '导出工作流数据失败');
};

/**
 * 复制工作流数据到剪贴板
 */
export const copyWorkflowToClipboard = async (workflowData: WorkflowData): Promise<Result<void>> => {
  try {
    const jsonString = JSON.stringify(workflowData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    logger.info('工作流已复制到剪贴板');
    return { success: true, data: undefined };
  } catch (error) {
    logger.error('复制到剪贴板失败', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '复制到剪贴板失败'
    };
  }
};

/**
 * 导出工作流为JSON文件
 */
export const exportWorkflowToFile = (workflowData: WorkflowData, filename?: string): Result<void> => {
  return handleSyncOperation(() => {
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename || `${workflowData.metadata.workflowName || '工作流'}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(link.href);

    logger.info('JSON文件导出成功', { filename: link.download });
  }, '导出JSON文件失败');
};

/**
 * 获取当前画布数据的辅助函数
 */
export const getCurrentCanvasData = (
  currentCanvasNodes: Node[],
  currentCanvasEdges: Edge[]
): CanvasData => {
  return {
    nodes: currentCanvasNodes,
    edges: currentCanvasEdges
  };
};

/**
 * 验证工作流数据的完整性
 */
export const validateWorkflowData = (workflowData: WorkflowData): Result<boolean> => {
  return handleSyncOperation(() => {
    const errors: string[] = [];

    // 检查基本结构
    if (!workflowData.metadata) {
      errors.push('缺少metadata信息');
    }
    
    if (!Array.isArray(workflowData.nodes)) {
      errors.push('nodes必须是数组');
    }
    
    if (!Array.isArray(workflowData.edges)) {
      errors.push('edges必须是数组');
    }

    // 检查节点数据
    const nodeIds = new Set<string>();
    for (const node of workflowData.nodes) {
      if (!node.id) {
        errors.push('节点缺少id');
      } else if (nodeIds.has(node.id)) {
        errors.push(`重复的节点id: ${node.id}`);
      } else {
        nodeIds.add(node.id);
      }
      
      if (!node.kind) {
        errors.push(`节点${node.id}缺少kind`);
      }
    }

    // 检查边数据
    for (const edge of workflowData.edges) {
      if (!edge.source || !edge.target) {
        errors.push(`边${edge.id}缺少source或target`);
      }
      
      if (!nodeIds.has(edge.source)) {
        errors.push(`边${edge.id}的source节点${edge.source}不存在`);
      }
      
      if (!nodeIds.has(edge.target)) {
        errors.push(`边${edge.id}的target节点${edge.target}不存在`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`工作流数据验证失败: ${errors.join(', ')}`);
    }

    return true;
  }, '工作流数据验证失败');
};