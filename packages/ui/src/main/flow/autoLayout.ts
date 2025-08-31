import { Node, Edge } from 'reactflow';

/**
 * 基于拓扑关系的智能水平布局算法
 * @param nodes ReactFlow 节点数组
 * @param edges ReactFlow 边数组
 * @param options 布局配置选项
 * @returns 布局后的节点数组
 */
export const autoLayoutNodes = (
  nodes: Node[],
  edges: Edge[],
  options: {
    direction?: 'TB' | 'BT' | 'LR' | 'RL'; // 布局方向
    nodeWidth?: number; // 节点宽度
    nodeHeight?: number; // 节点高度
    rankSep?: number; // 层级间距
    nodeSep?: number; // 节点间距
    edgeSep?: number; // 边间距
    canvasWidth?: number; // 画布宽度
    canvasHeight?: number; // 画布高度
  } = {}
): Node[] => {
  if (nodes.length === 0) return nodes;

  // 设置默认配置
  const {
    canvasWidth = 1200, // 默认画布宽度
    canvasHeight = 800, // 默认画布高度
    nodeHeight = 100,   // 固定节点高度
  } = options;

  // 1. 构建节点的拓扑关系
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  
  // 初始化入度和出边
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outEdges.set(node.id, []);
  });
  
  // 计算入度和出边
  edges.forEach(edge => {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target)) {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      const sourceEdges = outEdges.get(edge.source) || [];
      sourceEdges.push(edge.target);
      outEdges.set(edge.source, sourceEdges);
    }
  });

  // 2. 拓扑排序，确定节点的逻辑顺序
  const sortedNodes: Node[] = [];
  const queue: string[] = [];
  const tempInDegree = new Map(inDegree);
  
  // 找到所有入度为0的节点（起始节点）
  tempInDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  // 拓扑排序
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    const currentNode = nodeMap.get(currentNodeId);
    if (currentNode) {
      sortedNodes.push(currentNode);
    }
    
    // 处理当前节点的所有出边
    const neighbors = outEdges.get(currentNodeId) || [];
    neighbors.forEach(neighborId => {
      const newDegree = (tempInDegree.get(neighborId) || 0) - 1;
      tempInDegree.set(neighborId, newDegree);
      if (newDegree === 0) {
        queue.push(neighborId);
      }
    });
  }
  
  // 如果有环或孤立节点，将剩余节点添加到末尾
  const processedIds = new Set(sortedNodes.map(n => n.id));
  nodes.forEach(node => {
    if (!processedIds.has(node.id)) {
      sortedNodes.push(node);
    }
  });

  // 3. 计算布局参数
  const totalPadding = 100; // 左右各50px的边距
  const availableWidth = canvasWidth - totalPadding;
  const nodeSpacing = 20; // 节点之间的固定间距
  const totalSpacing = (sortedNodes.length - 1) * nodeSpacing;
  const totalNodeWidth = availableWidth - totalSpacing;
  
  // 计算每个节点的宽度（节点越多，单个节点越小）
  const dynamicNodeWidth = Math.max(120, totalNodeWidth / sortedNodes.length); // 最小宽度120px
  
  // 如果计算出的节点宽度太小，重新计算间距
  const actualTotalNodeWidth = dynamicNodeWidth * sortedNodes.length;
  const actualSpacing = Math.max(10, (availableWidth - actualTotalNodeWidth) / (sortedNodes.length - 1));
  
  // 计算起始X位置（居中对齐）
  const oldLayoutWidth = actualTotalNodeWidth + (sortedNodes.length - 1) * actualSpacing;
  const startX = (canvasWidth - oldLayoutWidth) / 2;
  
  // 垂直居中位置
  const centerY = (canvasHeight - nodeHeight) / 2;

  // 4. 分析连接关系，识别分叉节点
  const nodeConnections = new Map<string, { incoming: string[], outgoing: string[] }>();
  
  // 初始化连接关系
  nodes.forEach(node => {
    nodeConnections.set(node.id, { incoming: [], outgoing: [] });
  });
  
  // 构建连接关系
  edges.forEach(edge => {
    const sourceConn = nodeConnections.get(edge.source);
    const targetConn = nodeConnections.get(edge.target);
    if (sourceConn) sourceConn.outgoing.push(edge.target);
    if (targetConn) targetConn.incoming.push(edge.source);
  });
  
  // 5. 基于连接关系的智能布局
  const nodePositions = new Map<string, { x: number, y: number, level: number }>();
  const levelNodes = new Map<number, string[]>();
  
  // 按层级分组节点
  const assignLevels = () => {
    const visited = new Set<string>();
    const queue: { nodeId: string, level: number }[] = [];
    
    // 找到起始节点（入度为0）
    sortedNodes.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push({ nodeId: node.id, level: 0 });
      }
    });
    
    // BFS分配层级
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      // 记录节点层级
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(nodeId);
      
      // 处理子节点
      const connections = nodeConnections.get(nodeId);
      if (connections) {
        connections.outgoing.forEach(targetId => {
          if (!visited.has(targetId)) {
            queue.push({ nodeId: targetId, level: level + 1 });
          }
        });
      }
    }
    
    // 处理未访问的节点（孤立节点或环）
    sortedNodes.forEach(node => {
      if (!visited.has(node.id)) {
        const maxLevel = Math.max(...Array.from(levelNodes.keys()), -1);
        const newLevel = maxLevel + 1;
        if (!levelNodes.has(newLevel)) {
          levelNodes.set(newLevel, []);
        }
        levelNodes.get(newLevel)!.push(node.id);
      }
    });
  };
  
  assignLevels();
  
  // 5.5 优化层级分配：当节点很多且大部分是单独层级时，合并到较少层级
  const totalNodes = nodes.length;
  const singleNodeLevels = Array.from(levelNodes.entries()).filter(([level, nodeIds]) => nodeIds.length === 1);
  const singleNodeCount = singleNodeLevels.length;
  
  // 如果超过70%的节点都是单独层级，且总节点数超过10个，则重新分配
  if (totalNodes > 10 && singleNodeCount > totalNodes * 0.7) {
    console.log(`🔄 [AutoLayout] 检测到过多单独层级 (${singleNodeCount}/${totalNodes})，重新分配到多排布局`);
    
    // 清空当前层级分配
    levelNodes.clear();
    
    // 重新分配：将节点合并到较少的层级中
    const maxNodesPerLevel = 15; // 每个层级最多节点数
    const maxLevels = Math.min(4, Math.ceil(totalNodes / maxNodesPerLevel)); // 最多4个层级
    
    let currentLevel = 0;
    let currentLevelNodes: string[] = [];
    
    sortedNodes.forEach((node, index) => {
      currentLevelNodes.push(node.id);
      
      // 当当前层级节点数达到限制，或者需要平均分配到剩余层级时，切换到下一层级
      const remainingNodes = totalNodes - index - 1;
      const remainingLevels = maxLevels - currentLevel;
      const shouldSwitchLevel = currentLevelNodes.length >= maxNodesPerLevel || 
                               (remainingLevels > 1 && currentLevelNodes.length >= Math.ceil(remainingNodes / (remainingLevels - 1)));
      
      if (shouldSwitchLevel && currentLevel < maxLevels - 1) {
        levelNodes.set(currentLevel, [...currentLevelNodes]);
        currentLevel++;
        currentLevelNodes = [];
      }
    });
    
    // 添加最后一个层级
    if (currentLevelNodes.length > 0) {
      levelNodes.set(currentLevel, currentLevelNodes);
    }
    
    console.log('🔄 [AutoLayout] 重新分配后的层级:', Array.from(levelNodes.entries()).map(([level, nodeIds]) => ({
      level,
      nodeCount: nodeIds.length
    })));
  }
  
  // 6. 计算每层的布局
  const maxLevels = Math.max(...Array.from(levelNodes.keys()), 0) + 1;
  
  // 动态调整层级间距，确保不超出画布
  const minLevelSpacing = 200; // 最小层级间距
  const maxLevelSpacing = 300; // 最大层级间距
  const padding = 100; // 左右边距
  const availableLayoutWidth = canvasWidth - padding;
  
  let levelSpacing = maxLevelSpacing;
  if (maxLevels > 1) {
    const calculatedSpacing = availableLayoutWidth / (maxLevels - 1);
    levelSpacing = Math.max(minLevelSpacing, Math.min(maxLevelSpacing, calculatedSpacing));
  }
  
  const totalLayoutWidth = (maxLevels - 1) * levelSpacing;
  const layoutStartX = (canvasWidth - totalLayoutWidth) / 2;
  
  // 为每个层级计算节点位置
  console.log('🔍 [AutoLayout] 层级分配情况:', Array.from(levelNodes.entries()).map(([level, nodeIds]) => ({
    level,
    nodeCount: nodeIds.length,
    nodeIds: nodeIds
  })));
  
  levelNodes.forEach((nodeIds, level) => {
    const levelX = layoutStartX + level * levelSpacing;
    const nodesInLevel = nodeIds.length;
    
    console.log(`🔍 [AutoLayout] 处理层级 ${level}: ${nodesInLevel} 个节点`);
    
    if (nodesInLevel === 1) {
      // 单个节点，垂直居中
      const nodeId = nodeIds[0];
      nodePositions.set(nodeId!, {
        x: levelX,
        y: centerY,
        level: level
      });
    } else {
      // 多个节点，检查是否需要多排布局
      const maxNodesPerRow = 10; // 每排最大节点数
      const needMultipleRows = nodesInLevel > maxNodesPerRow;
      
      console.log(`🔍 [AutoLayout] 层级 ${level}: ${nodesInLevel} 个节点, 需要多排布局: ${needMultipleRows}`);
      
      if (needMultipleRows) {
        console.log(`✅ [AutoLayout] 触发多排布局 - 层级 ${level}, 节点数: ${nodesInLevel}`);
        
        // 多排布局
        const rowSpacing = 180; // 排与排之间的间距
        const totalRows = Math.ceil(nodesInLevel / maxNodesPerRow);
        console.log(`📊 [AutoLayout] 计算出 ${totalRows} 排，每排最多 ${maxNodesPerRow} 个节点`);
        const totalRowsHeight = (totalRows - 1) * rowSpacing;
        const firstRowY = centerY - totalRowsHeight / 2;
        
        // 按连接关系排序节点
        const sortedNodeIds = [...nodeIds].sort((a, b) => {
          const aConnections = nodeConnections.get(a)?.incoming || [];
          const bConnections = nodeConnections.get(b)?.incoming || [];
          
          if (aConnections.length > 0 && bConnections.length > 0) {
            const aParent = aConnections[0];
            const bParent = bConnections[0];
            if (aParent === bParent) {
              return 0;
            }
            const aParentPos = nodePositions.get(aParent || '');
            const bParentPos = nodePositions.get(bParent || '');
            if (aParentPos && bParentPos) {
              return aParentPos.y - bParentPos.y;
            }
          }
          return 0;
        });
        
        // 分配节点到各排
        sortedNodeIds.forEach((nodeId, index) => {
          const rowIndex = Math.floor(index / maxNodesPerRow);
          const positionInRow = index % maxNodesPerRow;
          const nodesInThisRow = Math.min(maxNodesPerRow, nodesInLevel - rowIndex * maxNodesPerRow);
          
          // 计算当前排的布局
          const nodeSpacing = 120; // 同一排内节点间距
          const rowWidth = (nodesInThisRow - 1) * nodeSpacing;
          const rowStartX = levelX - rowWidth / 2;
          const currentRowY = firstRowY + rowIndex * rowSpacing;
          
          nodePositions.set(nodeId, {
            x: rowStartX + positionInRow * nodeSpacing,
            y: currentRowY,
            level: level
          });
        });
      } else {
        // 单排布局（原有逻辑）
        const minVerticalSpacing = 80;
        const maxVerticalSpacing = 150;
        const verticalPadding = 50;
        const availableHeight = canvasHeight - verticalPadding;
        
        let verticalSpacing = maxVerticalSpacing;
        if (nodesInLevel > 1) {
          const calculatedSpacing = availableHeight / (nodesInLevel - 1);
          verticalSpacing = Math.max(minVerticalSpacing, Math.min(maxVerticalSpacing, calculatedSpacing));
        }
        
        const totalHeight = (nodesInLevel - 1) * verticalSpacing;
        const startY = centerY - totalHeight / 2;
        
        const sortedNodeIds = [...nodeIds].sort((a, b) => {
          const aConnections = nodeConnections.get(a)?.incoming || [];
          const bConnections = nodeConnections.get(b)?.incoming || [];
          
          if (aConnections.length > 0 && bConnections.length > 0) {
            const aParent = aConnections[0];
            const bParent = bConnections[0];
            if (aParent === bParent) {
              return 0;
            }
            const aParentPos = nodePositions.get(aParent || '');
            const bParentPos = nodePositions.get(bParent || '');
            if (aParentPos && bParentPos) {
              return aParentPos.y - bParentPos.y;
            }
          }
          return 0;
        });
        
        sortedNodeIds.forEach((nodeId, index) => {
          nodePositions.set(nodeId, {
            x: levelX,
            y: startY + index * verticalSpacing,
            level: level
          });
        });
      }
    }
  });
  
  // 7. 生成最终的节点布局
  const nodeWidthPerRow = Math.max(120, Math.min(200, availableWidth / Math.max(maxLevels, 1)));
  
  const layoutedNodes = sortedNodes.map((node) => {
    const position = nodePositions.get(node.id) || { x: 0, y: centerY, level: 0 };
    
    return {
      ...node,
      position: {
        x: position.x,
        y: position.y,
      },
      data: {
        ...node.data,
        nodeWidth: nodeWidthPerRow,
        nodeHeight: nodeHeight,
        level: position.level,
        hasMultipleOutgoing: (nodeConnections.get(node.id)?.outgoing.length || 0) > 1,
        hasMultipleIncoming: (nodeConnections.get(node.id)?.incoming.length || 0) > 1,
      },
    };
  });

  // 8. 确保所有节点都在画布内
  return centerNodes(layoutedNodes, canvasWidth, canvasHeight);
};

