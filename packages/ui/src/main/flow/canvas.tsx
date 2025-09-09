"use client";

import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import styled, { useTheme, createGlobalStyle } from 'styled-components';
import { MdAutoFixHigh } from "react-icons/md";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { BsStopCircleFill } from "react-icons/bs";


// ReactFlow imports
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useReactFlow,
  useOnViewportChange,
  Viewport,
  Node,
  Edge,
  ProOptions,
  NodeMouseHandler,
  Connection,
  NodeChange,
  EdgeChange,
  NodeRemoveChange,
  EdgeRemoveChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CanvasContainer, ZoomDisplay, ReactFlowGlobalStyles } from './canvasStyle';

// Custom components
import { TriggerNodeComponent, ActionNodeComponent, AgentNodeComponent, StickyNoteComponent } from './custom-nodes';
import { DebugTaskbar } from '../../components/debug/DebugTaskbar';
import { CoButton } from '../../components/basic';
import { MdNotStarted } from "react-icons/md";
import { NodeDetailsView } from '../../node/NodeDetailsView';
import { autoLayoutNodes, centerNodes } from './autoLayout';
import { LinkageCallbacks } from '../../utils/UnifiedParameterInput';

// 将 nodeTypes 定义在组件外部以避免ReactFlow警告
// 确保 nodeTypes 引用完全稳定
const createNodeWithExecutionStatus = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const { data, ...otherProps } = props;
    const executionStatusObj = data?.executionStatus;
    // 提取status属性作为executionStatus传递给组件
    const executionStatus = executionStatusObj?.status || executionStatusObj;

    const finalProps = {
      data,
      executionStatus,
      ...otherProps
    };

    return <Component {...finalProps} />;
  };
};

const NODE_TYPES = {
  triggerNode: createNodeWithExecutionStatus(TriggerNodeComponent),
  actionNode: createNodeWithExecutionStatus(ActionNodeComponent),
  agentNode: createNodeWithExecutionStatus(AgentNodeComponent),
  stickyNote: StickyNoteComponent
  // conditionNode: ConditionNodeComponent,
};

// Styled button for sticky note
const StickyNoteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  //background: rgba(0, 0, 0, 0.8);
  background: #999696;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

// 定义 proOptions 来隐藏归属标记
const proOptions: ProOptions = {
  hideAttribution: true,
};



export interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onSelectionChange?: (elements: { nodes: Node[], edges: Edge[] }) => void;
  onNodeUpdate?: (nodeData: any) => void;
  // Add a prop to handle node double click and potentially fetch data in the parent
  onNodeDoubleClick?: (event: React.MouseEvent, node: Node) => void;
  // Add a prop to pass selected node details for the details view
  selectedNodeDetails?: any; // Assuming node details structure
  onNodeIdChange?: (oldId: string, newId: string) => void; // 新增ID变更回调
  nodeWidth?: number; // 节点宽度
  onAutoLayout?: (layoutedNodes: Node[]) => void; // 自动布局回调
  onCopyNodes?: (nodes: Node[]) => void; // 新增复制节点回调
  onPasteNodes?: () => void; // 新增粘贴节点回调
  // 🔧 添加最新的 nodesTestResultsMap 作为直接props，避免快照问题
  nodesTestResultsMap?: Record<string, any>;
  getLatestNodesTestResultsMap?: () => Record<string, any>;
  // 连接配置数据，由web层传入
  connectConfigs?: Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>;
  // 连接配置查询回调，当NodeSettings需要特定类型的连接配置时调用
  onFetchConnectInstances?: (ctype?: string) => Promise<Array<{
    id: string;
    name: string;
  }>>;
  // 表名获取回调，当SelectFilter需要获取数据库表名时调用
  onFetchConnectDetail?: (datasourceId: string) => Promise<{
    loading: boolean;
    error: string | null;
    options: Array<{ label: string; value: string; }>;
  }>;
  // 节点类型映射，允许业务层自定义节点组件
  nodeTypes?: Record<string, React.ComponentType<any>>;
  // 联动回调函数映射
  linkageCallbacks?: LinkageCallbacks;
  // 测试按钮相关props
  onWorkflowTest?: () => void;
  onStopWorkflowTest?: () => void;
  isTestingWorkflow?: boolean;
  workflowId?: string;
  menuCollapsed?: boolean;
  // 工作流日志数据
  workflowLogData?: any;
  // 节点详情映射
  nodesDetailsMap?: Record<string, any>;
  // 节点执行状态获取函数
  getNodeExecutionStatus?: (nodeName: string) => { status: any; timestamp: number; hasStartNode: boolean; };
  // Sticky note相关回调
  onAddStickyNote?: (position: { x: number; y: number }) => void;
  onUpdateStickyNote?: (id: string, data: any) => void;
  onDeleteStickyNote?: (id: string) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = React.memo(({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onSelectionChange,
  onNodeUpdate,
  onNodeDoubleClick,
  selectedNodeDetails,
  onNodeIdChange,
  nodeWidth,
  onAutoLayout,
  onCopyNodes,
  onPasteNodes,
  // 🔧 接收最新的 nodesTestResultsMap 作为直接props
  nodesTestResultsMap,
  getLatestNodesTestResultsMap,
  // 连接配置相关props
  connectConfigs = [],
  onFetchConnectInstances,
  // 表名获取相关props
  onFetchConnectDetail,
  // 节点类型映射
  nodeTypes,
  // 联动回调函数映射
  linkageCallbacks,
  // 测试按钮相关props
  onWorkflowTest,
  onStopWorkflowTest,
  isTestingWorkflow,
  workflowId,
  menuCollapsed,
  // 工作流日志数据
  workflowLogData,
  // 节点详情映射
  nodesDetailsMap,
  // 节点执行状态获取函数
  getNodeExecutionStatus,
  // Sticky note相关回调
  onAddStickyNote,
  onUpdateStickyNote,
  onDeleteStickyNote,
}) => {
  // ================ Hooks 和实例 ================
  const reactFlowInstance = useReactFlow();
  const theme = useTheme();

  // ================ 状态管理 ================
  const [isDragOver, setIsDragOver] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 初始缩放设置为100%
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeParameters, setNodeParameters] = useState<any[]>([]);
  // 状态覆盖机制 - 用于停止工作流时将运行中节点设为FAILED
  const [failedNodeOverrides, setFailedNodeOverrides] = React.useState<Set<string>>(new Set());

  // 当工作流测试状态变化时，延迟清除失败覆盖状态
  useEffect(() => {
    if (!isTestingWorkflow) {
      // 延迟清除失败覆盖状态，让用户能看到节点状态变化
      const timer = setTimeout(() => {
        setFailedNodeOverrides(new Set());
      }, 3000); // 3秒后清除

      return () => clearTimeout(timer);
    }
  }, [isTestingWorkflow]);
  // connectConfigs 现在通过props传入，不需要内部状态
  // Ref for ReactFlow wrapper
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 存储拖拽数据的引用
  const dragDataRef = useRef<string | null>(null);

  // ================ 优化的 nodes 和 edges ================
  const processedNodes = useMemo(() => {
    return nodes.map(node => {
      // 获取节点执行状态
      let executionStatus = null;
      if (getNodeExecutionStatus && node.data?.name) {
        const nodeName = node.data.name;
        // 首先检查是否有失败覆盖状态
        const isOverridden = failedNodeOverrides.has(nodeName);
        if (isOverridden) {
          executionStatus = { status: 'FAILED', timestamp: Date.now(), hasStartNode: true };
        } else {
          executionStatus = getNodeExecutionStatus(nodeName);
        }
      }

      const baseNodeData = {
        ...node,
        data: {
          ...node.data,
          executionStatus
        }
      };

      if (node.data && node.data.subflow) {
        return {
          ...baseNodeData,
          data: {
            ...baseNodeData.data,
            // 增加subflow标记，供自定义节点组件使用
            subflowLabel: node.data.subflow === true ? '子流程' : String(node.data.subflow)
          }
          // ====== 中文注释：移除subflow节点的边框样式 ======
          // 不再为subflow节点添加特殊边框，保持原有样式
          // style: {
          //   ...(node.style || {}),
          //   border: '2px solid #FF9800',
          //   boxShadow: '0 0 8px #FF980088'
          // }
        };
      }
      return baseNodeData;
    });
  }, [nodes, getNodeExecutionStatus, failedNodeOverrides]);

  const processedEdges = useMemo(() => {
    // ====== 中文注释：对带有subflow的边做特殊显示 ======
    // edges属性处理：移除subflow的特殊样式，让所有边都显示为正常样式
    // 保留原有的基于输出连接点描述的标签显示
    // =============================
    return edges.map(edge => {
      // 移除subflow特殊样式，所有边都使用统一样式
      return edge;
    });
  }, [edges]);

  // 初始化ReactFlow实例
  useEffect(() => {
    if (reactFlowInstance) {
      // 只在初始化时设置缩放级别为100%，不强制重置
      const currentViewport = reactFlowInstance.getViewport();
      if (currentViewport.zoom === 1 && currentViewport.x === 0 && currentViewport.y === 0) {
        // 只有在默认状态时才设置，避免覆盖用户操作
        setZoomLevel(1);
      } else {
        // 同步当前的缩放级别
        setZoomLevel(currentViewport.zoom);
      }
    }
  }, [reactFlowInstance]); // 只依赖reactFlowInstance，移除zoomLevel依赖

  // 注释：缩放监听现在通过ReactFlow的onViewportChange回调处理，不需要额外的事件监听

  // 将 reactFlowInstance 暴露到全局变量，供拖拽操作使用
  useEffect(() => {
    if (reactFlowInstance) {
      (window as any).reactFlowInstance = reactFlowInstance;
    }
  }, [reactFlowInstance]);

  // ================ 事件处理函数 ================

  /**
   * 重置画布缩放到100%
   */
  const handleResetZoom = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      setZoomLevel(1);
    }
  }, [reactFlowInstance]);



  /**
   * 处理自动布局
   * 使用简单的水平排列布局算法
   */
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    // 获取画布容器尺寸
    const canvasElement = document.querySelector('.react-flow__viewport')?.parentElement;
    const canvasWidth = canvasElement?.offsetWidth || 1200;
    const canvasHeight = canvasElement?.offsetHeight || 800;

    // 使用新的水平排列布局
    const layoutedNodes = autoLayoutNodes(nodes, edges, {
      canvasWidth,
      canvasHeight,
      nodeHeight: 120, // 固定节点高度
    });

    // 通过回调更新节点位置
    if (onAutoLayout) {
      onAutoLayout(layoutedNodes);
    }

    // 自动布局后保持100%缩放
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
        setZoomLevel(1);
      }
    }, 100);
  }, [nodes, edges, onAutoLayout, reactFlowInstance]);

  /**
   * 处理拖拽悬停事件
   * 设置拖拽效果并显示投放区域
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver?.(event);
  }, [onDragOver]);

  /**
   * 处理拖拽离开事件
   * 检查是否真正离开画布区域
   */
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const isStillInside = (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );

    if (!isStillInside) {
      setIsDragOver(false);
    }
  }, []);

  /**
   * 处理节点投放事件
   * 完成从菜单到画布的节点拖拽
   */
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    if (onDrop) {
      onDrop(event);
    }
  }, [onDrop]);

  /**
   * 全局拖拽事件监听
   * 捕获拖拽数据并处理拖拽结束
   */
  useEffect(() => {
    const handleGlobalDragStart = (event: DragEvent) => {
      // 存储拖拽数据
      const data = event.dataTransfer?.getData('application/reactflow');
      if (data) {
        dragDataRef.current = data;
      }
    };

    const handleGlobalDragEnd = (event: DragEvent) => {
      if (isDragOver && reactFlowWrapper) {
        const wrapper = document.querySelector('.react-flow');
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const isInCanvas = (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
          );

          if (isInCanvas && dragDataRef.current) {
            // 创建模拟的 dataTransfer 对象
            const mockDataTransfer = {
              getData: (format: string) => {
                if (format === 'application/reactflow') {
                  return dragDataRef.current || '';
                }
                return '';
              }
            };

            const syntheticEvent = {
              preventDefault: () => { },
              stopPropagation: () => { },
              dataTransfer: mockDataTransfer,
              clientX: event.clientX - 315,
              clientY: event.clientY,
              target: wrapper,
              currentTarget: wrapper
            } as unknown as React.DragEvent<HTMLDivElement>;

            if (onDrop) {
              onDrop(syntheticEvent);
            }
          }
        }
      }

      // 清理拖拽数据
      dragDataRef.current = null;
      setIsDragOver(false);
    };

    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, [isDragOver, onDrop]);

  /**
   * 处理节点双击事件
   * 触发节点配置面板打开
   */
  const handleNodeDoubleClickInternal: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
    onNodeDoubleClick?.(event, node);
  }, [onNodeDoubleClick]);

  /**
   * 处理节点设置保存
   * 将配置数据传递给父组件
   */
  const handleNodeSettingsSave = (nodeData: any) => {
    if (onNodeUpdate) {
      onNodeUpdate(nodeData);
    }
  };

  /**
   * 处理关闭节点详情视图
   * 只关闭页面，不做任何数据保存操作
   */
  const handleNodeDetailsClose = () => {
    if (onNodeUpdate) {
      // 传递 null 表示关闭详情视图，不保存数据
      onNodeUpdate(null);
    }
  };

  /**
   * 添加Sticky Note
   */
  const handleAddStickyNote = useCallback(() => {
    if (reactFlowInstance && onAddStickyNote) {
      // 在画布中心添加sticky note
      const viewport = reactFlowInstance.getViewport();
      const canvasElement = document.querySelector('.react-flow__viewport')?.parentElement;
      const canvasWidth = canvasElement?.offsetWidth || 1200;
      const canvasHeight = canvasElement?.offsetHeight || 800;

      // 计算画布中心位置（考虑当前视口）
      const centerX = (canvasWidth / 2 - viewport.x) / viewport.zoom;
      const centerY = (canvasHeight / 2 - viewport.y) / viewport.zoom;

      onAddStickyNote({ x: centerX, y: centerY });
    }
  }, [reactFlowInstance, onAddStickyNote]);

  /**
   * 处理键盘删除事件
   * 删除选中的节点和边，但在配置面板打开时禁用
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    // 如果NodeDetailsView打开，阻止所有快捷键操作
    if (selectedNodeDetails) {
      if (event.key === 'Delete' ||
        ((event.ctrlKey || event.metaKey) && event.key === 'c') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'v')) {

        // 检查事件是否来自input、textarea、contenteditable或CodeMirror元素
        const target = event.target as HTMLElement;
        const isFromInputElement = target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.contentEditable === 'true' ||
          target.closest('input, textarea, [contenteditable="true"]') !== null ||
          target.closest('.cm-editor') !== null;

        if (isFromInputElement) {
          // 来自输入控件的事件，允许通过，不做任何处理
          return;
        } else {
          // 不是来自输入控件的事件，阻止画布快捷键操作
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    }

    // 复制操作检测
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      const selectedNodes = nodes.filter(node => node.selected);

      if (onCopyNodes && selectedNodes.length > 0) {
        onCopyNodes(selectedNodes);
      }

      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 粘贴操作检测
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
      if (onPasteNodes) {
        onPasteNodes();
      }

      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event.key === 'Delete') {
      const selectedNodes = nodes.filter(node => node.selected);
      const selectedEdges = edges.filter(edge => edge.selected);



      // 如果没有选中任何节点或边，但画布上只有一个节点，则选中并删除这个节点
      let nodesToDelete = selectedNodes;
      let edgesToDelete = selectedEdges;

      if (selectedNodes.length === 0 && selectedEdges.length === 0 && nodes.length === 1) {
        nodesToDelete = nodes;
        edgesToDelete = edges;
      }

      if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
        const removeChanges: (NodeRemoveChange | EdgeRemoveChange)[] = [];

        nodesToDelete.forEach(node => {
          removeChanges.push({
            type: 'remove',
            id: node.id
          });
        });

        edgesToDelete.forEach(edge => {
          removeChanges.push({
            type: 'remove',
            id: edge.id
          });
        });

        // 🔧 修复：分别处理节点和边的删除
        const nodeRemoveChanges = removeChanges.filter(change =>
          nodesToDelete.some(node => node.id === change.id)
        ) as NodeRemoveChange[];

        const edgeRemoveChanges = removeChanges.filter(change =>
          edgesToDelete.some(edge => edge.id === change.id)
        ) as EdgeRemoveChange[];



        if (nodeRemoveChanges.length > 0) {
          onNodesChange(nodeRemoveChanges);
        }

        if (edgeRemoveChanges.length > 0) {
          onEdgesChange(edgeRemoveChanges);
        }
      }
    }
  }, [nodes, edges, onNodesChange, onEdgesChange, selectedNodeDetails, onCopyNodes, onPasteNodes]);

  const handleFocus = useCallback(() => {
    // Container gained focus
  }, []);

  const handleBlur = useCallback(() => {
    // Container lost focus  
  }, []);

  // ReactFlow初始化回调
  const handleInit = useCallback((instance: any) => {
    // 不强制设置缩放，只同步当前状态
    const { zoom } = instance.getViewport();
    setZoomLevel(zoom);
  }, []);

  // 使用useOnViewportChange hook监听视口变化
  useOnViewportChange({
    onChange: useCallback((viewport: Viewport) => {
      setZoomLevel(viewport.zoom);
    }, [])
  });


  // ================ 渲染前状态 ================
  return (
    <>
      <ReactFlowGlobalStyles />
      <DebugTaskbar
        workflowLogData={workflowLogData}
        isTestingWorkflow={isTestingWorkflow}
        nodesDetailsMap={nodesDetailsMap}
      >
        <CanvasContainer
          className={isDragOver ? 'drag-over' : ''}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={0} // 允许容器获得焦点
        >
          <ReactFlow
            nodes={processedNodes.map(node => {
              // 为sticky note节点添加特殊处理
              if (node.type === 'stickyNote') {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    onUpdate: onUpdateStickyNote,
                    onDelete: onDeleteStickyNote,
                  },
                  // 确保selected属性被正确传递
                  selected: node.selected || false
                };
              }
              return node;
            })}
            edges={processedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={handleDrop}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={handleNodeDoubleClickInternal}
            nodeTypes={useMemo(() => {
              if (nodeTypes) {
                // 如果传入了nodeTypes，需要用createNodeWithExecutionStatus包装
                const wrappedNodeTypes: Record<string, React.ComponentType<any>> = {};
                Object.entries(nodeTypes).forEach(([key, Component]) => {
                  if (key === 'stickyNote') {
                    // stickyNote不需要包装
                    wrappedNodeTypes[key] = Component;
                  } else {
                    // 其他节点类型需要包装
                    wrappedNodeTypes[key] = createNodeWithExecutionStatus(Component);
                  }
                });
                return wrappedNodeTypes;
              }
              return NODE_TYPES;
            }, [nodeTypes])}
            proOptions={proOptions}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            fitView={false}
            onInit={handleInit}
            deleteKeyCode={null}
            selectNodesOnDrag={false}
            multiSelectionKeyCode='Shift'
            panOnDrag={[0, 1, 2]}
            selectionKeyCode='Shift'
          >
            <Controls />
            <Background color="#aaa" gap={16} />
            <Panel position="bottom-left">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ZoomDisplay
                  onClick={handleResetZoom}
                  style={{ marginLeft: '30px', marginBottom: '-8px' }}
                  className="zoom-display"
                >
                  {Math.round((zoomLevel || 1) * 100)}%
                </ZoomDisplay>
                {nodes.length > 1 && (
                  <ZoomDisplay
                    onClick={handleAutoLayout}
                    style={{ marginBottom: '-8px', marginLeft: '88px', }}
                    // className="auto-layout-btn"
                    title="自动整理布局"
                  >
                    {/* 自动布局 */}
                    <MdAutoFixHigh />
                  </ZoomDisplay>
                )}
              </div>
            </Panel>

            {/* Sticky Note添加按钮 */}
            <Panel position="top-right">
              <div style={{
                marginTop: '10px',
                marginRight: '10px'
              }}>
                <StickyNoteButton
                  onClick={handleAddStickyNote}
                  title="添加便签"
                >
                  <MdOutlineStickyNote2 size={16} />
                </StickyNoteButton>
              </div>
            </Panel>

            {/* 测试按钮Panel */}
            <Panel position="bottom-center">
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px',
                transform: menuCollapsed ? 'translateX(-50px)' : 'translateX(0)',
                transition: 'transform 0.3s ease',
              }}>
                <CoButton
                  onClick={() => {
                    if (isTestingWorkflow) {
                      // 停止工作流调试时，将当前正在执行的节点状态设置为FAILED
                      if (getNodeExecutionStatus) {
                        const newFailedOverrides = new Set<string>();
                        // 遍历所有节点，找到当前正在执行的节点（状态为RUNNING）
                        nodes.forEach(node => {
                          const nodeName = node.data.name || node.id;
                          const nodeStatus = getNodeExecutionStatus(nodeName);
                          if (nodeStatus && nodeStatus.status === 'RUNNING') {
                            newFailedOverrides.add(nodeName);
                          }
                        });
                        setFailedNodeOverrides(newFailedOverrides);
                      }
                      onStopWorkflowTest?.();
                    } else {
                      onWorkflowTest?.();
                    }
                  }}
                  disabled={!workflowId}
                  style={{ borderRadius: '4px' }}
                >
                  {isTestingWorkflow ? <BsStopCircleFill /> : <MdNotStarted size={16} />}
                  {isTestingWorkflow ? '停止流调试' : '业务流调试'}
                </CoButton>
              </div>
            </Panel>
          </ReactFlow>

          {selectedNodeDetails && (
            <NodeDetailsView
              node={selectedNodeDetails.node}
              parameters={selectedNodeDetails.parameters || []}
              savedValues={selectedNodeDetails.savedValues || {}}
              onClose={handleNodeDetailsClose}
              onSave={handleNodeSettingsSave}
              onNodeIdChange={onNodeIdChange}
              nodeWidth={nodeWidth}
              onTest={selectedNodeDetails.onTest}
              onTestPreviousNode={selectedNodeDetails.onTestPreviousNode}
              onSaveMockData={selectedNodeDetails.onSaveMockData}
              testOutput={selectedNodeDetails.testOutput}
              lastTestResult={selectedNodeDetails.lastTestResult}
              previousNodeIds={selectedNodeDetails.previousNodeIds}
              onPreviousNodeChange={selectedNodeDetails.onPreviousNodeChange}
              selectedPreviousNodeId={selectedNodeDetails.selectedPreviousNodeId}
              nodesTestResultsMap={nodesTestResultsMap || selectedNodeDetails.nodesTestResultsMap}
              getLatestNodesTestResultsMap={getLatestNodesTestResultsMap || selectedNodeDetails.getLatestNodesTestResultsMap}
              nodesDetailsMap={selectedNodeDetails.nodesDetailsMap}
              onAIhelpClick={selectedNodeDetails.onAIhelpClick}
              showToast={selectedNodeDetails.showToast}
              connectConfigs={connectConfigs}
              onFetchConnectInstances={onFetchConnectInstances}
              onFetchConnectDetail={onFetchConnectDetail}
              linkageCallbacks={linkageCallbacks}
              isNodeTesting={selectedNodeDetails.isNodeTesting}
              nodeTestEventId={selectedNodeDetails.nodeTestEventId}
              onStopTest={selectedNodeDetails.onStopTest}
            />
          )}
        </CanvasContainer>
      </DebugTaskbar>
    </>
  );
});

WorkflowCanvas.displayName = 'WorkflowCanvas';