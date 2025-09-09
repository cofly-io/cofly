// "use client";

// import React, { useState, useCallback, useRef, useEffect, useMemo, createContext, useContext } from 'react';
// import { ReactFlowProvider, useNodesState, useEdgesState, addEdge, Connection, Node, Edge } from 'reactflow';
// import styled, { useTheme } from 'styled-components';

// import { ContentArea, TabsContainer, Tab, WorkflowContainer, TestButtonContainer } from '@repo/ui';
// import { WorkflowMenu, WorkflowCanvas, WorkflowHeader } from '@repo/ui/main/flow';
// import { ToastManager, useToast } from '@repo/ui';

// // Services and Context
// import { testWorkflow } from '@/services/workflowTestService';
// import { debugNode } from '@/services/nodeDebugService';
// import { ConnectConfigService } from '@/services/connectConfigService';
// import { fetchDatabaseTables, type FetchTablesResponse } from '@/services/databaseService';
// import { useWorkflow } from '@/contexts/WorkflowContext';
// import { autoLayoutNodes, centerNodes, shouldTriggerAutoLayout } from '@repo/ui/main/flow';
// import { MdNotStarted } from "react-icons/md";
// // Styles
// import 'reactflow/dist/style.css';
// import { CoButton } from '@repo/ui/';

// // 创建独立的NodeCategories Context
// interface NodeCategoriesContextType {
//   nodeCategories: any[];
//   isLoading: boolean;
// }

// const NodeCategoriesContext = createContext<NodeCategoriesContextType>({
//   nodeCategories: [],
//   isLoading: true
// });

// // NodeCategories Provider - 独立管理节点分类数据
// const NodeCategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [nodeCategories, setNodeCategories] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { showError } = useToast();

//   // 只在组件挂载时加载一次节点分类数据
//   useEffect(() => {
//     const loadNodeCategories = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch('/api/nodes');
//         if (!response.ok) {
//           throw new Error('Failed to fetch nodes');
//         }
//         const data = await response.json();
//         setNodeCategories(data.dataSource || []);
//       } catch (error) {
//         console.error('节点分类数据加载失败:', error);
//         showError('加载失败', '无法加载节点分类数据');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadNodeCategories();
//   }, []); // 空依赖数组，只加载一次

//   // 使用 useMemo 确保稳定的引用
//   const memoizedValue = useMemo(() => ({
//     nodeCategories,
//     isLoading
//   }), [nodeCategories, isLoading]);

//   return (
//     <NodeCategoriesContext.Provider value={memoizedValue}>
//       {children}
//     </NodeCategoriesContext.Provider>
//   );
// };

// // Hook to use NodeCategories
// const useNodeCategories = () => {
//   const context = useContext(NodeCategoriesContext);
//   if (!context) {
//     throw new Error('useNodeCategories must be used within NodeCategoriesProvider');
//   }
//   return context;
// };

// // 独立的菜单组件 - 不依赖 WorkflowContext
// const IndependentWorkflowMenu: React.FC<{ onMenuCollapseChange?: (collapsed: boolean) => void }> = React.memo(({ onMenuCollapseChange }) => {
//   const { nodeCategories, isLoading } = useNodeCategories();

//   // 稳定的数据转换，避免不必要的重新渲染
//   const memoizedNodeCategories = useMemo(() => {
//     if (isLoading || !Array.isArray(nodeCategories) || nodeCategories.length === 0) return [];

//     // 深度克隆，确保稳定的引用
//     return nodeCategories.map((category: any) => ({
//       ...category,
//       nodes: Array.isArray(category.nodes) ? category.nodes.map((node: any) => ({ ...node })) : []
//     }));
//   }, [nodeCategories, isLoading]);

//   if (isLoading) {
//     return <div style={{ padding: '10px', fontSize: '13px', color: '#999' }}>工作流节点加载中....</div>;
//   }

//   return (
//     <WorkflowMenu
//       dataSource={memoizedNodeCategories}
//       onMenuCollapseChange={onMenuCollapseChange}
//     />
//   );
// });

// IndependentWorkflowMenu.displayName = 'IndependentWorkflowMenu';

// /**
//  * 递归获取所有前置节点
//  * @param nodeId 目标节点ID
//  * @param edges 边数据
//  * @param nodesDetailsMap 节点详情映射
//  * @param visited 已访问的节点集合，用于防止循环引用
//  * @returns 所有前置节点ID数组
//  */
// const getAllPreviousNodeIds = (
//   nodeId: string,
//   edges: Edge[],
//   nodesDetailsMap: Record<string, any>,
//   visited: Set<string> = new Set()
// ): string[] => {
//   // 防止循环引用
//   if (visited.has(nodeId)) {
//     return [];
//   }
//   visited.add(nodeId);

//   // 获取直接前置节点
//   const directPreviousNodeIds = edges
//     .filter(edge => edge.target === nodeId)
//     .map(edge => edge.source)
//     .filter(sourceId => Object.keys(nodesDetailsMap).includes(sourceId));

//   // 递归获取所有前置节点
//   const allPreviousNodeIds = new Set<string>();

//   for (const previousNodeId of directPreviousNodeIds) {
//     // 添加直接前置节点
//     allPreviousNodeIds.add(previousNodeId);

//     // 递归获取间接前置节点
//     const indirectPreviousNodeIds = getAllPreviousNodeIds(
//       previousNodeId,
//       edges,
//       nodesDetailsMap,
//       new Set(visited)
//     );

//     indirectPreviousNodeIds.forEach(id => allPreviousNodeIds.add(id));
//   }

//   return Array.from(allPreviousNodeIds);
// };

// // 统一边样式配置
// const EDGE_STYLE_CONFIG = {
//   style: {
//     stroke: '#878787',
//     strokeWidth: 1
//   },
//   labelStyle: {
//     fill: '#bfbfbf',
//     fontSize: 12,
//     fontWeight: 500
//   },
//   labelBgStyle: {
//     fill: '#333F50',
//     fillOpacity: 0.8,
//   }
// };

// const WorkflowPage = () => {
//   return (
//     <NodeCategoriesProvider>
//       <WorkflowPageContent />
//     </NodeCategoriesProvider>
//   );
// };

// const WorkflowPageContent = () => {
//   const [isActive, setIsActive] = useState(false);
//   const [activeTab, setActiveTab] = useState('editor');
//   const [isTestingWorkflow, setIsTestingWorkflow] = useState(false);
//   const [menuCollapsed, setMenuCollapsed] = useState(false);

//   // 保存当前画布的最新状态
//   const [currentCanvasNodes, setCurrentCanvasNodes] = useState<Node[]>([]);
//   const [currentCanvasEdges, setCurrentCanvasEdges] = useState<Edge[]>([]);

//   // 复制粘贴逻辑已移到WorkflowEditor中

//   const {
//     nodes,
//     edges,
//     workflowId,
//     workflowName,
//     setWorkflowName,
//     nodesDetailsMap,
//     nodesTestResultsMap,
//     updateNodeTestResult
//   } = useWorkflow();

//   // 添加调试日志，监控数据变化
//   useEffect(() => {
//     console.log('🎨 [Flow Page] 工作流数据更新:', {
//       workflowId,
//       workflowName,
//       nodesLength: nodes.length,
//       edgesLength: edges.length,
//       nodesDetailsMapKeys: Object.keys(nodesDetailsMap),
//       nodesTestResultsMapKeys: Object.keys(nodesTestResultsMap),
//       nodes: nodes.map(n => ({
//         id: n.id,
//         type: n.type,
//         position: n.position,
//         data: n.data
//       })),
//       edges: edges.map(e => ({
//         id: e.id,
//         source: e.source,
//         target: e.target,
//         sourceHandle: e.sourceHandle,
//         targetHandle: e.targetHandle
//       }))
//     });
//   }, [workflowId, workflowName, nodes, edges, nodesDetailsMap, nodesTestResultsMap]);

//   // Toast 管理
//   const {
//     toasts,
//     removeToast,
//     showError,
//     showSuccess,
//     showWarning
//   } = useToast();

//   /**
//   * 保存工作流到数据库
//   * 将画布上的节点和边数据序列化并保存到后端
//   */
//   const handleSave = async () => {
//     try {
//       if (!workflowId) {
//         showError('出错:', '工作流ID不存在，无法保存');
//         return;
//       }

//       const nodesToSave = [];
//       const edgesToSave = [];

//       // 使用最新的画布状态而不是context状态
//       const nodesToProcess = currentCanvasNodes.length > 0 ? currentCanvasNodes : nodes;
//       const edgesToProcess = currentCanvasEdges.length > 0 ? currentCanvasEdges : edges;


//       for (const node of nodesToProcess) {
//         const nodeInstanceId = node.id;
//         const nodeDetails = nodesDetailsMap[nodeInstanceId];

//         if (nodeDetails) {
//           const nodeToSave: any = {
//             id: nodeInstanceId,
//             kind: nodeDetails.originalNodeKind || node.data?.kind || 'unknown',
//             type: node.type || 'triggerNode',
//             position: node.position || { x: 0, y: 0 },
//             inputs: nodeDetails.savedValues || {},
//             link: node.data?.link || null,
//             lastTestResult: nodeDetails.lastTestResult || null,
//           };
//           nodesToSave.push(nodeToSave);
//           console.log('✅ [Save Debug] 成功添加节点:', nodeInstanceId);
//         } else {
//           console.log('❌ [Save Debug] 跳过节点 (无nodeDetails):', nodeInstanceId);
//         }
//       }

//       // 获取相关的边数据
//       const configuredNodeIds = nodesToSave.map(node => node.id);
//       console.log('🔍 [Save Debug] configuredNodeIds:', configuredNodeIds);

