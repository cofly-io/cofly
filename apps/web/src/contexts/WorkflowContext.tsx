"use client";

import React, { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { useSearchParams } from 'next/navigation'; // 添加导入
//


interface WorkflowContextType {
  nodes: Node[];
  edges: Edge[];
  workflowId: string | null;
  workflowName: string;
  nodesDetailsMap: Record<string, any>;
  nodesTestResultsMap: Record<string, any>; // 新增：专门存储测试结果的状态
  isLoading: boolean; // 新增：加载状态
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setNodesDetailsMap: (map: Record<string, any>) => void;
  updateNodeDetails: (nodeId: string, details: any) => void;
  updateNodeTestResult: (nodeId: string, testResult: any) => void; // 新增：更新测试结果的方法
  clearAllTestResults: () => void; // 新增：清空所有测试结果的方法
  cleanOrphanedNodeDetails: () => void; // 新增：清理孤立节点详情的方法
  deleteNodeCompletely: (nodeId: string) => void; // 新增：完整删除节点的方法
  createNewWorkflow: () => string;
  loadWorkflowFromDatabase: (workflowId: string) => Promise<void>; // 新增加载方法
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

interface WorkflowProviderProps {
  children: ReactNode;
}

// ====== 中文注释：统一边样式配置 ======
// 定义统一的边样式配置，避免在多个地方重复定义
// =============================
export const EDGE_STYLE_CONFIG = {
  style: {
    stroke: '#33C2EE',
    strokeWidth: 2
  },
  labelStyle: {
    fill: '#bfbfbf', // 修改文字颜色为#bfbfbf
    fontSize: 12,
    fontWeight: 500
  },
  labelBgStyle: {
    fill: '#333F50', // 背景色
    fillOpacity: 0.8,
  }
};

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [nodes, setNodesState] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // 包装 setNodes 以添加调试日志
  const setNodes = useCallback((newNodes: Node[]) => {
    console.log('🔄 [WorkflowContext] setNodes 被调用:', {
      beforeCount: nodes.length,
      afterCount: newNodes.length,
      beforeIds: nodes.map(n => n.id),
      afterIds: newNodes.map(n => n.id),
      added: newNodes.filter(n => !nodes.some(existing => existing.id === n.id)).map(n => n.id),
      removed: nodes.filter(n => !newNodes.some(updated => updated.id === n.id)).map(n => n.id)
    });
    setNodesState(newNodes);
  }, [nodes]);

  // 移除不必要的边状态监听日志
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('我的业务流');
  const [nodesDetailsMap, setNodesDetailsMap] = useState<Record<string, any>>({});
  // 🧪 专门存储测试结果的状态（不使用持久化）
  const [nodesTestResultsMap, setNodesTestResultsMap] = useState<Record<string, any>>({});

  // 获取URL搜索参数 - 使用 Suspense 边界包装
  const searchParams = useSearchParams();

  // 使用ref跟踪初始化状态，避免React严格模式下的重复调用
  const initializationRef = useRef<{
    isInitialized: boolean;
  }>({
    isInitialized: false
  });

  // 添加一个ref来跟踪正在进行的请求，避免重复请求
  const loadingRequestsRef = useRef<Set<string>>(new Set());

  /**
   * 从数据库加载工作流数据
   * @param workflowId 工作流ID
   */
  const loadWorkflowFromDatabase = useCallback(async (workflowId: string) => {
    // 检查是否已经有相同ID的请求正在进行
    if (loadingRequestsRef.current.has(workflowId)) {
      console.log('🔄 [WorkflowContext] 工作流加载请求已在进行中:', workflowId);
      return;
    }

    // 标记请求开始
    loadingRequestsRef.current.add(workflowId);
    console.log('📥 [WorkflowContext] 开始加载工作流数据:', workflowId);

    try {
      // 调用API获取工作流配置
      const response = await fetch(`/api/workflow-config/${workflowId}`);

      // 如果工作流不存在(404)，处理方式取决于环境
      if (response.status === 404) {
        // 在开发环境下，如果当前已有节点数据或NodesDetailsMap，可能是由于Fast Refresh导致的重新加载
        // 保持当前状态，避免丢失用户的操作
        const isDevelopment = process.env.NODE_ENV === 'development';
        const hasCurrentNodes = nodes.length > 0;
        const hasCurrentDetails = Object.keys(nodesDetailsMap).length > 0;

        if (isDevelopment && (hasCurrentNodes || hasCurrentDetails)) {
          // 只设置工作流ID，但保持当前的节点和边
          setWorkflowId(workflowId);
          return;
        } else {
          // 🔧 在开发环境中，即使没有当前数据，也不要立即重置
          // 可能是因为组件重新渲染导致的暂时性数据丢失
          if (isDevelopment) {
            setWorkflowId(workflowId);
            // 不立即重置数据，给组件一些时间恢复状态
            setTimeout(() => {
              // 再次检查是否有数据，如果还是没有才重置
              if (nodes.length === 0 && Object.keys(nodesDetailsMap).length === 0) {
                setWorkflowName('我的业务流');
                setNodes([]);
                setEdges([]);
                setNodesDetailsMap({});
                setNodesTestResultsMap({});
              }
            }, 1000);
            return;
          } else {
            // 生产环境直接重置
            setWorkflowId(workflowId);
            setWorkflowName('我的业务流');
            setNodes([]);
            setEdges([]);
            setNodesDetailsMap({});
            setNodesTestResultsMap({});
            return;
          }
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch workflow: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const workflowData = result.data;

        // 设置工作流基本信息
        setWorkflowId(workflowId);
        setWorkflowName(workflowData.name || '我的业务流');

        // 处理节点数据 - 先解析 JSON 字符串
        const loadedNodes: Node[] = [];
        const loadedNodesDetailsMap: Record<string, any> = {};

        // 解析 nodesInfo JSON 字符串
        let nodesInfoArray = [];
        try {
          if (workflowData.nodesInfo) {
            if (typeof workflowData.nodesInfo === 'string') {
              nodesInfoArray = JSON.parse(workflowData.nodesInfo);
            } else if (Array.isArray(workflowData.nodesInfo)) {
              nodesInfoArray = workflowData.nodesInfo;
            }
          }
        } catch (error) {
          console.error('解析 nodesInfo 失败:', error);
          nodesInfoArray = [];
        }

        // ====== 中文注释：节点解析 ======
        // 1. 只要每个节点对象包含 id、type、position、kind、inputs 等核心字段，
        //    其余字段（如 subflow）不会影响节点的正常渲染。
        // 2. 如果后续需要在画布上根据 subflow 字段做特殊标记，可在 data 字段中加入 subflow 信息。
        // 3. 当前实现会忽略多余字段，保证兼容性。
        // =============================
        if (nodesInfoArray && Array.isArray(nodesInfoArray)) {
          console.log('📋 [WorkflowContext] 解析到节点数据:', nodesInfoArray);
          console.log('📋 [WorkflowContext] 节点数组长度:', nodesInfoArray.length);
          // ====== 中文注释：批量获取节点link信息 ======
          // 为了让节点能正确渲染连接点，需要获取每个节点的link信息
          // 优先使用数据库中保存的link信息，如果没有再从API获取
          // =============================
          const nodePromises = nodesInfoArray.map(async (nodeInfo, index) => {
            console.log(`🔧 [WorkflowContext] 处理节点 ${index}:`, {
              id: nodeInfo.id,
              kind: nodeInfo.kind,
              type: nodeInfo.type,
              hasPosition: !!nodeInfo.position,
              hasInputs: !!nodeInfo.inputs
            });
            try {
              let linkInfo = nodeInfo.link || null; // 优先使用数据库中的link信息

              // 如果数据库中没有link信息或图标信息，从API获取
              let nodeDefinition = null;
              if (!linkInfo || !nodeInfo.icon) {
                const response = await fetch(`/api/nodes/${nodeInfo.kind}`);
                if (response.ok) {
                  const nodeDetails = await response.json();
                  nodeDefinition = nodeDetails.node;
                  linkInfo = linkInfo || nodeDefinition.link || null;
                }
              } 

              // 创建ReactFlow节点
              const reactFlowNode: Node = {
                id: nodeInfo.id,
                type: nodeInfo.type || 'triggerNode',
                position: nodeInfo.position || { x: 0, y: 0 },
                data: {
                  kind: nodeInfo.kind, // 使用kind字段
                  name: nodeInfo.name || nodeInfo.inputs?.id || nodeInfo.id || '未命名节点',
                  description: nodeInfo.description || nodeInfo.inputs?.description || '',
                  // 优先使用保存的图标信息，如果没有则从节点定义获取
                  icon: nodeInfo.icon || nodeDefinition?.icon || 'default.svg',
                  // 使用 catalog 字段保持与节点定义的一致性
                  catalog: nodeInfo.catalog || nodeDefinition?.catalog || nodeInfo.category || nodeInfo.inputs?.catalog || nodeInfo.inputs?.category || 'default',
                  // 保持向后兼容的 category 字段（用于旧版本兼容）
                  category: nodeInfo.catalog || nodeDefinition?.catalog || nodeInfo.category || nodeInfo.inputs?.catalog || nodeInfo.inputs?.category || 'default',
                  version: nodeInfo.version || nodeInfo.inputs?.version || '1.0.0',
                  // ====== 中文注释：添加link信息 ======
                  // 添加节点的输入输出定义，确保连接点能正确渲染
                  link: linkInfo,
                  // =============================
                  // ====== 中文注释：StickyNote特殊处理 ======
                  // 对于StickyNote类型节点，需要将content和color从inputs恢复到data中
                  ...(nodeInfo.kind === 'stickyNote' && nodeInfo.inputs ? {
                    content: nodeInfo.inputs.content || '',
                    color: nodeInfo.inputs.color || '#FFE066'
                  } : {}),
                  // =============================
                  // ====== 中文注释：subflow兼容 ======
                  // 如果节点有subflow字段，附加到data，便于后续画布特殊渲染
                  ...(nodeInfo.subflow !== undefined ? { subflow: nodeInfo.subflow } : {})
                  // =============================
                },
                // ====== 中文注释：StickyNote层级设置 ======
                // 设置StickyNote的zIndex为最低，确保其在最底层
                zIndex: nodeInfo.kind === 'stickyNote' ? -1 : undefined,
                // ====== 中文注释：StickyNote尺寸恢复 ======
                // 对于StickyNote类型节点，需要将width和height从inputs恢复到style中
                style: nodeInfo.kind === 'stickyNote' && nodeInfo.inputs ? {
                  width: nodeInfo.inputs.width || 300,
                  height: nodeInfo.inputs.height || 160
                } : undefined
              };

              // 从inputs中提取agentResources并重建到nodeDetails
              const inputs = nodeInfo.inputs || {};
              const agentResources = inputs.agentResources || null;
              
              console.log(`✅ [WorkflowContext] 节点创建成功:`, {
                id: reactFlowNode.id,
                type: reactFlowNode.type,
                kind: reactFlowNode.data.kind,
                position: reactFlowNode.position,
                hasLink: !!linkInfo
              });
              
              return {
                node: reactFlowNode,
                detailsMap: {
                  [nodeInfo.id]: {
                    parameters: null, // 将在节点双击时加载
                    savedValues: inputs, // 从数据库加载的inputs数据
                    originalNodeKind: nodeInfo.kind, // 使用kind而不是nodeId
                    nodeInfo: reactFlowNode,
                    agentResources: agentResources // 重建agentResources字段
                  }
                }
              };
            } catch (error) {
              console.error(`获取节点 ${nodeInfo.kind} 的link信息失败:`, error);
              // 如果获取失败，创建没有link信息的节点
              const reactFlowNode: Node = {
                id: nodeInfo.id,
                type: nodeInfo.type || 'triggerNode',
                position: nodeInfo.position || { x: 0, y: 0 },
                data: {
                  kind: nodeInfo.kind,
                  name: nodeInfo.inputs?.id || nodeInfo.id || '未命名节点',
                  description: nodeInfo.inputs?.description || nodeInfo.description || '',
                  // icon: getThemeIcon(nodeInfo.kind),
                  catalog: nodeInfo.inputs?.catalog || nodeInfo.catalog || 'default',
                  version: nodeInfo.inputs?.version || nodeInfo.version || '1.0.0',
                  // ====== 中文注释：StickyNote特殊处理 ======
                  // 对于StickyNote类型节点，需要将content和color从inputs恢复到data中
                  ...(nodeInfo.kind === 'stickyNote' && nodeInfo.inputs ? {
                    content: nodeInfo.inputs.content || '',
                    color: nodeInfo.inputs.color || '#FFE066'
                  } : {}),
                  // =============================
                  ...(nodeInfo.subflow !== undefined ? { subflow: nodeInfo.subflow } : {})
                },
                // ====== 中文注释：StickyNote层级设置 ======
                // 设置StickyNote的zIndex为最低，确保其在最底层
                zIndex: nodeInfo.kind === 'stickyNote' ? -1 : undefined,
                // ====== 中文注释：StickyNote尺寸恢复 ======
                // 对于StickyNote类型节点，需要将width和height从inputs恢复到style中
                style: nodeInfo.kind === 'stickyNote' && nodeInfo.inputs ? {
                  width: nodeInfo.inputs.width || 300,
                  height: nodeInfo.inputs.height || 160
                } : undefined
                // =============================
              };

              console.log(`⚠️ [WorkflowContext] 节点创建(fallback):`, {
                id: reactFlowNode.id,
                type: reactFlowNode.type,
                kind: reactFlowNode.data.kind,
                position: reactFlowNode.position
              });

              return {
                node: reactFlowNode,
                detailsMap: {
                  [nodeInfo.id]: {
                    parameters: null,
                    savedValues: nodeInfo.inputs || {},
                    originalNodeKind: nodeInfo.kind,
                    nodeInfo: reactFlowNode
                  }
                }
              };
            }
          });

          // 等待所有节点处理完成，添加错误处理
          console.log('⏳ [WorkflowContext] 等待节点处理完成，总数:', nodePromises.length);
          const nodeResults = await Promise.allSettled(nodePromises);
          console.log('✅ [WorkflowContext] 节点处理完成，结果:', nodeResults.map(r => r.status));

          // 处理结果，过滤掉失败的请求
          const successfulResults = nodeResults
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
            .map(result => result.value);

          const failedResults = nodeResults.filter(result => result.status === 'rejected');
          
          console.log('📊 [WorkflowContext] 节点处理统计:', {
            total: nodeResults.length,
            successful: successfulResults.length,
            failed: failedResults.length
          });

          if (failedResults.length > 0) {
            console.warn('🔗 部分节点处理失败:', failedResults.length, '个');
            failedResults.forEach((result, index) => {
              console.error(`🔗 节点 ${index} 处理失败:`, result.reason);
            });
          }

          // 合并结果
          successfulResults.forEach((result, index) => {
            console.log(`🔧 [WorkflowContext] 合并节点 ${index}:`, result.node?.id);
            loadedNodes.push(result.node);
            Object.assign(loadedNodesDetailsMap, result.detailsMap);
          });
          
          console.log('📋 [WorkflowContext] 最终节点列表:', loadedNodes.map(n => ({ id: n.id, type: n.type, kind: n.data?.kind })));
        }

        // 处理边数据 - 先解析 JSON 字符串
        const loadedEdges: Edge[] = [];

        // 解析 relation JSON 字符串
        let relationArray = [];
        try {
          if (workflowData.relation) {
            if (typeof workflowData.relation === 'string') {
              relationArray = JSON.parse(workflowData.relation);
            } else if (Array.isArray(workflowData.relation)) {
              relationArray = workflowData.relation;
            }
          }
        } catch (error) {
          console.error('解析 relation 失败:', error);
          relationArray = [];
        }

        // ====== 中文注释：边解析 ======
        // 1. 只要每个relation对象包含 from、to 字段，其他字段（如 subflow）不会影响边的正常渲染。
        // 2. 根据源节点的输出连接点描述生成边标签，保持与创建时一致的显示效果。
        // 3. 当前实现会忽略多余字段，保证兼容性。
        // =============================
        if (relationArray && Array.isArray(relationArray)) {
          for (const relation of relationArray) {
            // 跳过$source到第一个节点的边，这是内部逻辑边
            if (relation.from === '$source') {
              continue;
            }

            // 查找源节点，用于生成边标签
            const sourceNode = loadedNodes.find(node => node.id === relation.from);
            let edgeLabel = relation.label || ''; // 优先使用保存的标签

            // 如果没有保存的标签，根据源节点的输出连接点描述生成标签
            if (!edgeLabel && sourceNode?.data?.link?.outputs && relation.sourceHandle) {
              const outputIndex = parseInt(relation.sourceHandle.replace('right-', '')) || 0;
              const output = sourceNode.data.link.outputs[outputIndex];
              if (output && output.desc && output.desc.trim() !== '') {
                edgeLabel = output.desc;
              }
            }

            // 创建ReactFlow边
            const reactFlowEdge: Edge = {
              id: `${relation.from}-${relation.to}`,
              source: relation.from,
              target: relation.to,
              type: 'default',
              // ====== 中文注释：使用保存的连接点信息 ======
              // 优先使用数据库中保存的连接点信息，如果没有则使用默认值
              sourceHandle: relation.sourceHandle || '',
              targetHandle: relation.targetHandle || '',
              // =============================
              // ====== 中文注释：使用统一的边样式配置 ======
              // 使用统一的样式配置，避免代码重复
              label: edgeLabel,
              style: {
                stroke: '#33C2EE',
                strokeWidth: 2
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
              // =============================
            };

            loadedEdges.push(reactFlowEdge);
          }
        }
        console.log('📊 [WorkflowContext] 准备设置节点状态:', {
          loadedNodesCount: loadedNodes.length,
          loadedEdgesCount: loadedEdges.length,
          loadedNodesIds: loadedNodes.map(n => n.id),
          loadedNodesDetailsMapKeys: Object.keys(loadedNodesDetailsMap)
        });

        setNodes(loadedNodes);
        setEdges(loadedEdges);

        // 清理 nodesDetailsMap，确保只包含实际存在的节点
        const existingNodeIds = new Set(loadedNodes.map(node => node.id));
        const cleanedNodesDetailsMap: Record<string, any> = {};
        Object.keys(loadedNodesDetailsMap).forEach(nodeId => {
          if (existingNodeIds.has(nodeId)) {
            cleanedNodesDetailsMap[nodeId] = loadedNodesDetailsMap[nodeId];
          }
        });

        setNodesDetailsMap(cleanedNodesDetailsMap);
        console.log('🏁 [WorkflowContext] 工作流加载完成:', { 
          loadedNodesCount: loadedNodes.length,
          loadedEdgesCount: loadedEdges.length,
          cleanedNodesDetailsMapKeys: Object.keys(cleanedNodesDetailsMap)
        });
        // 🧪 注意：不重置测试结果状态，保留用户的测试数据
      } else {
        // 如果数据库中没有数据，初始化为空的工作流
        setWorkflowId(workflowId);
        setWorkflowName('我的业务流');
        setNodes([]);
        setEdges([]);
        setNodesDetailsMap({});
        setNodesTestResultsMap({});
      }

    } catch (error) {
      console.error('加载工作流数据失败:', error);
      // 如果加载失败，初始化为空的工作流
      setWorkflowId(workflowId);
      setWorkflowName('我的业务流');
      setNodes([]);
      setEdges([]);
      setNodesDetailsMap({});
      setNodesTestResultsMap({});
    } finally {
      // 标记请求结束
      loadingRequestsRef.current.delete(workflowId);
      console.log('🏁 [WorkflowContext] 工作流加载请求结束:', workflowId);
    }
  }, []); // 空依赖数组，确保函数引用稳定，避免无限循环

  // 添加加载状态跟踪
  const [isLoading, setIsLoading] = useState(false);

  // 初始化时检查URL参数 - 修复循环依赖问题和竞态条件
  useEffect(() => {
    const urlWorkflowId = searchParams?.get('workflowID');
    console.log('🔍 [WorkflowContext] URL参数检查:', { urlWorkflowId, searchParams: Object.fromEntries(searchParams?.entries() || []), currentWorkflowId: workflowId, isLoading });
    
    if (urlWorkflowId && urlWorkflowId !== workflowId && !isLoading) {
      // 只有当URL中的ID与当前ID不同且不在加载中时才加载，避免无限循环和重复请求
      console.log('📥 [WorkflowContext] 开始加载工作流:', urlWorkflowId);
      setIsLoading(true);
      setWorkflowId(urlWorkflowId);
      
      // 清空当前状态，避免显示旧数据
      setNodes([]);
      setEdges([]);
      setNodesDetailsMap({});
      setNodesTestResultsMap({});
      
      loadWorkflowFromDatabase(urlWorkflowId)
        .then(() => {
          console.log('✅ [URL Check] 工作流加载成功');
        })
        .catch(error => {
          console.error('❌ [URL Check] 加载工作流失败:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!urlWorkflowId && !initializationRef.current.isInitialized) {
      // 如果没有ID且未初始化过，创建一个新的
      console.log('🆕 [WorkflowContext] 创建新的工作流');
      const newId = Array.from({ length: 16 }, () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return chars.charAt(Math.floor(Math.random() * chars.length));
      }).join('');
      
      // 更新初始化状态
      initializationRef.current.isInitialized = true;
      
      setWorkflowId(newId);
    }
  }, [searchParams, workflowId, loadWorkflowFromDatabase, isLoading]); // 添加 isLoading 依赖

  // 创建新工作流的方法
  const createNewWorkflow = () => {
    const newId = Array.from({ length: 16 }, () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join('');
    setWorkflowId(newId);
    setWorkflowName('我的业务流');
    setNodes([]);
    setEdges([]);
    setNodesDetailsMap({});
    setNodesTestResultsMap({});
    return newId; // 返回生成的ID
  };

  const updateNodeDetails = useCallback((nodeId: string, details: any) => {
    setNodesDetailsMap(prev => {
      const newMap = { ...prev };

      if (details === null) {
        // 如果 details 为 null，完全删除这个键
        delete newMap[nodeId];
      } else {
        // 否则设置或更新节点详情
        newMap[nodeId] = details;
      }

      return newMap;
    });
  }, [setNodesDetailsMap]);

  const updateNodeTestResult = useCallback((nodeId: string, rundata: any) => {
    // 🎯 直接存储 rundata 到 nodesTestResultsMap 中
    setNodesTestResultsMap(prev => {
      const newMap = {
        ...prev,
        [nodeId]: rundata
      };
      return newMap;
    });
  }, [setNodesTestResultsMap]);

  const clearAllTestResults = useCallback(() => {
    setNodesTestResultsMap({});
  }, [setNodesTestResultsMap]);

  // 清理孤立的节点详情数据（不对应任何实际节点的数据）
  const cleanOrphanedNodeDetails = useCallback(() => {
    const existingNodeIds = new Set(nodes.map(node => node.id));

    setNodesDetailsMap(prev => {
      const cleanedMap: Record<string, any> = {};

      Object.keys(prev).forEach(nodeId => {
        if (existingNodeIds.has(nodeId)) {
          cleanedMap[nodeId] = prev[nodeId];
        }
      });

      return cleanedMap;
    });
  }, [nodes, setNodesDetailsMap]);

  // 完整删除节点的统一方法
  const deleteNodeCompletely = useCallback((nodeId: string) => {
    const deletionTimestamp = Date.now();

    // 1. 立即删除节点详情（不延迟）
    setNodesDetailsMap(prev => {
      const newMap = { ...prev };

      if (newMap[nodeId]) {
        delete newMap[nodeId];
        return newMap;
      } else {
        return prev; // 如果节点不存在，返回原状态，避免不必要的重新渲染
      }
    });

    // 2. 立即删除测试结果
    setNodesTestResultsMap(prev => {
      const newMap = { ...prev };
      if (newMap[nodeId]) {
        delete newMap[nodeId];
        return newMap;
      } else {
        return prev;
      }
    });

    // 3. 立即清理相关的边
    setEdges(prevEdges => {
      const edgesToRemove = prevEdges.filter(edge =>
        edge.source === nodeId || edge.target === nodeId
      );

      if (edgesToRemove.length > 0) {
        const cleanedEdges = prevEdges.filter(edge =>
          edge.source !== nodeId && edge.target !== nodeId
        );
        return cleanedEdges;
      } else {
        return prevEdges;
      }
    });
  }, [setNodesDetailsMap, setNodesTestResultsMap, setEdges]);

  return (
    <WorkflowContext.Provider
      value={{
        nodes,
        edges,
        workflowId,
        workflowName,
        nodesDetailsMap,
        nodesTestResultsMap,
        isLoading,
        setNodes,
        setEdges,
        setWorkflowId,
        setWorkflowName,
        setNodesDetailsMap,
        updateNodeDetails,
        updateNodeTestResult,
        clearAllTestResults,
        cleanOrphanedNodeDetails,
        deleteNodeCompletely,
        createNewWorkflow,
        loadWorkflowFromDatabase
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}