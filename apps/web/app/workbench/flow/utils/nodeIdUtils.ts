/**
 * 节点ID管理工具函数
 * 从 page_backup.tsx 迁移的节点名称修改功能
 */

import { Node, Edge } from 'reactflow';

/**
 * 处理节点ID变更
 * 更新节点标识符并同步相关数据
 * 
 * @param oldId 原节点ID
 * @param newId 新节点ID
 * @param nodesState 当前节点状态
 * @param edgesState 当前边状态
 * @param nodesDetailsMap 节点详情映射
 * @param setNodesState 设置节点状态的函数
 * @param setEdgesState 设置边状态的函数
 * @param updateNodeDetails 更新节点详情的函数
 */
export const handleNodeIdChange = (
  oldId: string,
  newId: string,
  nodesState: Node[],
  edgesState: Edge[],
  nodesDetailsMap: Record<string, any>,
  setNodesState: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  setEdgesState: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void,
  updateNodeDetails: (nodeId: string, details: any) => void
) => {
  if (oldId === newId) {
    return;
  }

  // 对于用户手动输入的名称，直接使用，不进行重复性检查和ID生成
  // 这样用户输入"js123"时，最终的节点ID就是"js123"
  const finalNewId = newId;

  // 更新节点信息
  setNodesState(nds => nds.map(node => {
    if (node.id === oldId) {
      return {
        ...node,
        id: finalNewId,
        data: {
          ...node.data,
          name: finalNewId
        }
      };
    }
    return node;
  }));

  // 更新边连接
  setEdgesState(eds => eds.map(edge => ({
    ...edge,
    source: edge.source === oldId ? finalNewId : edge.source,
    target: edge.target === oldId ? finalNewId : edge.target
  })));

  // 更新节点详情映射
  const oldDetails = nodesDetailsMap[oldId];
  if (oldDetails) {
    const updatedDetailsMap = { ...nodesDetailsMap };
    delete updatedDetailsMap[oldId];

    updatedDetailsMap[finalNewId] = {
      ...oldDetails,
      nodeInfo: {
        ...oldDetails.nodeInfo,
        id: finalNewId,
        data: {
          ...oldDetails.nodeInfo.data,
          name: finalNewId
        }
      }
    };

    // 更新所有节点详情
    Object.keys(updatedDetailsMap).forEach(key => {
      updateNodeDetails(key, updatedDetailsMap[key]);
    });

    // 删除旧的节点详情
    updateNodeDetails(oldId, null);
  }
};