//       // 找出第一个节点（没有其他边指向它的节点）
//       const firstNodeId = configuredNodeIds.find(nodeId =>
//         !edgesToProcess.some(edge => edge.target === nodeId && configuredNodeIds.includes(edge.source))
//       );
//       console.log('🔍 [Save Debug] firstNodeId:', firstNodeId);

//       // 如果存在第一个节点，添加从 $source 到第一个节点的边
//       if (firstNodeId) {
//         edgesToSave.push({
//           to: firstNodeId,
//           from: "$source"
//         });
//         console.log('✅ [Save Debug] 添加起始边: $source ->', firstNodeId);
//       }

//       // 添加节点之间的连接边
//       for (const edge of edgesToProcess) {
//         console.log('🔍 [Save Debug] 检查边:', edge.source, '->', edge.target);

//         if (configuredNodeIds.includes(edge.source) && configuredNodeIds.includes(edge.target)) {
//           const edgeToSave: any = {
//             to: edge.target,
//             from: edge.source,
//             sourceHandle: edge.sourceHandle || '',
//             targetHandle: edge.targetHandle || '',
//             label: edge.label || ''
//           };

//           // 检查源节点是否有 subflow 输出
//           const sourceNode = nodesToProcess.find((node: any) => node.id === edge.source);
//           if (sourceNode?.data?.link?.outputs) {
//             const sourceHandleIndex = edge.sourceHandle ? parseInt(edge.sourceHandle.replace('right-', '')) : 0;
//             const sourceOutput = sourceNode.data.link.outputs[sourceHandleIndex];

//             if (sourceOutput?.subflow === true) {
//               if (sourceOutput.desc === '循环') {
//                 edgeToSave.subflow = 'loop';
//               } else {
//                 edgeToSave.subflow = 'subflow';
//               }
//             }
//           }

//           edgesToSave.push(edgeToSave);
//           console.log('✅ [Save Debug] 成功添加边:', edge.source, '->', edge.target);
//         } else {
//           console.log('❌ [Save Debug] 跳过边 (节点不在配置列表中):', edge.source, '->', edge.target);
//         }
//       }

//       const response = await fetch('/api/workflow-config', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           workflowId,
//           workflowName,
//           nodesToSave,
//           edgesToSave,
//           createUser: 'default_user'
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         console.log('保存成功:', result.data);
//         showSuccess('成功', '工作流保存成功！');
//       } else {
//         throw new Error(result.error || '保存失败');
//       }

//     } catch (error) {
//       showError('出错:', error instanceof Error ? error.message : '未知错误');
//       //alert('保存工作流时出错，请重试');
//     }
//   };

//   const handleShare = () => {
//     console.log('分享流程');
//   };

//   /**
//    * 复制工作流到剪贴板
//    * 序列化当前画布数据为 JSON 格式并复制到剪贴板
//    */
//   // 处理画布状态变化的回调
//   const handleCanvasStateChange = useCallback((nodes: Node[], edges: Edge[]) => {
//     setCurrentCanvasNodes(nodes);
//     setCurrentCanvasEdges(edges);
//   }, []);

//   // 创建一个获取当前画布状态的函数
//   const getCurrentCanvasData = useCallback(() => {
//     return {
//       nodes: currentCanvasNodes,
//       edges: currentCanvasEdges
//     };
//   }, [currentCanvasNodes, currentCanvasEdges]);

//   const handleCopyToClipboard = async () => {
//     try {
//       const canvasData = getCurrentCanvasData();

//       // 使用最新的画布数据而不是 context 数据
//       const workflowData = exportWorkflowData(canvasData.edges);
//       await navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
//       showSuccess('成功', '工作流已复制到剪贴板');
//     } catch (error) {
//       showError('出错:', '复制到剪贴板失败');
//       console.error('复制到剪贴板失败:', error);
//     }
//   };

//   /**
//    * 导出工作流为 JSON 文件
//    */
//   const handleExportJSON = () => {
//     try {
//       const canvasData = getCurrentCanvasData();
//       console.log('💾 [Export] 开始导出，canvas edges长度:', canvasData.edges.length);
//       console.log('💾 [Export] context edges长度:', edges.length);

//       // 使用最新的画布数据而不是 context 数据
//       const workflowData = exportWorkflowData(canvasData.edges);
//       const dataStr = JSON.stringify(workflowData, null, 2);
//       const dataBlob = new Blob([dataStr], { type: 'application/json' });

//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(dataBlob);
//       link.download = `${workflowName || '工作流'}.json`;
//       link.click();

//       showSuccess('成功', 'JSON 文件已导出');
//     } catch (error) {
//       showError('出错:', '导出 JSON 文件失败');
//       console.error('导出 JSON 文件失败:', error);
//     }
//   };

//   /**
//    * 导出工作流数据
//    * 将当前画布的节点和边数据序列化为可传输的格式
//    */
//   const exportWorkflowData = (currentEdges?: Edge[]) => {
//     // 使用传入的边数据，如果没有则使用本地的edges
//     const edgesToUse = currentEdges || edges;
//     const nodesToExport = [];
//     const edgesToExport = [];

//     console.log('📤 [Export] 开始导出，nodesDetailsMap 键:', Object.keys(nodesDetailsMap));
//     console.log('📤 [Export] 当前 nodes 数量:', nodes.length);
//     console.log('📤 [Export] 当前 edges 数量:', edges.length);

//     // 导出节点数据
//     for (const [nodeInstanceId, nodeDetails] of Object.entries(nodesDetailsMap)) {
//       console.log('🔍 [Export] 检查节点:', nodeInstanceId, '有nodeDetails:', !!nodeDetails);

//       if (nodeDetails && nodeDetails.nodeInfo) {
//         const nodeInfo = nodeDetails.nodeInfo;
//         const nodeToExport: any = {
//           id: nodeInstanceId,
//           kind: nodeDetails.originalNodeKind || nodeInfo.data?.kind || 'unknown',
//           type: nodeInfo.type || 'triggerNode',
//           position: nodeInfo.position || { x: 0, y: 0 },
//           inputs: nodeDetails.savedValues || {},
//           data: {
//             kind: nodeInfo.data?.kind,
//             name: nodeInfo.data?.name || nodeInstanceId,
//             description: nodeInfo.data?.description || '',
//             icon: nodeInfo.data?.icon,
//             category: nodeInfo.data?.category,
//             categories: nodeInfo.data?.categories || [],
//             version: nodeInfo.data?.version || '1.0.0',
//             link: nodeInfo.data?.link || null,
//             nodeWidth: nodeInfo.data?.nodeWidth
//           }
//         };
//         nodesToExport.push(nodeToExport);
//         console.log('✅ [Export] 导出节点:', nodeInstanceId);
//       } else {
//         console.log('❌ [Export] 跳过节点:', nodeInstanceId, '缺少nodeDetails或nodeInfo');
//       }
//     }

//     // 获取相关的边数据
//     const configuredNodeIds = nodesToExport.map(node => node.id);

//     console.log('🔗 [Export] 配置的节点IDs:', configuredNodeIds);
//     console.log('🔗 [Export] 当前边数量:', edgesToUse.length);

//     // 添加节点之间的连接边
//     for (const edge of edgesToUse) {
//       if (configuredNodeIds.includes(edge.source) && configuredNodeIds.includes(edge.target)) {
//         const edgeToExport: any = {
//           id: edge.id,
//           source: edge.source,
//           target: edge.target,
//           sourceHandle: edge.sourceHandle || 'right-0',
//           targetHandle: edge.targetHandle || 'left-0',
//           label: edge.label || ''
//         };

//         // 检查源节点是否有 subflow 输出
//         const sourceNode = nodes.find((node: any) => node.id === edge.source);
//         if (sourceNode?.data?.link?.outputs) {
//           const sourceHandleIndex = edge.sourceHandle ? parseInt(edge.sourceHandle.replace('right-', '')) : 0;
//           const sourceOutput = sourceNode.data.link.outputs[sourceHandleIndex];

//           if (sourceOutput?.subflow === true) {
//             if (sourceOutput.desc === '循环') {
//               edgeToExport.subflow = 'loop';
//             } else {
//               edgeToExport.subflow = 'subflow';
//             }
//           }
//         }

//         edgesToExport.push(edgeToExport);
//       }
//     }

//     return {
//       metadata: {
//         workflowName: workflowName || '工作流',
//         workflowId,
//         exportedAt: new Date().toISOString(),
//         version: '1.0.0'
//       },
//       nodes: nodesToExport,
//       edges: edgesToExport
//     };
//   };

//   const handleMoreOptions = () => {
//     console.log('更多选项');
//   };

//   const handleAddTag = () => {
//     console.log('添加标签');
//   };

//   const handleEditorTabClick = () => {
//     setActiveTab('editor');
//   };

//   const handleExecutionsTabClick = () => {
//     setActiveTab('executions');
//   };

//   /**
//    * 测试整个工作流
//    * 触发后端执行工作流并返回测试结果
//    */
//   const handleWorkflowTest = async () => {
//     if (!workflowId) {
//       showError('出错:', '工作流ID不存在，无法测试');
//       return;
//     }

//     setIsTestingWorkflow(true);

//     try {
//       const result = await testWorkflow(workflowId);
//       showSuccess(`成功`, `工作流测试成功！\n返回结果: ${JSON.stringify(result, null, 2)}`);
//     } catch (error) {
//       showError('出错:', error instanceof Error ? error.message : '未知错误');
//     } finally {
//       setIsTestingWorkflow(false);
//     }
//   };

//   const handleMenuCollapseChange = useCallback((collapsed: boolean) => {
//     setMenuCollapsed(collapsed);
//   }, []);

