/**
 * 调试跟踪任务栏组件
 * 
 * 功能：
 * 1. 显示在画布底部的25px高度任务栏
 * 2. 点击后展开30vh的调试面板
 * 3. 展开时将画布内容向上推，而不是覆盖
 * 4. 支持拖拽调整面板高度
 * 5. 显示工作流测试的实时数据
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaChevronUp, FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import styled from 'styled-components';
import { JsonTree } from '../basic/JsonTree/JsonTree';
import { getThemeIcon } from '../../utils/themeIcon';
import { useTheme } from '../../context/ThemeProvider';

// 任务栏容器
const TaskbarContainer = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#f8fafc'};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

// 任务栏头部（始终可见的25px区域）
const TaskbarHeader = styled.div`
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#f8fafc'};
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#f1f5f9'};
  }
`;

// 任务栏标题
const TaskbarTitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#475569'};
`;

// 图标容器
const IconContainer = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  transition: transform 0.3s ease;
  transform: ${({ $isExpanded }) => $isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

// 拖拽手柄
const DragHandle = styled.div<{ $isExpanded: boolean }>`
  height: ${({ $isExpanded }) => $isExpanded ? '1px' : '0'};
  background: ${({ theme }) => theme.mode === 'dark' ? '#475569' : '#cbd5e1'};
  cursor: ns-resize;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    height: ${({ $isExpanded }) => $isExpanded ? '2px' : '0'};
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 2px;
    background: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
    border-radius: 1px;
    opacity: ${({ $isExpanded }) => $isExpanded ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

// 调试面板内容区域
const DebugPanel = styled.div<{ $isExpanded: boolean; $height: number }>`
  height: ${({ $isExpanded, $height }) => $isExpanded ? `${$height}px` : '0'};
  overflow: hidden;
  transition: ${({ $isExpanded }) => $isExpanded ? 'none' : 'height 0.3s ease'};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
  border-top: ${({ $isExpanded }) => $isExpanded ? '1px solid' : '0px solid'} ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
`;

// 调试面板内容
const DebugContent = styled.div`
  padding: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// 三列布局容器
const ThreeColumnLayout = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;
`;

// 节点列表列
const NodeColumn = styled.div`
  width: 300px;
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  display: flex;
  flex-direction: column;
`;

// 输入输出列
const DataColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

// 列标题
const ColumnHeader = styled.div`
  padding: 12px 16px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#f8fafc'};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
`;

// 列内容
const ColumnContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? '#1e293b' : '#f1f5f9'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? '#475569' : '#cbd5e1'};
    border-radius: 3px;
  }
`;

// 节点项
const NodeItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: ${({ theme, $isSelected }) =>
    $isSelected
      ? (theme.mode === 'dark' ? '#374151' : '#e0f2fe')
      : (theme.mode === 'dark' ? '#1e293b' : '#ffffff')
  };
  border: 1px solid ${({ theme, $isSelected }) =>
    $isSelected
      ? (theme.mode === 'dark' ? '#4b5563' : '#0284c7')
      : (theme.mode === 'dark' ? '#334155' : '#e2e8f0')
  };
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, $isSelected }) =>
    $isSelected
      ? (theme.mode === 'dark' ? '#374151' : '#e0f2fe')
      : (theme.mode === 'dark' ? '#334155' : '#f1f5f9')
  };
  }
`;

// 节点图标
const NodeIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  flex-shrink: 0;
`;

// 节点信息
const NodeInfo = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

// 节点名称
const NodeName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f1f5f9' : '#1e293b'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 20px; /* 为状态图标留出空间 */
`;

// 状态图标 - 定位在右上角
const StatusIcon = styled.div<{ $status: string }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  color: ${({ $status }) => {
    switch ($status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return '#10b981';
      case 'RUNNING':
        return '#f59e0b';
      case 'FAILED':
      case 'ERROR':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

// JSON 数据容器
const JsonContainer = styled.div`
  height: 100%;
  padding: 8px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f172a' : '#ffffff'};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
`;

// 空状态
const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 14px;
`;

// 画布容器调整器（用于为任务栏腾出空间）
const CanvasAdjuster = styled.div<{ $isExpanded: boolean; $panelHeight: number; $isResizing: boolean }>`
  height: 100%;
  padding-bottom: ${({ $isExpanded, $panelHeight }) => $isExpanded ? 25 + 4 + $panelHeight : 25}px;
  transition: ${({ $isResizing }) => $isResizing ? 'none' : 'padding-bottom 0.3s ease'};
  box-sizing: border-box;
`;

