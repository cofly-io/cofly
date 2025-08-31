// 添加本地缓存
// let nodesCache: any = null;

// 获取所有可用节点
export async function fetchAllNodes() {
  // 如果有缓存，直接返回
  // if (nodesCache) {
  //   console.log("有缓存");
  //   return nodesCache;
  // }
  
  const response = await fetch('/api/nodes');
  if (!response.ok) {
    const error = await response.json();    
    throw new Error(error.message || '获取节点失败');
  }
  
  const data = await response.json();
  // 缓存结果
  //nodesCache = data.nodes;
  return data.dataSource;
}

// 获取特定节点的详细信息
export async function fetchNodeDetails(nodeId: string) {
  const response = await fetch(`/api/nodes/${nodeId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '获取节点详情失败');
  }
  
  const data = await response.json();
  return data.node; // 修复：API 返回的是 { node: node.detail }，而不是 { dataSource: ... }
}

// 执行节点
export async function executeNode(nodeName: string, params: any) {
  const response = await fetch('/api/nodes/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nodeName, params }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '执行节点失败');
  }
  
  const data = await response.json();
  return data.result;
}