//   // ================ 连接配置管理 ================
//   /**
//    * 动态获取连接配置的回调函数
//    * 当NodeSettings检测到selectlistdesc控件时调用
//    */
//   const handleFetchConnectConfigs = useCallback(async (ctype?: string) => {
//     try {
//       console.log('🔗 [ConnectConfigs] 开始获取连接配置:', { ctype });

//       const result = await ConnectConfigService.getConnectConfigs({ ctype });

//       if (result.success) {
//         // 转换数据格式以匹配UI层期望的格式
//         const transformedConfigs = result.data.map(config => ({
//           id: config.id || '',
//           name: config.name,
//           ctype: config.ctype,
//           nodeinfo: config.config, // 将config字段映射为nodeinfo
//           // description: config.description || `${config.ctype} 连接 - ${config.name}`
//         }));

//         console.log('✅ [ConnectConfigs] 成功获取连接配置:', {
//           ctype,
//           count: transformedConfigs.length,
//           configs: transformedConfigs
//         });

//         return transformedConfigs;
//       } else {
//         console.warn('⚠️ [ConnectConfigs] 获取连接配置失败:', result.error);
//         showWarning('获取连接配置失败', result.error || '未知错误');
//         return [];
//       }
//     } catch (error) {
//       console.error('❌ [ConnectConfigs] 获取连接配置时出错:', error);
//       showError('连接配置错误', error instanceof Error ? error.message : '获取连接配置失败');
//       return [];
//     }
//   }, [showError, showWarning]);

//   /**
//    * 动态获取数据库表名的回调函数
//    * 当用户选择数据源后调用，获取该数据源下的所有表名
//    */
//   const handleFetchTables = useCallback(async (datasourceId: string, search?: string): Promise<FetchTablesResponse> => {
//     console.log('📋 [Tables] 开始获取表名:', { datasourceId, search });

//     try {
//       const result = await fetchDatabaseTables(datasourceId, search);

//       console.log('✅ [Tables] 成功获取表名:', {
//         datasourceId,
//         search,
//         count: result.tableOptions.length,
//         tables: result.tableOptions
//       });

//       return result;
//     } catch (error) {
//       console.error('❌ [Tables] 获取表名时出错:', error);
//       showError('获取表名失败', error instanceof Error ? error.message : '未知错误');

//       return {
//         loading: false,
//         error: error instanceof Error ? error.message : '获取表名失败',
//         tableOptions: []
//       };
//     }
//   }, [showError]);

//   // 创建一个函数来获取最新的nodesTestResultsMap状态
//   const nodesTestResultsMapRef = useRef(nodesTestResultsMap);
//   nodesTestResultsMapRef.current = nodesTestResultsMap;

//   const getLatestNodesTestResultsMap = useCallback(() => {
//     return nodesTestResultsMapRef.current;
//   }, []);

//   return (
//     <>
//       <WorkflowHeader
//         workflowId={workflowId || 'errorWorkflowId'}
//         workflowName={workflowName}
//         onWorkflowNameChange={setWorkflowName}
//         isActive={isActive}
//         onActiveChange={setIsActive}
//         onSave={handleSave}
//         onShare={handleShare}
//         onMoreOptions={handleMoreOptions}
//         onAddTag={handleAddTag}
//         onCopyToClipboard={handleCopyToClipboard}
//         onExportJSON={handleExportJSON}
//       />

//       <TabsContainer>
//         <Tab $active={activeTab === 'editor'} onClick={handleEditorTabClick}>
//           业务设计
//         </Tab>
//         <Tab $active={activeTab === 'executions'} onClick={handleExecutionsTabClick}>
//           执行记录
//         </Tab>
//       </TabsContainer>

//       <ContentArea style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
//         {activeTab === 'editor' ? (
//           <ReactFlowProvider>
//             <WorkflowEditor
//               onMenuCollapseChange={handleMenuCollapseChange}
//               showError={showError}
//               showWarning={showWarning}
//               onCanvasStateChange={handleCanvasStateChange}
//               onFetchConnectConfigs={handleFetchConnectConfigs}
//               onFetchTables={handleFetchTables}
//             />
//           </ReactFlowProvider>
//         ) : (
//           <div style={{ padding: '20px' }}>
//             <h2>执行记录</h2>
//             <p>工作流执行历史记录将在这里显示。</p>
//           </div>
//         )}
//       </ContentArea>

//       <TestButtonContainer $menuCollapsed={menuCollapsed}>
//         <CoButton
//           onClick={handleWorkflowTest}
//           disabled={isTestingWorkflow || !workflowId}
//         >
//           <MdNotStarted size={16} />
//           {isTestingWorkflow ? '测试中...' : '业务流测试'}
//         </CoButton>
//       </TestButtonContainer>

//       {/* Toast 管理器 */}
//       <ToastManager toasts={toasts} onRemove={removeToast} />
//     </>
//   );
// };

// const WorkflowEditor = React.memo(({
//   onMenuCollapseChange,
//   showError,
//   showWarning,
//   onCanvasStateChange,
//   onFetchConnectConfigs,
//   onFetchTables
// }: {
//   onMenuCollapseChange: (collapsed: boolean) => void;
//   showError: (title: string, message: string) => void;
//   showWarning: (title: string, message: string) => void;
//   onCanvasStateChange?: (nodes: Node[], edges: Edge[]) => void;
//   onFetchConnectConfigs?: (ctype?: string) => Promise<Array<{
//     id: string;
//     name: string;
//     ctype: string;
//     mtype: string;
//     nodeinfo: Record<string, any>;
//     description?: string;
//   }>>;
//   onFetchTables?: (datasourceId: string, search?: string) => Promise<FetchTablesResponse>;
// }) => {
//   const reactFlowWrapper = useRef<HTMLDivElement>(null);
//   const theme = useTheme();

//   const {
//     nodes,
//     edges,
//     workflowId,
//     nodesDetailsMap,
//     nodesTestResultsMap,
//     updateNodeDetails,
//     updateNodeTestResult,
//     deleteNodeCompletely
//   } = useWorkflow();

//   // 创建一个函数来获取最新的nodesTestResultsMap状态
//   const nodesTestResultsMapRef = useRef(nodesTestResultsMap);
//   nodesTestResultsMapRef.current = nodesTestResultsMap;

//   const getLatestNodesTestResultsMap = useCallback(() => {
//     return nodesTestResultsMapRef.current;
//   }, []);

//   const [nodesState, setNodesState, onNodesChange] = useNodesState(nodes);
//   const [edgesState, setEdgesState, onEdgesChange] = useEdgesState(edges);
//   const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);
//   const [nodeTestOutput, setNodeTestOutput] = useState<string>('');

//   // 🔧 关键修复1：当工作流ID变化时强制重置状态
//   const [lastWorkflowId, setLastWorkflowId] = useState<string | null>(null);

//   useEffect(() => {
//     if (workflowId && workflowId !== lastWorkflowId) {
//       console.log('🔄 [Reset] 工作流ID变化，重置ReactFlow状态:', {
//         oldId: lastWorkflowId,
//         newId: workflowId
//       });

//       // 强制重置状态
//       setNodesState([]);
//       setEdgesState([]);
//       setLastWorkflowId(workflowId);
//     }
//   }, [workflowId, lastWorkflowId, setNodesState, setEdgesState]);

//   // 🔧 关键修复2：仅在数据库加载时同步Context数据到ReactFlow状态
//   useEffect(() => {
//     console.log('🔄 [Sync] 检查Context数据同步需求:', {
//       contextNodes: nodes.length,
//       contextEdges: edges.length,
//       currentNodesState: nodesState.length,
//       currentEdgesState: edgesState.length
//     });

//     // 只有当Context有数据且ReactFlow为空时才同步（数据库加载场景）
//     // 不要在Context为空时清空ReactFlow（避免干扰拖拽等操作）
//     if (nodes.length > 0 && nodesState.length === 0) {
//       console.log('🔄 [Sync] 从数据库同步节点数据:', nodes);
//       setNodesState(nodes);
//     }

//     if (edges.length > 0 && edgesState.length === 0) {
//       console.log('🔄 [Sync] 从数据库同步边数据:', edges);
//       setEdgesState(edges);
//     }

//     // 特殊情况：如果Context数据和ReactFlow数据ID完全不匹配，可能是切换了工作流
//     if (nodes.length > 0 && nodesState.length > 0) {
//       const contextNodeIds = new Set(nodes.map(n => n.id));
//       const reactFlowNodeIds = new Set(nodesState.map(n => n.id));
//       const hasCommonNodes = [...contextNodeIds].some(id => reactFlowNodeIds.has(id));

//       if (!hasCommonNodes) {
//         console.log('🔄 [Sync] 检测到工作流切换，更新ReactFlow状态');
//         setNodesState(nodes);
//         setEdgesState(edges);
//       }
//     }
//   }, [nodes, edges, nodesState.length, edgesState.length, setNodesState, setEdgesState]);

//   // 调试：监控WorkflowEditor中的节点状态
//   useEffect(() => {
//     console.log('🖼️ [WorkflowEditor] 状态更新:', {
//       contextNodes: nodes.length,
//       contextEdges: edges.length,
//       nodesStateLength: nodesState.length,
//       edgesStateLength: edgesState.length,
//       nodesState: nodesState.map(n => ({ id: n.id, type: n.type, position: n.position })),
//       edgesState: edgesState.map(e => ({ id: e.id, source: e.source, target: e.target }))
//     });
//   }, [nodes, edges, nodesState, edgesState]);

//   // 第七步：在WorkflowEditor中添加复制状态和逻辑
//   const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
//   const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

//   // 删除历史记录机制 - 跟踪最近删除的节点ID，防止重用
//   const [deletedNodeHistory, setDeletedNodeHistory] = useState<Set<string>>(new Set());