/**
 * 检查是否需要触发自动布局
 * @param changes 节点变化列表
 * @returns 是否需要重新布局
 */
export const shouldTriggerAutoLayout = (changes: any[]): boolean => {
  // 检查是否有添加节点的变化
  const hasAddedNodes = changes.some(change => 
    change.type === 'add'
  );
  
  // 检查是否有位置重置的变化（比如拖拽到特定位置）
  const hasPositionReset = changes.some(change => 
    change.type === 'position' && 
    change.dragging === false && // 拖拽结束
    (change.position?.x === 0 || change.position?.y === 0) // 位置为零或接近零
  );

  return hasAddedNodes || hasPositionReset;
};

/**
 * 计算图的边界信息
 * @param nodes 节点数组
 * @returns 边界信息对象
 */
export const calculateBounds = (nodes: Node[]) => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const width = node.data?.nodeWidth || 200;
    const height = node.data?.nodeHeight || 100;
    
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * 将节点居中到画布中央
 * @param nodes 节点数组
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @returns 居中后的节点数组
 */
export const centerNodes = (
  nodes: Node[], 
  canvasWidth: number = 1200, 
  canvasHeight: number = 800
): Node[] => {
  if (nodes.length === 0) return nodes;

  const bounds = calculateBounds(nodes);
  const padding = 50; // 边距
  
  // 确保图形不超出画布边界
  const maxWidth = canvasWidth - 2 * padding;
  const maxHeight = canvasHeight - 2 * padding;
  
  let scaleX = 1;
  let scaleY = 1;
  
  // 如果图形太大，计算缩放比例
  if (bounds.width > maxWidth) {
    scaleX = maxWidth / bounds.width;
  }
  if (bounds.height > maxHeight) {
    scaleY = maxHeight / bounds.height;
  }
  
  // 使用较小的缩放比例确保图形完全在画布内
  const scale = Math.min(scaleX, scaleY);
  
  // 应用缩放后重新计算边界
  const scaledBounds = {
    ...bounds,
    width: bounds.width * scale,
    height: bounds.height * scale
  };
  
  // 计算偏移量使图形居中
  const offsetX = (canvasWidth - scaledBounds.width) / 2 - bounds.minX * scale;
  const offsetY = (canvasHeight - scaledBounds.height) / 2 - bounds.minY * scale;

  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x * scale + offsetX,
      y: node.position.y * scale + offsetY,
    },
  }));
};