// 工作流日志数据接口
interface WorkflowSpan {
  name: string;
  status: string;
  attempts: number;
  queuedAt: string;
  startedAt: string;
  endedAt: string | null;
  isRoot: boolean;
  isUserland: boolean;
  userlandSpan: any;
  outputID: string | null;
  spanID: string;
  stepID: string | null;
  stepOp: string | null;
  stepInfo: any;
  childrenSpans: WorkflowSpan[];
  // 扩展字段用于显示
  nodeKind?: string;
  input?: any;
  output?: any;
}

interface DebugTaskbarProps {
  children?: React.ReactNode;
  workflowLogData?: WorkflowSpan | null;
  isTestingWorkflow?: boolean;
  nodesDetailsMap?: Record<string, any>;
}

// 调试任务栏包装器
const DebugTaskbarWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const DebugTaskbar: React.FC<DebugTaskbarProps> = ({
  children,
  workflowLogData,
  isTestingWorkflow = false,
  nodesDetailsMap = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [panelHeight, setPanelHeight] = useState(window.innerHeight * 0.3); // 默认30vh
  const [isResizing, setIsResizing] = useState(false);
  const [selectedNodeSpan, setSelectedNodeSpan] = useState<WorkflowSpan | null>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(0);
  const { themeMode } = useTheme();

  // 设置最小和最大高度限制
  const MIN_HEIGHT = 100; // 最小100px
  const MAX_HEIGHT = window.innerHeight * 0.8; // 最大80vh，确保不会完全覆盖画布

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // 获取节点spans（从childrenSpans中提取节点信息）
  const getNodeSpans = useCallback((): WorkflowSpan[] => {
    if (!workflowLogData?.childrenSpans) return [];

    const extractNodeSpans = (spans: WorkflowSpan[]): WorkflowSpan[] => {
      const nodeSpans: WorkflowSpan[] = [];
      const startSpans: Map<string, WorkflowSpan> = new Map(); // 存储 :start 节点

      spans.forEach(span => {
        // 如果span的name看起来像节点名称，处理它
        if (span.name) {
          // 检查是否是 :start 节点
          if (span.name.endsWith(':start')) {
            // 提取主节点名称（去掉 :start 后缀）
            const mainNodeName = span.name.slice(0, -6); // 移除 ':start'
            startSpans.set(mainNodeName, span);
          } else {
            // 普通节点，只有在 nodesDetailsMap 中存在时才添加到列表中
            if (nodesDetailsMap[span.name]) {
              nodeSpans.push(span);
            }
          }
        }

        // 递归处理子spans
        if (span.childrenSpans && span.childrenSpans.length > 0) {
          nodeSpans.push(...extractNodeSpans(span.childrenSpans));
        }
      });

      // 将 :start 节点的数据合并到对应的主节点中
      nodeSpans.forEach(nodeSpan => {
        const startSpan = startSpans.get(nodeSpan.name);
        if (startSpan) {
          // 将 :start 节点的输出作为主节点的输入
          nodeSpan.input = startSpan.output || startSpan.input;
        }
      });

      return nodeSpans;
    };

    return extractNodeSpans(workflowLogData.childrenSpans);
  }, [workflowLogData, nodesDetailsMap]);

  // 获取状态图标
  const getStatusIcon = useCallback((status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <FaCheckCircle />;
      case 'RUNNING':
        return <FaClock />;
      case 'FAILED':
      case 'ERROR':
        return <FaExclamationCircle />;
      default:
        return <FaClock />;
    }
  }, []);

  // 获取节点图标路径
  const getNodeIconPath = useCallback((span: WorkflowSpan) => {
    // 从nodesDetailsMap中查找节点信息
    const nodeDetails = nodesDetailsMap[span.name];
    if (nodeDetails?.nodeInfo?.data) {
      const nodeData = nodeDetails.nodeInfo.data;

      // 使用getThemeIcon获取完整路径
      let iconPath = getThemeIcon(
        nodeData.icon,
        themeMode,
        nodeData.kind,
        nodeData.category
      );


      // 如果获取到路径
      if (iconPath) {
        // 确保路径以.svg结尾
        if (!iconPath.endsWith('.svg') && !iconPath.includes('.')) {
          iconPath += '.svg';
        }
        return iconPath;
      }
    }

    // 如果没有找到节点信息，使用默认图标
    return '/nodes/default/default.svg';
  }, [nodesDetailsMap, themeMode]);

  // 处理output数据转换
  const processOutputData = useCallback((output: any) => {
    if (!output) return output;


    // 如果output有data字段且data是字符串
    if (output.data && typeof output.data === 'string') {

      try {
        // 尝试解析data字段为JSON
        const parsedData = JSON.parse(output.data);

        // 创建新的output对象，将解析后的JSON作为data
        const processedOutput = {
          ...output,
          data: parsedData
        };

        return processedOutput;
      } catch (error) {
        // 如果解析失败，保持原样（data作为字符串）
        return output;
      }
    }

    return output;
  }, []);

  // 处理节点选择
  const handleNodeSelect = useCallback((span: WorkflowSpan) => {
    setSelectedNodeSpan(span);
  }, []);

  // 开始拖拽
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 防止触发任务栏的点击事件

    setIsResizing(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = panelHeight;

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [panelHeight]);

  // 拖拽移动
  const handleDragMove = useCallback((e: MouseEvent) => {
    const deltaY = dragStartY.current - e.clientY; // 向上拖拽为正值
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragStartHeight.current + deltaY));
    setPanelHeight(newHeight);
  }, [MIN_HEIGHT, MAX_HEIGHT]);

  // 结束拖拽
  const handleDragEnd = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleDragMove]);

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleDragMove, handleDragEnd]);

  // 窗口大小变化时重新计算最大高度
  useEffect(() => {
    const handleResize = () => {
      const newMaxHeight = window.innerHeight * 0.8;
      if (panelHeight > newMaxHeight) {
        setPanelHeight(newMaxHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [panelHeight]);

  return (
    <DebugTaskbarWrapper>
      {/* 画布内容调整器 */}
      <CanvasAdjuster $isExpanded={isExpanded} $panelHeight={panelHeight} $isResizing={isResizing}>
        {children}
      </CanvasAdjuster>

      {/* 任务栏 */}
      <TaskbarContainer $isExpanded={isExpanded}>
        {/* 拖拽手柄 */}
        <DragHandle
          $isExpanded={isExpanded}
          onMouseDown={handleDragStart}
        />

        {/* 任务栏头部 */}
        <TaskbarHeader onClick={handleToggle}>
          <TaskbarTitle>
            调试跟踪
            {workflowLogData && (
              <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.8 }}>
                - {workflowLogData.status} ({getNodeSpans().length} 个节点)
              </span>
            )}
          </TaskbarTitle>
          <IconContainer $isExpanded={isExpanded}>
            <FaChevronUp size={12} />
          </IconContainer>
        </TaskbarHeader>

        {/* 调试面板 */}
        <DebugPanel $isExpanded={isExpanded} $height={panelHeight}>
          <DebugContent>
            <ThreeColumnLayout>
              {/* 第一列：节点列表 */}
              <NodeColumn>
                <ColumnHeader>节点执行状态</ColumnHeader>
                <ColumnContent>
                  {getNodeSpans().map((span, index) => (
                    <NodeItem
                      key={span.spanID || index}
                      $isSelected={selectedNodeSpan?.spanID === span.spanID}
                      onClick={() => handleNodeSelect(span)}
                    >
                      <NodeIcon
                        src={getNodeIconPath(span)}
                        alt={span.name}
                      />
                      <NodeInfo>
                        <NodeName>{span.name}</NodeName>
                        <StatusIcon
                          $status={span.status}
                          title={span.status}
                        >
                          {getStatusIcon(span.status)}
                        </StatusIcon>
                      </NodeInfo>
                    </NodeItem>
                  ))}
                  {getNodeSpans().length === 0 && (
                    <EmptyState>
                      {isTestingWorkflow ? '等待节点执行...' : '暂无执行数据'}
                    </EmptyState>
                  )}
                </ColumnContent>
              </NodeColumn>

              {/* 第二列：输入数据 */}
              <DataColumn>
                <ColumnHeader>输入数据</ColumnHeader>
                <ColumnContent>
                  {selectedNodeSpan?.input ? (
                    <JsonContainer>
                      <JsonTree
                        data={selectedNodeSpan.input}
                        draggable={false}
                        initialExpandDepth={3}
                      />
                    </JsonContainer>
                  ) : (
                    <EmptyState>
                      {selectedNodeSpan ? '暂无输入数据' : '请选择节点查看输入数据'}
                    </EmptyState>
                  )}
                </ColumnContent>
              </DataColumn>

              {/* 第三列：输出数据 */}
              <DataColumn>
                <ColumnHeader>输出数据</ColumnHeader>
                <ColumnContent>
                  {selectedNodeSpan?.output ? (
                    <JsonContainer>
                      <JsonTree
                        data={processOutputData(selectedNodeSpan.output)}
                        draggable={false}
                        initialExpandDepth={3}
                      />
                    </JsonContainer>
                  ) : (
                    <EmptyState>
                      {selectedNodeSpan ? '暂无输出数据' : '请选择节点查看输出数据'}
                    </EmptyState>
                  )}
                </ColumnContent>
              </DataColumn>
            </ThreeColumnLayout>
          </DebugContent>
        </DebugPanel>
      </TaskbarContainer>
    </DebugTaskbarWrapper>
  );
};

export default DebugTaskbar;