//   /**
//    * 左侧面板节点测试 - 在 WorkflowEditor 中实现，可以访问正确的状态
//    */
//   const handleLeftPanelNodeTest = useCallback(async (nodeValues: Record<string, any>, nodeInstanceId: string) => {
//     try {
//       // console.log('🚀 [LeftPanelNodeTest] Starting test for:', {
//       //   nodeInstanceId,
//       //   nodeValues: Object.keys(nodeValues),
//       //   nodesDetailsMapKeys: Object.keys(nodesDetailsMap),
//       //   hasNodeDetails: !!nodesDetailsMap[nodeInstanceId],
//       //   edgesStateLength: edgesState.length,
//       //   nodesStateLength: nodesState.length
//       // });

//       // 从 nodesDetailsMap 获取节点详情（与 handleNodeTest 保持一致）
//       const nodeDetails = nodesDetailsMap[nodeInstanceId];
//       if (!nodeDetails || !nodeDetails.nodeInfo) {
//         console.error('❌ [LeftPanelNodeTest] 找不到对应的节点详情:', nodeInstanceId);
//         showError('节点错误', `找不到对应的节点: "${nodeInstanceId}"`);
//         return;
//       }

//       const node = nodeDetails.nodeInfo;
//       const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

//       // 检查节点是否已配置 - 这里使用传入的 nodeValues
//       if (!nodeValues || Object.keys(nodeValues).length === 0) {
//         showWarning('配置缺失', '前一个节点没有进行配置，无法执行');
//         return;
//       }

//       // 实现独立的调试逻辑，与 handleNodeTest 保持一致
//       const latestNodesTestResultsMap = getLatestNodesTestResultsMap();

//       // 检查并提取所有模板变量和 nodeId 引用
//       const inputsString = JSON.stringify(nodeValues);
//       const templateVariableRegex = /\{\{\s*\$\.([^.\s}]+)/g;
//       const directNodeIdRegex = /\$\.([^.\s}]+)\.?/g;

//       const templateNodeIds = [];
//       const directNodeIds = [];
//       let match;

//       while ((match = templateVariableRegex.exec(inputsString)) !== null) {
//         templateNodeIds.push(match[1]);
//       }
//       while ((match = directNodeIdRegex.exec(inputsString)) !== null) {
//         directNodeIds.push(match[1]);
//       }

//       const allExtractedNodeIds = [...new Set([...templateNodeIds, ...directNodeIds])];
//       const hasTemplateVariables = allExtractedNodeIds.length > 0;

//       // 获取前置节点列表
//       const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);

//       // 构造调试请求 - 包含所有相关的节点
//       const actions = [];

//       // 添加所有前置节点到actions
//       previousNodeIds.forEach(prevNodeId => {
//         const prevNodeDetails = nodesDetailsMap[prevNodeId];
//         if (prevNodeDetails && prevNodeDetails.nodeInfo) {
//           const prevNode = prevNodeDetails.nodeInfo;
//           actions.push({
//             id: prevNodeId,
//             inputs: {
//               ...(prevNodeDetails.savedValues || {}),
//               id: prevNodeId
//             },
//             kind: prevNodeDetails.originalNodeKind || prevNode.data.kind,
//             nodeName: prevNode.data.name || prevNodeId,
//             position: prevNode.position,
//             type: prevNode.type || 'triggerNode'
//           });
//         }
//       });

//       // 添加当前测试节点
//       actions.push({
//         id: nodeInstanceId,
//         inputs: { ...nodeValues, id: nodeInstanceId },
//         kind: nodeKind,
//         nodeName: node.data.name || nodeInstanceId,
//         position: node.position,
//         type: node.type || 'triggerNode'
//       });

//       // 构建edges - 包含完整的连接关系
//       const edges = [];
//       const allNodeIds = [...previousNodeIds, nodeInstanceId];

//       // 找到第一个节点（没有前置节点的节点）
//       const firstNodeId = allNodeIds.find(nodeId =>
//         !edgesState.some(edge => edge.target === nodeId && allNodeIds.includes(edge.source))
//       );

//       // 从$source到第一个节点的连接
//       if (firstNodeId) {
//         edges.push({
//           from: "$source",
//           to: firstNodeId
//         });
//       }

//       // 添加节点之间的连接
//       edgesState.forEach(edge => {
//         if (allNodeIds.includes(edge.source) && allNodeIds.includes(edge.target)) {
//           edges.push({
//             from: edge.source,
//             to: edge.target,
//             sourceHandle: edge.sourceHandle || 'right-0',
//             targetHandle: edge.targetHandle || 'left-0',
//             label: edge.label || ''
//           });
//         }
//       });

//       const debugRequest: any = {
//         actions,
//         edges
//       };

//       // 如果包含模板变量，添加state字段
//       if (hasTemplateVariables) {
//         const state: Record<string, any> = {};
//         previousNodeIds.forEach(prevNodeId => {
//           const prevNodeTestResult = latestNodesTestResultsMap[prevNodeId];
//           if (prevNodeTestResult) {
//             state[prevNodeId] = prevNodeTestResult;
//           }
//         });
//         debugRequest.state = state;
//       }

//       console.log('📤 [LeftPanelNodeTest] Final debug request:', debugRequest);

//       const result = await debugNode(debugRequest, true);

//       // 从完整结果中提取当前节点的测试结果
//       const fullTestResult = result.runData[0];
//       const testResult = fullTestResult[nodeInstanceId] || fullTestResult;

//       // 🎯 直接存储 rundata 到 nodesTestResultsMap 中
//       updateNodeTestResult(nodeInstanceId, testResult);

//     } catch (error) {
//       console.error('❌ [LeftPanelNodeTest] Execution failed:', error);

//       // 失败情况下创建简单的错误对象
//       const testResult = {
//         error: '节点执行失败',
//         timestamp: new Date().toISOString()
//       };

//       // 🎯 直接存储 rundata 到 nodesTestResultsMap 中
//       updateNodeTestResult(nodeInstanceId, testResult);
//     }
//   }, [nodesDetailsMap, showError, showWarning, edgesState, nodesState, getLatestNodesTestResultsMap, updateNodeTestResult]);

//   /**
//    * 生成唯一的节点ID
//    */
//   /**
// * 生成唯一的节点ID（基于同类节点最大序号+1）
// * 在nodesDetailsMap中寻找同类节点最大的序号，然后给序号+1生成新node
// */
//   const generateUniqueNodeId = useCallback((baseName: string, excludeIds: string[] = [], nodeKind?: string) => {
//     // 获取当前画布上所有节点的ID
//     const existingNames = nodesState.map(node => node.id).filter(id => !excludeIds.includes(id));

//     // 创建不可用ID集合（包括现有ID、排除ID和删除历史）
//     const unavailableIds = new Set([
//       ...existingNames,
//       ...excludeIds,
//       ...deletedNodeHistory
//     ]);

//     // 在nodesDetailsMap中寻找同类节点的最大序号
//     const sameTypeNodes = Object.entries(nodesDetailsMap).filter(([nodeId, nodeDetails]) => {
//       // 优先使用传入的nodeKind，否则使用baseName作为类型判断
//       const targetKind = nodeKind || baseName;
//       const nodeKindToCompare = nodeDetails.originalNodeKind || nodeDetails.nodeInfo?.data?.kind;
//       return nodeKindToCompare === targetKind && !excludeIds.includes(nodeId);
//     });

//     console.log('🔍 [ID Generation] Found same type nodes:', {
//       baseName,
//       nodeKind,
//       sameTypeNodesCount: sameTypeNodes.length,
//       sameTypeNodeIds: sameTypeNodes.map(([id]) => id)
//     });

//     // 提取所有同类节点ID中的数字序号
//     const existingNumbers: number[] = [];

//     sameTypeNodes.forEach(([nodeId]) => {
//       if (nodeId === baseName) {
//         // 如果存在基础名称（没有数字后缀），认为是序号1
//         existingNumbers.push(1);
//       } else if (nodeId.startsWith(baseName)) {
//         // 提取baseName后的数字部分
//         const suffix = nodeId.substring(baseName.length);
//         const number = parseInt(suffix, 10);
//         if (!isNaN(number) && number > 0) {
//           existingNumbers.push(number);
//         }
//       }
//     });

//     // 如果没有找到任何同类节点，从1开始
//     if (existingNumbers.length === 0) {
//       const candidateId = baseName;
//       if (!unavailableIds.has(candidateId)) {
//         console.log('🆔 [ID Generation] No same type nodes, using base name:', baseName);
//         return candidateId;
//       }
//     }

//     // 找到最大序号，然后+1
//     const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
//     let nextNumber = maxNumber + 1;
//     let candidateId = nextNumber === 1 ? baseName : `${baseName}${nextNumber}`;

//     // 确保生成的ID不在不可用列表中
//     while (unavailableIds.has(candidateId)) {
//       nextNumber++;
//       candidateId = `${baseName}${nextNumber}`;
//     }

//     return candidateId;
//   }, [nodesState, deletedNodeHistory, nodesDetailsMap]);

//   // 复制处理函数 - 支持批量复制nodes和edges
//   const handleCopyNodes = useCallback((selectedNodes: Node[]) => {
//     if (selectedNodes.length > 0) {
//       setCopiedNodes(selectedNodes);

//       // 获取选中nodes之间的edges
//       const selectedNodeIds = selectedNodes.map(node => node.id);
//       const selectedEdges = edgesState.filter(edge =>
//         selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
//       );

//       setCopiedEdges(selectedEdges);
//     }
//   }, [edgesState]);

//   // 粘贴处理函数 - 支持批量粘贴nodes和edges
//   const handlePasteNodes = useCallback((position?: { x: number; y: number }) => {
//     if (copiedNodes.length === 0) {
//       return;
//     }

//     const pasteOffset = 50;
//     const newNodes: Node[] = [];
//     const oldToNewIdMap: Record<string, string> = {};

//     // 首先创建所有新节点并建立ID映射
//     const usedNewIds: string[] = []; // 记录已使用的新ID

//     copiedNodes.forEach((originalNode: Node, index: number) => {
//       let baseName = originalNode.data.name || originalNode.id;

//       // 从原始节点详情中获取nodeKind
//       const copiedNodeDetails = nodesDetailsMap[originalNode.id];
//       const nodeKind = copiedNodeDetails?.originalNodeKind || originalNode.data.kind;

//       // 如果baseName以数字结尾，去除数字后缀以获得真正的基础名称
//       // 例如："js命令2" -> "js命令"，"manual3" -> "manual"
//       const baseNameMatch = baseName.match(/^(.+?)(\d+)$/);
//       if (baseNameMatch) {
//         baseName = baseNameMatch[1];
//       }

//       const newId = generateUniqueNodeId(baseName, usedNewIds, nodeKind);
//       usedNewIds.push(newId); // 将新ID加入已使用列表
//       oldToNewIdMap[originalNode.id] = newId;

//       const newPosition = position
//         ? {
//           x: position.x + (index * pasteOffset),
//           y: position.y + (index * pasteOffset)
//         }
//         : {
//           x: originalNode.position.x + pasteOffset,
//           y: originalNode.position.y + pasteOffset
//         };

//       const newNode: Node = {
//         ...originalNode,
//         id: newId,
//         position: newPosition,
//         selected: false,
//         data: {
//           ...originalNode.data,
//           name: newId,
//         },
//       };

//       newNodes.push(newNode);

//       // 复制节点详情
//       const nodeDetailsToClone = nodesDetailsMap[originalNode.id];
//       if (nodeDetailsToClone) {
//         const newNodeDetails = {
//           ...nodeDetailsToClone,
//           nodeInfo: newNode
//         };
//         updateNodeDetails(newId, newNodeDetails);
//       }
//     });

//     // 然后创建新的edges，使用新的节点ID
//     const newEdges: Edge[] = [];
//     copiedEdges.forEach((originalEdge: Edge) => {
//       const newSourceId = oldToNewIdMap[originalEdge.source];
//       const newTargetId = oldToNewIdMap[originalEdge.target];

//       if (newSourceId && newTargetId) {
//         const newEdge: Edge = {
//           ...originalEdge,
//           id: `${newSourceId}-${newTargetId}`,
//           source: newSourceId,
//           target: newTargetId,
//           selected: false,
//         };
//         newEdges.push(newEdge);
//       }
//     });

//     // 添加新节点和边到画布
//     setNodesState(prevNodes => [...prevNodes, ...newNodes]);
//     if (newEdges.length > 0) {
//       setEdgesState(prevEdges => [...prevEdges, ...newEdges]);
//     }
//   }, [copiedNodes, copiedEdges, generateUniqueNodeId, setNodesState, setEdgesState, nodesDetailsMap, updateNodeDetails]);

//   /**
//    * 从剪贴板导入工作流
//    * 解析剪贴板中的 JSON 数据并创建节点和边
//    */
//   const handleImportFromClipboard = useCallback(async (clipboardData: string) => {
//     try {
//       const workflowData = JSON.parse(clipboardData);

//       // 验证数据格式
//       if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
//         throw new Error('无效的工作流数据格式');
//       }

//       // 清空当前画布（可选，根据需求调整）
//       const shouldClearCanvas = confirm('是否清空当前画布并导入新的工作流？\n点击"取消"将在当前画布上追加导入。');

//       if (shouldClearCanvas) {
//         // 清空现有数据
//         Object.keys(nodesDetailsMap).forEach(nodeId => {
//           deleteNodeCompletely(nodeId);
//         });
//         setNodesState([]);
//         setEdgesState([]);
//       }

//       // 创建ID映射，避免冲突
//       const oldToNewIdMap: Record<string, string> = {};
//       const usedNewIds: string[] = shouldClearCanvas ? [] : nodesState.map((n: any) => n.id);

//       // 首先处理节点
//       const newNodes: Node[] = [];

//       for (const nodeData of workflowData.nodes) {
//         // 生成新的唯一ID
//         let baseName = nodeData.data?.name || nodeData.id;
//         const baseNameMatch = baseName.match(/^(.+?)(\d+)$/);
//         if (baseNameMatch) {
//           baseName = baseNameMatch[1];
//         }

//         const newId = generateUniqueNodeId(baseName, usedNewIds, nodeData.kind);
//         usedNewIds.push(newId);
//         oldToNewIdMap[nodeData.id] = newId;

//         // 创建新节点
//         const newNode: Node = {
//           id: newId,
//           type: nodeData.type || 'triggerNode',
//           position: nodeData.position || { x: 100, y: 100 },
//           data: {
//             ...nodeData.data,
//             name: newId
//           }
//         };

//         newNodes.push(newNode);

//         // 创建节点详情
//         const nodeDetails = {
//           parameters: null,
//           originalNodeKind: nodeData.kind,
//           nodeInfo: newNode,
//           savedValues: nodeData.inputs || {},
//           createdAt: Date.now()
//         };

//         updateNodeDetails(newId, nodeDetails);
//       }

//       // 然后处理边
//       const newEdges: Edge[] = [];

//       if (workflowData.edges && Array.isArray(workflowData.edges)) {
//         for (const edgeData of workflowData.edges) {
//           const newSourceId = oldToNewIdMap[edgeData.source];
//           const newTargetId = oldToNewIdMap[edgeData.target];

//           if (newSourceId && newTargetId) {
//             const newEdge: Edge = {
//               id: `${newSourceId}-${newTargetId}`,
//               source: newSourceId,
//               target: newTargetId,
//               sourceHandle: edgeData.sourceHandle || 'right-0',
//               targetHandle: edgeData.targetHandle || 'left-0',
//               label: edgeData.label || '',
//               ...EDGE_STYLE_CONFIG
//             };

//             newEdges.push(newEdge);
//           }
//         }
//       }

//       // 更新画布状态
//       if (shouldClearCanvas) {
//         setNodesState(newNodes);
//         setEdgesState(newEdges);
//       } else {
//         setNodesState(prevNodes => [...prevNodes, ...newNodes]);
//         setEdgesState(prevEdges => [...prevEdges, ...newEdges]);
//       }

//       showWarning('成功', `成功导入工作流：${workflowData.metadata?.workflowName || '未命名工作流'}`);

//     } catch (error) {
//       showError('导入失败', error instanceof Error ? error.message : '解析工作流数据失败');
//       console.error('导入工作流失败:', error);
//     }
//   }, [nodesDetailsMap, deleteNodeCompletely, setNodesState, setEdgesState, nodesState, generateUniqueNodeId, updateNodeDetails, showError, showWarning]);

//   // 添加键盘事件监听器，处理 Ctrl+V 粘贴功能
//   useEffect(() => {
//     const handleKeyDown = async (event: KeyboardEvent) => {
//       // 检查是否是 Ctrl+V (Windows) 或 Cmd+V (Mac)
//       if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
//         // 检查焦点是否在输入框等可编辑元素上
//         const activeElement = document.activeElement;
//         const isEditableElement = activeElement && (
//           activeElement.tagName === 'INPUT' ||
//           activeElement.tagName === 'TEXTAREA' ||
//           (activeElement as HTMLElement).contentEditable === 'true'
//         );

//         // 如果焦点在可编辑元素上，不拦截粘贴事件
//         if (isEditableElement) {
//           return;
//         }

//         // 阻止默认粘贴行为
//         event.preventDefault();

//         try {
//           // 读取剪贴板内容
//           const clipboardText = await navigator.clipboard.readText();

//           // 尝试解析为工作流数据
//           if (clipboardText.trim().startsWith('{')) {
//             await handleImportFromClipboard(clipboardText);
//           } else {
//             console.log('剪贴板内容不是JSON格式，忽略');
//           }
//         } catch (error) {
//           console.error('读取剪贴板失败:', error);
//           showError('粘贴失败', '无法读取剪贴板内容');
//         }
//       }
//     };

//     // 添加事件监听器
//     document.addEventListener('keydown', handleKeyDown);

//     // 清理函数
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleImportFromClipboard, showError]);

//   /**
//    * 处理节点变化事件
//  * 响应节点的移动、删除等操作，并清理相关数据
//  */
//   const handleNodesChange = useCallback((changes: any) => {
//     onNodesChange(changes);

//     // 通知父组件画布状态变化
//     setTimeout(() => {
//       if (onCanvasStateChange) {
//         onCanvasStateChange(nodesState, edgesState);
//       }
//     }, 0);

//     // 处理节点删除事件，使用统一的删除方法
//     const deleteChanges = changes.filter((change: any) => change.type === 'remove');
//     if (deleteChanges.length > 0) {
//       deleteChanges.forEach((change: any) => {
//         const nodeId = change.id;

//         // 添加到删除历史记录
//         setDeletedNodeHistory(prev => {
//           const newHistory = new Set(prev);
//           newHistory.add(nodeId);
//           return newHistory;
//         });

//         // 5秒后从删除历史中移除，避免永久占用内存
//         setTimeout(() => {
//           setDeletedNodeHistory(prev => {
//             const newHistory = new Set(prev);
//             if (newHistory.has(nodeId)) {
//               newHistory.delete(nodeId);
//               console.log('🧹 [Page] Removed from deletion history after 5s:', nodeId);
//             }
//             return newHistory;
//           });
//         }, 5000);

//         // 如果当前正在显示被删除节点的详情，关闭详情面板
//         if (selectedNodeDetails?.node?.id === nodeId) {
//           setSelectedNodeDetails(null);
//         }

//         // 使用统一的删除方法，完整清理所有相关数据
//         deleteNodeCompletely(nodeId);
//       });
//     }

//     // 检查是否需要触发自动布局
//     if (shouldTriggerAutoLayout(changes) && nodesState.length >= 1) {
//       // 延迟执行自动布局，确保节点状态已更新
//       setTimeout(() => {
//         // 获取画布容器尺寸
//         const canvasWidth = reactFlowWrapper.current?.offsetWidth || 1200;
//         const canvasHeight = reactFlowWrapper.current?.offsetHeight || 800;

//         const layoutedNodes = autoLayoutNodes(nodesState, edgesState, {
//           canvasWidth,
//           canvasHeight,
//           nodeHeight: 120, // 固定节点高度
//         });
//         setNodesState(layoutedNodes);
//       }, 100);
//     }
//   }, [onNodesChange, deleteNodeCompletely, selectedNodeDetails, nodesState.length, edgesState, setNodesState, onCanvasStateChange]);

//   const handleEdgesChange = useCallback((changes: any) => {
//     onEdgesChange(changes);

//     // 通知父组件画布状态变化
//     setTimeout(() => {
//       if (onCanvasStateChange) {
//         onCanvasStateChange(nodesState, edgesState);
//       }
//     }, 0);

//     // 处理边删除事件
//     const deleteChanges = changes.filter((change: any) => change.type === 'remove');
//     // 已处理边删除逻辑
//   }, [onEdgesChange, onCanvasStateChange, nodesState, edgesState]);

//   /**
//    * 处理边连接事件
//    * 创建节点之间的连接线，并自动设置标签
//    */
//   const onConnect = useCallback(
//     (params: Connection) => {
//       const sourceNode = nodes.find(node => node.id === params.source);

//       let edgeLabel = '';
//       if (sourceNode?.data?.link?.outputs) {
//         const outputIndex = params.sourceHandle ?
//           parseInt(params.sourceHandle.replace('right-', '')) : 0;

//         const output = sourceNode.data.link.outputs[outputIndex];
//         if (output && output.desc && output.desc.trim() !== '') {
//           edgeLabel = output.desc;
//         }
//       }

//       const newEdge = {
//         ...params,
//         id: `${params.source}-${params.target}`,
//         label: edgeLabel,
//         ...EDGE_STYLE_CONFIG
//       };

//       setEdgesState((eds) => {
//         const newEdgesState = addEdge(newEdge, eds);
//         // 通知父组件画布状态变化
//         setTimeout(() => {
//           if (onCanvasStateChange) {
//             onCanvasStateChange(nodesState, newEdgesState);
//           }
//         }, 0);
//         return newEdgesState;
//       });
//     },
//     [setEdgesState, nodes, onCanvasStateChange, nodesState]
//   );

//   /**
//    * 处理节点拖放事件
//    * 从左侧菜单拖拽节点到画布上
//    */
//   const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
//     const dragData = event.dataTransfer.getData('application/reactflow');
//     if (!dragData) {
//       return;
//     }

//     let nodeData: any;
//     try {
//       nodeData = JSON.parse(dragData);
//     } catch (error) {
//       console.error('Failed to parse drag data:', error);
//       return;
//     }

//     if (!nodeData || !nodeData.id) {
//       return;
//     }

//     const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
//     if (!reactFlowBounds) {
//       return;
//     }

//     const screenPosition = {
//       x: event.clientX,
//       y: event.clientY,
//     };

//     const reactFlowInstance = (window as any).reactFlowInstance;
//     if (reactFlowInstance) {
//       const position = reactFlowInstance.screenToFlowPosition(screenPosition);

//       // 检查是否是trigger节点的限制
//       // 如果拖拽的节点包含trigger类别，检查画布上是否已经存在任何trigger节点
//       if (nodeData.categories && nodeData.categories.includes('trigger')) {
//         const existingTrigger = Object.values(nodesDetailsMap).find((nodeDetails: any) =>
//           nodeDetails.nodeInfo?.data?.categories?.includes?.('trigger')
//         );

//         if (existingTrigger) {
//           showError('重复触发器', '画布上只能存在一个触发器');
//           return;
//         }
//       }

//       // 拖拽节点时使用nodeData.id作为nodeKind
//       const uniqueId = generateUniqueNodeId(nodeData.name, [], nodeData.id);

//       // 确保彻底清理可能存在的旧缓存数据
//       // 如果新生成的ID在缓存中已存在，先彻底清理
//       if (nodesDetailsMap[uniqueId]) {
//         console.log('⚠️ [onDrop] Found existing cache for new node ID, clearing:', uniqueId);
//         updateNodeDetails(uniqueId, null);
//       }

//       const newNode: Node = {
//         id: uniqueId,
//         type: nodeData.type || 'triggerNode',
//         position,
//         data: {
//           kind: nodeData.id,
//           name: uniqueId,
//           description: nodeData.description || '',
//           icon: nodeData.icon || `/nodes/${nodeData.id}/${nodeData.id}.svg`,
//           category: nodeData.category || 'default',
//           categories: nodeData.categories || [], // 保存categories信息用于触发器检查
//           version: nodeData.version || '1.0.0',
//           link: nodeData.link || null,
//           nodeWidth: nodeData.nodeWidth || undefined,
//         },
//       };

//       // 创建全新的节点详情，避免任何旧数据影响
//       const nodeDetails = {
//         parameters: null,
//         originalNodeKind: nodeData.id,
//         nodeInfo: newNode,
//         savedValues: {}, // 确保从空的保存值开始
//         createdAt: Date.now() // 添加创建时间戳用于调试
//       };

//       console.log('✨ [onDrop] Setting fresh node details:', {
//         uniqueId,
//         nodeDetails: { ...nodeDetails, nodeInfo: 'Node object' }
//       });

//       updateNodeDetails(uniqueId, nodeDetails);

//       setTimeout(() => {
//         setNodesState(prevNodes => [...prevNodes, newNode]);
//       }, 0);
//     }
//   }, [reactFlowWrapper, nodesState, generateUniqueNodeId, updateNodeDetails, nodesDetailsMap]);

//   /**
//    * 处理节点双击事件
//    * 打开节点配置面板，优先显示数据库数据
//    */
//   const handleNodeDoubleClick = useCallback(async (event: React.MouseEvent, node: Node) => {
//     const nodeInstanceId = node.id;
//     const nodeKind = node.data.kind;

//     if (!nodeKind) {
//       console.error('No kind found in node data:', node);
//       return;
//     }

//     // 计算前置节点列表（递归获取所有前置节点）
//     const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);

//     const cachedDetails = nodesDetailsMap[nodeInstanceId];

//     // 如果已有参数数据，直接使用
//     if (cachedDetails && cachedDetails.parameters !== null) {
//       const testResults = nodesTestResultsMap[nodeInstanceId] || null;

//       setSelectedNodeDetails({
//         node,
//         parameters: cachedDetails.parameters,
//         savedValues: cachedDetails.savedValues || {},
//         onTest: (nodeValues: Record<string, any>) => handleNodeTest(nodeValues, nodeInstanceId),
//         onTestPreviousNode: (nodeValues: Record<string, any>, targetNodeId: string) => handleLeftPanelNodeTest(nodeValues, targetNodeId),
//         onSaveMockData: (mockTestResult: any) => handleSaveMockData(mockTestResult, nodeInstanceId),
//         testOutput: testResults ?
//           JSON.stringify(testResults, null, 2) :
//           '',
//         lastTestResult: testResults,
//         previousNodeIds: previousNodeIds,
//         onPreviousNodeChange: (selectedNodeId: string) => {
//           console.log('选择前置节点:', selectedNodeId);
//         },
//         selectedPreviousNodeId: previousNodeIds.length > 0 ? previousNodeIds[0] : '',
//         nodesTestResultsMap: nodesTestResultsMap,
//         getLatestNodesTestResultsMap: getLatestNodesTestResultsMap,
//         nodesDetailsMap: nodesDetailsMap,
//         showToast: (type: 'error' | 'warning', title: string, message: string) => {
//           if (type === 'error') {
//             showError(title, message);
//           } else if (type === 'warning') {
//             showWarning(title, message);
//           }
//         }
//       });
//       return;
//     }

//     // 从API获取节点参数
//     try {
//       const response = await fetch(`/api/nodes/${nodeKind}`);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch node details: ${response.statusText}`);
//       }

//       const detailsData = await response.json();
//       const parameters = detailsData.node.fields || [];

//       const existingDetails = cachedDetails || {};
//       const savedValues = existingDetails.savedValues || {};

//       updateNodeDetails(nodeInstanceId, {
//         ...existingDetails,
//         parameters,
//         savedValues: savedValues
//       });

//       const testResults = nodesTestResultsMap[nodeInstanceId] || null;

//       setSelectedNodeDetails({
//         node,
//         parameters,
//         savedValues: savedValues,
//         onTest: (nodeValues: Record<string, any>) => handleNodeTest(nodeValues, nodeInstanceId),
//         onTestPreviousNode: (nodeValues: Record<string, any>, targetNodeId: string) => handleLeftPanelNodeTest(nodeValues, targetNodeId),
//         onSaveMockData: (mockTestResult: any) => handleSaveMockData(mockTestResult, nodeInstanceId),
//         testOutput: testResults ?
//           JSON.stringify(testResults, null, 2) :
//           '',
//         lastTestResult: testResults,
//         previousNodeIds: previousNodeIds,
//         onPreviousNodeChange: (selectedNodeId: string) => {
//           console.log('选择前置节点:', selectedNodeId);
//         },
//         selectedPreviousNodeId: previousNodeIds.length > 0 ? previousNodeIds[0] : '',
//         nodesTestResultsMap: nodesTestResultsMap,
//         getLatestNodesTestResultsMap: getLatestNodesTestResultsMap,
//         nodesDetailsMap: nodesDetailsMap,
//         showToast: (type: 'error' | 'warning', title: string, message: string) => {
//           if (type === 'error') {
//             showError(title, message);
//           } else if (type === 'warning') {
//             showWarning(title, message);
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching node details:', error);
//     }
//   }, [nodesDetailsMap, updateNodeDetails, edgesState, getLatestNodesTestResultsMap, nodes, nodesState]);

//   /**
//    * 处理节点配置更新
//    * 保存节点配置并关闭配置面板，或者只关闭不保存
//    */
//   const handleNodeUpdate = useCallback((nodeData: any) => {
//     // 如果传入 null，表示只关闭不保存
//     if (nodeData === null) {
//       setSelectedNodeDetails(null);
//       return;
//     }

//     const nodeInstanceId = nodeData.id;

//     if (nodeInstanceId) {
//       const existingDetails = nodesDetailsMap[nodeInstanceId] || {};

//       // 提取用户配置的值，排除系统属性
//       const potentialSavedValues = { ...nodeData.data };
//       delete potentialSavedValues.kind;
//       delete potentialSavedValues.name;
//       delete potentialSavedValues.description;
//       delete potentialSavedValues.icon;
//       delete potentialSavedValues.category;
//       delete potentialSavedValues.version;
//       delete potentialSavedValues.link;

//       // 判断是否包含实际配置数据
//       const isRealSave = Object.keys(potentialSavedValues).length > 0;

//       let finalSavedValues;
//       if (isRealSave) {
//         finalSavedValues = potentialSavedValues;
//       } else {
//         // 保留原有数据，避免数据库数据丢失
//         finalSavedValues = existingDetails.savedValues || {};
//       }

//       updateNodeDetails(nodeInstanceId, {
//         ...existingDetails,
//         savedValues: finalSavedValues,
//         parameters: existingDetails.parameters || null
//       });

//       // 只有在保存数据时才更新节点状态
//       setNodesState(nds => nds.map(node =>
//         node.id === nodeData.id ? { ...node, data: { ...node.data, ...nodeData.data } } : node
//       ));
//     }

//     // 关闭配置面板
//     setSelectedNodeDetails(null);
//   }, [setNodesState, nodesDetailsMap, updateNodeDetails]);

//   /**
//    * 保存模拟测试数据
//    * 将用户设置的模拟数据保存到测试结果中
//    */
//   const handleSaveMockData = useCallback((mockTestResult: any, nodeInstanceId: string) => {
//     // 🎯 直接存储 rundata 到 nodesTestResultsMap 中
//     const rundata = mockTestResult.runData || mockTestResult;
//     updateNodeTestResult(nodeInstanceId, rundata);

//     if (selectedNodeDetails?.node?.id === nodeInstanceId) {
//       setSelectedNodeDetails((prev: any) => {
//         if (!prev || prev.node.id !== nodeInstanceId) return prev;
//         return {
//           ...prev,
//           testOutput: JSON.stringify(rundata, null, 2),
//           lastTestResult: rundata,
//         };
//       });
//     }
//   }, [updateNodeTestResult, selectedNodeDetails]);

//   /**
//    * 节点测试专用接口-important
//    * 调用后端API测试单个节点，并处理测试结果
//    */
//   const handleNodeTest = useCallback(async (nodeValues: Record<string, any>, nodeInstanceId: string) => {
//     // 获取最新的nodesTestResultsMap状态
//     const latestNodesTestResultsMap = getLatestNodesTestResultsMap();

//     const currentSelectedNodeDetails = selectedNodeDetails;

//     try {
//       // 从 nodesDetailsMap 中获取节点信息，这是最可靠的数据源
//       const nodeDetails = nodesDetailsMap[nodeInstanceId];
//       if (!nodeDetails || !nodeDetails.nodeInfo) {
//         console.error('❌ [Page] 找不到对应的节点详情:', nodeInstanceId);
//         return;
//       }

//       const node = nodeDetails.nodeInfo;
//       const nodeKind = nodeDetails.originalNodeKind || node.data.kind;

//       // 检查并提取所有模板变量和 nodeId 引用
//       const inputsString = JSON.stringify(nodeValues);

//       // 1. 提取模板变量 {{ }} 中的 nodeid
//       const templateVariableRegex = /\{\{\s*\$\.([^.\s}]+)/g;
//       const templateNodeIds = [];
//       let templateMatch;
//       while ((templateMatch = templateVariableRegex.exec(inputsString)) !== null) {
//         templateNodeIds.push(templateMatch[1]);
//       }

//       // 2. 提取 $.nodeid. 格式中的 nodeid（支持尾部有点或无点）
//       const directNodeIdRegex = /\$\.([^.\s}]+)\.?/g;
//       const directNodeIds = [];
//       let directMatch;
//       while ((directMatch = directNodeIdRegex.exec(inputsString)) !== null) {
//         directNodeIds.push(directMatch[1]);
//       }

//       // 3. 合并并去重所有提取的 nodeId
//       const allExtractedNodeIds = [...new Set([...templateNodeIds, ...directNodeIds])];

//       // 4. 只要有任何形式的 nodeId 引用，就认为包含模板变量
//       const hasTemplateVariables = allExtractedNodeIds.length > 0;

//       // 获取前置节点列表
//       const previousNodeIds = getAllPreviousNodeIds(nodeInstanceId, edgesState, nodesDetailsMap);
//       // 构造调试请求 - 包含所有相关的节点
//       const actions = [];

//       // 添加所有前置节点到actions
//       previousNodeIds.forEach(prevNodeId => {
//         const prevNodeDetails = nodesDetailsMap[prevNodeId];
//         if (prevNodeDetails && prevNodeDetails.nodeInfo) {
//           const prevNode = prevNodeDetails.nodeInfo;
//           actions.push({
//             id: prevNodeId,
//             inputs: {
//               ...(prevNodeDetails.savedValues || {}),
//               id: prevNodeId
//             },
//             kind: prevNodeDetails.originalNodeKind || prevNode.data.kind,
//             nodeName: prevNode.data.name || prevNodeId,
//             position: prevNode.position,
//             type: prevNode.type || 'triggerNode'
//           });
//         }
//       });

//       // 添加当前测试节点
//       actions.push({
//         id: nodeInstanceId,
//         inputs: { ...nodeValues, id: nodeInstanceId },
//         kind: nodeKind,
//         nodeName: node.data.name || nodeInstanceId,
//         position: node.position,
//         type: node.type || 'triggerNode'
//       });


//       // 构建edges - 包含完整的连接关系
//       const edges = [];

//       // 获取所有相关节点ID
//       const allNodeIds = [...previousNodeIds, nodeInstanceId];

//       // 找到第一个节点（没有前置节点的节点）
//       const firstNodeId = allNodeIds.find(nodeId =>
//         !edgesState.some(edge => edge.target === nodeId && allNodeIds.includes(edge.source))
//       );

//       // 从$source到第一个节点的连接
//       if (firstNodeId) {
//         edges.push({
//           from: "$source",
//           to: firstNodeId
//         });
//       }

//       // 添加节点之间的连接
//       edgesState.forEach(edge => {
//         if (allNodeIds.includes(edge.source) && allNodeIds.includes(edge.target)) {
//           const temp = {
//             from: edge.source,
//             to: edge.target
//           };
//           if (edge.sourceHandle) edge.sourceHandle;
//           if (edge.targetHandle) edge.targetHandle;
//           if (edge.label) edge.label;
//           label: edge.label || ''
//           edges.push(temp);
//         }
//       });

//       const debugRequest: any = {
//         actions,
//         edges
//       };

//       // 如果包含模板变量，添加state字段
//       if (hasTemplateVariables) {
//         // 构建state对象，包含所有前置节点的lastTestResult
//         const state: Record<string, any> = {};

//         // 为每个前置节点添加其lastTestResult到state中
//         previousNodeIds.forEach(prevNodeId => {
//           const prevNodeTestResult = latestNodesTestResultsMap[prevNodeId];

//           if (prevNodeTestResult) {
//             state[prevNodeId] = prevNodeTestResult;
//           } else {
//             console.log(`⚠️ [Page] 前置节点 ${prevNodeId} 没有测试结果`);
//           }
//         });

//         debugRequest.state = state;
//       }

//       const result = await debugNode(debugRequest, true);

//       // 从完整结果中提取当前节点的测试结果
//       const fullTestResult = result.runData[0];
//       const testResult = fullTestResult[nodeInstanceId] || fullTestResult;

//       // 🎯 只存储 rundata 部分到 nodesTestResultsMap 中
//       updateNodeTestResult(nodeInstanceId, testResult);

//       // 获取当前节点详情
//       const currentNodeDetails = nodesDetailsMap[nodeInstanceId];
//       if (currentNodeDetails) {
//         // 过滤掉系统属性，只保存用户配置的值
//         const filteredSavedValues = { ...nodeValues };

//         // 移除系统属性（如果存在）
//         delete filteredSavedValues.kind;
//         delete filteredSavedValues.name;
//         delete filteredSavedValues.description;
//         delete filteredSavedValues.icon;
//         delete filteredSavedValues.category;
//         delete filteredSavedValues.version;
//         delete filteredSavedValues.link;
//         delete filteredSavedValues.id; // 移除ID字段

//         // 更新节点详情，保存用户配置
//         const updatedNodeDetails = {
//           ...currentNodeDetails,
//           savedValues: filteredSavedValues,
//           lastSaved: new Date().toISOString() // 添加保存时间戳
//         };

//         updateNodeDetails(nodeInstanceId, updatedNodeDetails);
//       }

//       // 更新当前显示的配置面板
//       const shouldUpdate = (currentSelectedNodeDetails?.node?.id === nodeInstanceId) ||
//         (selectedNodeDetails?.node?.id === nodeInstanceId);

//       if (shouldUpdate) {
//         setTimeout(() => {
//           setSelectedNodeDetails((prev: any) => {
//             if (prev && prev.node.id === nodeInstanceId) {
//               // 获取最新的节点详情（包含刚保存的配置）
//               const latestNodeDetails = nodesDetailsMap[nodeInstanceId];
//               return {
//                 ...prev,
//                 savedValues: latestNodeDetails?.savedValues || prev.savedValues || {},
//                 testOutput: JSON.stringify(testResult, null, 2),
//                 lastTestResult: testResult
//               };
//             }
//             else if (currentSelectedNodeDetails?.node?.id === nodeInstanceId) {
//               // 获取最新的节点详情（包含刚保存的配置）
//               const latestNodeDetails = nodesDetailsMap[nodeInstanceId];
//               return {
//                 ...currentSelectedNodeDetails,
//                 savedValues: latestNodeDetails?.savedValues || currentSelectedNodeDetails.savedValues || {},
//                 testOutput: JSON.stringify(testResult, null, 2),
//                 lastTestResult: testResult
//               };
//             }
//             return prev;
//           });
//         }, 0);
//       } else {
//         // 只更新测试结果相关的数据，不重新创建整个 selectedNodeDetails
//         setTimeout(() => {
//           setSelectedNodeDetails((prev: any) => {
//             if (prev && prev.node.id === nodeInstanceId) {
//               // 获取最新的节点详情（包含刚保存的配置）
//               const latestNodeDetails = nodesDetailsMap[nodeInstanceId];
//               return {
//                 ...prev,
//                 savedValues: latestNodeDetails?.savedValues || prev.savedValues || {},
//                 testOutput: JSON.stringify(testResult, null, 2),
//                 lastTestResult: testResult,
//               };
//             }
//             return prev;
//           });
//         }, 0);
//       }

//     } catch (error) {
//       // 处理测试失败的情况
//       const nodeDetails = nodesDetailsMap[nodeInstanceId];
//       const nodeKind = nodeDetails?.originalNodeKind || nodeDetails?.nodeInfo?.data?.kind || 'unknown';

//       // 尝试获取详细的错误响应
//       let testResult: any = null;

//       if (error instanceof Error && (error as any).debugResponse) {
//         // 如果有debugResponse，使用完整的错误响应
//         const debugResponse = (error as any).debugResponse;
//         console.log('✅ [Page] 使用完整的错误响应:', debugResponse);

//         testResult = {
//           ...debugResponse,
//           nodeId: nodeInstanceId,
//           nodeKind: nodeKind,
//           executionTime: new Date().toISOString(),
//           // 保留原始的错误响应数据用于JSON展示
//           originalError: debugResponse.responseData || debugResponse
//         };
//       } else {
//         // 如果没有debugResponse，创建简单的错误对象
//         console.log('⚠️ [Page] 使用简单的错误对象');
//         testResult = {
//           error: true,
//           message: error instanceof Error ? error.message : '节点执行失败',
//           nodeId: nodeInstanceId,
//           nodeKind: nodeKind,
//           timestamp: new Date().toISOString(),
//           // 尝试从错误对象中提取更多信息
//           details: error instanceof Error ? {
//             name: error.name,
//             message: error.message,
//             stack: error.stack
//           } : { error: String(error) }
//         };
//       }

//       updateNodeTestResult(nodeInstanceId, testResult);

//       // 创建用于显示的错误输出 - 确保是有效的JSON格式
//       const errorOutput = JSON.stringify(testResult, null, 2);
//       console.log('📄 [Page] 错误输出JSON:', errorOutput);

//       const shouldUpdate = (currentSelectedNodeDetails?.node?.id === nodeInstanceId) ||
//         (selectedNodeDetails?.node?.id === nodeInstanceId);

//       if (shouldUpdate) {
//         setTimeout(() => {
//           setSelectedNodeDetails((prev: any) => {
//             if (prev && prev.node.id === nodeInstanceId) {
//               return {
//                 ...prev,
//                 testOutput: errorOutput,
//                 lastTestResult: testResult,
//               };
//             }
//             else if (currentSelectedNodeDetails?.node?.id === nodeInstanceId) {
//               return {
//                 ...currentSelectedNodeDetails,
//                 testOutput: errorOutput,
//                 lastTestResult: testResult,
//               };
//             }
//             return prev;
//           });
//         }, 0);
//       } else {
//         // 只更新测试结果相关的数据，不重新创建整个 selectedNodeDetails
//         setTimeout(() => {
//           setSelectedNodeDetails((prev: any) => {
//             if (prev && prev.node.id === nodeInstanceId) {
//               return {
//                 ...prev,
//                 testOutput: errorOutput,
//                 lastTestResult: testResult,
//               };
//             }
//             return prev;
//           });
//         }, 0);
//       }
//     }
//   }, [nodesDetailsMap, getLatestNodesTestResultsMap, selectedNodeDetails, updateNodeTestResult, getAllPreviousNodeIds, edgesState, updateNodeDetails]);

//   /**
//    * 处理节点ID变更
//    * 更新节点标识符并同步相关数据
//    */
//   const handleNodeIdChange = useCallback((oldId: string, newId: string) => {
//     if (oldId === newId) {
//       return;
//     }

//     // 对于用户手动输入的名称，直接使用，不进行重复性检查和ID生成
//     // 这样用户输入"js123"时，最终的节点ID就是"js123"
//     const finalNewId = newId;

//     // 更新节点信息
//     setNodesState(nds => nds.map(node => {
//       if (node.id === oldId) {
//         return {
//           ...node,
//           id: finalNewId,
//           data: {
//             ...node.data,
//             name: finalNewId
//           }
//         };
//       }
//       return node;
//     }));

//     // 更新边连接
//     setEdgesState(eds => eds.map(edge => ({
//       ...edge,
//       source: edge.source === oldId ? finalNewId : edge.source,
//       target: edge.target === oldId ? finalNewId : edge.target
//     })));

//     // 更新节点详情映射
//     const oldDetails = nodesDetailsMap[oldId];
//     if (oldDetails) {
//       const updatedDetailsMap = { ...nodesDetailsMap };
//       delete updatedDetailsMap[oldId];

//       updatedDetailsMap[finalNewId] = {
//         ...oldDetails,
//         nodeInfo: {
//           ...oldDetails.nodeInfo,
//           id: finalNewId,
//           data: {
//             ...oldDetails.nodeInfo.data,
//             name: finalNewId
//           }
//         }
//       };

//       Object.keys(updatedDetailsMap).forEach(key => {
//         updateNodeDetails(key, updatedDetailsMap[key]);
//       });

//       updateNodeDetails(oldId, null);
//     }
//   }, [nodesState, setNodesState, setEdgesState, nodesDetailsMap, updateNodeDetails, generateUniqueNodeId]);

//   const nodeWidth = useMemo(() => {
//     if (selectedNodeDetails?.node) {
//       if (selectedNodeDetails.node.data?.nodeWidth) {
//         return selectedNodeDetails.node.data.nodeWidth;
//       }
//       if (selectedNodeDetails.savedValues?.nodeWidth) {
//         return selectedNodeDetails.savedValues.nodeWidth;
//       }
//     }
//     return undefined;
//   }, [selectedNodeDetails]);

//   /**
//    * 处理自动布局
//    * 使用简单的水平排列布局算法
//    */
//   const handleAutoLayout = useCallback(() => {
//     if (nodesState.length < 1) return;

//     // 获取画布容器尺寸
//     const canvasWidth = reactFlowWrapper.current?.offsetWidth || 1200;
//     const canvasHeight = reactFlowWrapper.current?.offsetHeight || 800;

//     // 使用新的水平排列布局
//     const layoutedNodes = autoLayoutNodes(nodesState, edgesState, {
//       canvasWidth,
//       canvasHeight,
//       nodeHeight: 120, // 固定节点高度
//     });

//     // 更新节点状态
//     setNodesState(layoutedNodes);
//   }, [nodesState, edgesState, setNodesState]);

//   /**
//    * 处理画布的自动布局回调
//    */
//   const handleCanvasAutoLayout = useCallback((layoutedNodes: Node[]) => {
//     setNodesState(layoutedNodes);
//   }, [setNodesState]);

//   return (
//     <WorkflowContainer ref={reactFlowWrapper}>
//       <IndependentWorkflowMenu onMenuCollapseChange={onMenuCollapseChange} />
//       <WorkflowCanvas
//         nodes={nodesState}
//         edges={edgesState}
//         onNodesChange={handleNodesChange}
//         onEdgesChange={handleEdgesChange}
//         onConnect={onConnect}
//         onDrop={onDrop}
//         onDragOver={useCallback((event: React.DragEvent) => {
//           event.preventDefault();
//           event.dataTransfer.dropEffect = 'move';
//         }, [])}
//         onNodeDoubleClick={handleNodeDoubleClick}
//         selectedNodeDetails={selectedNodeDetails}
//         onNodeUpdate={handleNodeUpdate}
//         onNodeIdChange={handleNodeIdChange}
//         nodeWidth={nodeWidth}
//         onAutoLayout={handleCanvasAutoLayout}
//         onCopyNodes={handleCopyNodes}
//         onPasteNodes={handlePasteNodes}
//         // 🔧 传递最新的 nodesTestResultsMap，避免快照问题
//         nodesTestResultsMap={nodesTestResultsMap}
//         getLatestNodesTestResultsMap={getLatestNodesTestResultsMap}
//         // 连接配置回调
//         onFetchConnectConfigs={onFetchConnectConfigs}
//         // 表名获取回调
//         onFetchTables={onFetchTables}
//       />
//     </WorkflowContainer>
//   );
// });

// export default WorkflowPage;