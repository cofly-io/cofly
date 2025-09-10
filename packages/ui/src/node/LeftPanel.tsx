"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { JsonTree } from '../components/basic/JsonTree';
import {
  Panel,
  PanelTitle,
  OutputContainer,
  OutputContainerTitle,
  OutputContainerContent,
  NodeEmptyState,
  NodeEmptyStateText,
  PreviousNodeSelector,
  SelectorLabel,
  SelectDropdown,
  ButtonGroup,
  DataViewButton,
  ExecuteButton,
} from './sharedStyles';

import type { LeftPanelProps } from './types';

// Custom hook for optimized test result polling
const useTestResultPolling = (
  selectedNodeId: string,
  nodesTestResultsMap: Record<string, any> | undefined,
  getLatestNodesTestResultsMap: (() => Record<string, any>) | undefined,
  onDisplayTestResult: ((testResult: any) => void) | undefined,
  onTest: ((nodeValues: Record<string, any>, nodeId: string) => void) | undefined,
  nodesDetailsMap: Record<string, any> | undefined,
  showToast: ((type: 'error' | 'warning', title: string, message: string) => void) | undefined
) => {
  const [localTestResult, setLocalTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 60; // 增加�?0次尝�?
  const pollInterval = 2000; // 增加�?秒间�?

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    attemptCountRef.current = 0;
    setIsExecuting(false);
  }, []);

  const startPolling = useCallback((nodeId: string) => {
    attemptCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      attemptCountRef.current += 1;

      const currentMap = getLatestNodesTestResultsMap ? getLatestNodesTestResultsMap() : nodesTestResultsMap;

      if (currentMap?.[nodeId]) {
        const testResult = currentMap[nodeId];
        setLocalTestResult(testResult);
        onDisplayTestResult?.(testResult);
        stopPolling();
        return;
      }

      if (attemptCountRef.current >= maxAttempts) {
        stopPolling();
      }
    }, pollInterval);
  }, [nodesTestResultsMap, getLatestNodesTestResultsMap, onDisplayTestResult, stopPolling, maxAttempts, pollInterval]);

  const executeNode = useCallback(async (nodeId: string) => {
    if (!nodesDetailsMap?.[nodeId]?.savedValues) {
      showToast?.('warning', '配置缺失', `"${nodeId}" 的节点没有做任何配置，执行失败`);
      return;
    }

    if (!onTest) {
      console.error('❌ [LeftPanel] onTest function not provided');
      return;
    }

    setIsExecuting(true);
    const nodeValues = nodesDetailsMap[nodeId].savedValues || {};

    try {
      onTest(nodeValues, nodeId);
      startPolling(nodeId);
    } catch (error) {
      console.error('❌ [LeftPanel] onTest execution failed:', error);
      startPolling(nodeId);
    }
  }, [nodesDetailsMap, showToast, onTest, startPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Update local result when external state changes
  useEffect(() => {
    const currentMap = getLatestNodesTestResultsMap ? getLatestNodesTestResultsMap() : nodesTestResultsMap;

    if (selectedNodeId && currentMap?.[selectedNodeId]) {
      const testResult = currentMap[selectedNodeId];
      setLocalTestResult(testResult);
      onDisplayTestResult?.(testResult);

      // 如果找到结果，停止polling
      if (isExecuting) {
        setIsExecuting(false);
        stopPolling();
      }
    } else if (selectedNodeId && !isExecuting) {
      // 只有在不执行状态下才清除结果，避免执行过程中的闪烁
      setLocalTestResult(null);
      onDisplayTestResult?.(null);
    }
  }, [selectedNodeId, nodesTestResultsMap, getLatestNodesTestResultsMap, isExecuting, onDisplayTestResult, stopPolling]);

  // 添加一个额外的effect来监听nodesTestResultsMap的变�?
  useEffect(() => {
    if (selectedNodeId && isExecuting) {
      const currentMap = getLatestNodesTestResultsMap ? getLatestNodesTestResultsMap() : nodesTestResultsMap;

      if (currentMap?.[selectedNodeId]) {
        const testResult = currentMap[selectedNodeId];
        setLocalTestResult(testResult);
        onDisplayTestResult?.(testResult);
        setIsExecuting(false);
        stopPolling();
      }
    }
  }, [nodesTestResultsMap, selectedNodeId, isExecuting, getLatestNodesTestResultsMap, onDisplayTestResult, stopPolling]);

  return {
    localTestResult,
    isExecuting,
    executeNode: (nodeId: string) => executeNode(nodeId),
    setLocalTestResult
  };
};

export const LeftPanel: React.FC<LeftPanelProps> = React.memo(({
  width,
  previousNodeOutput,
  previousNodeIds = [],
  onPreviousNodeChange,
  selectedPreviousNodeId,
  onTest,
  nodeWidth,
  showSettings,
  nodesTestResultsMap,
  getLatestNodesTestResultsMap,
  onDisplayTestResult,
  nodesDetailsMap,
  showToast
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(selectedPreviousNodeId || '');
  const [viewMode, setViewMode] = useState<'json' | '结构'>('json');

  // Use optimized polling hook
  const { localTestResult, isExecuting, executeNode, setLocalTestResult } = useTestResultPolling(
    selectedNodeId,
    nodesTestResultsMap,
    getLatestNodesTestResultsMap,
    onDisplayTestResult,
    onTest,
    nodesDetailsMap,
    showToast
  );

  // 响应 selectedPreviousNodeId prop 的变化，保持选中状态
  // 但要避免在用户主动选择后被覆盖
  // 如果有传入的selectedPreviousNodeId，说明用户之前已经选择过了
  const [userHasSelected, setUserHasSelected] = useState(!!selectedPreviousNodeId);

  // 组件初始化时，如果有传入的selectedPreviousNodeId，设置为选中状态
  useEffect(() => {
    // 只在组件初始化时，如果有传入的selectedPreviousNodeId且在可选列表中，设置为选中状态
    if (selectedPreviousNodeId && 
        previousNodeIds.includes(selectedPreviousNodeId) && 
        selectedPreviousNodeId !== selectedNodeId) {
      
      setSelectedNodeId(selectedPreviousNodeId);
      
      // 检查是否有对应的测试结果
      if (nodesTestResultsMap?.[selectedPreviousNodeId]) {
        const testResult = nodesTestResultsMap[selectedPreviousNodeId];
        setLocalTestResult(testResult);
        onDisplayTestResult?.(testResult);
      }
    }
  }, [selectedPreviousNodeId, previousNodeIds]); // 移除selectedNodeId和userHasSelected依赖，避免循环更新

  // 当有前置节点但没有选中任何节点时，自动选中第一个
  // 但只有在没有传入selectedPreviousNodeId的情况下才自动选择
  useEffect(() => {
    if (previousNodeIds.length > 0 && !selectedNodeId && !selectedPreviousNodeId && previousNodeIds[0]) {
      const firstNodeId = previousNodeIds[0];
      setSelectedNodeId(firstNodeId);
      onPreviousNodeChange?.(firstNodeId);

      // 自动选择时也要检查是否有测试结果
      if (nodesTestResultsMap?.[firstNodeId]) {
        const testResult = nodesTestResultsMap[firstNodeId];
        setLocalTestResult(testResult);
        onDisplayTestResult?.(testResult);
      }
    }
  }, [previousNodeIds, selectedNodeId, selectedPreviousNodeId, onPreviousNodeChange, nodesTestResultsMap, setLocalTestResult, onDisplayTestResult]);

  const handleNodeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newNodeId = event.target.value;
    
    // 标记用户已经主动选择过
    setUserHasSelected(true);
    
    setSelectedNodeId(newNodeId);
    
    // 通知父组件状态变化
    if (onPreviousNodeChange) {
      onPreviousNodeChange(newNodeId);
    } else {
      console.warn('⚠️ [LeftPanel] onPreviousNodeChange is not provided!');
    }

    // 检查是否有对应的测试结果
    if (nodesTestResultsMap?.[newNodeId]) {
      const testResult = nodesTestResultsMap[newNodeId];
      setLocalTestResult(testResult);
      onDisplayTestResult?.(testResult);
    } else {
      setLocalTestResult(null);
      onDisplayTestResult?.(null);
    }
  }, [onPreviousNodeChange, nodesTestResultsMap, setLocalTestResult, onDisplayTestResult, selectedNodeId, userHasSelected]);

  const handleExecute = useCallback(() => {
    if (previousNodeIds.length > 0 && selectedNodeId) {
      executeNode(selectedNodeId);
    }
  }, [previousNodeIds, selectedNodeId, executeNode]);



  // 组件挂载时检查默认选中的节点
  useEffect(() => {
    if (selectedNodeId && nodesTestResultsMap?.[selectedNodeId]) {
      const testResult = nodesTestResultsMap[selectedNodeId];
      setLocalTestResult(testResult);
      onDisplayTestResult?.(testResult);
    }
  }, []); // Empty dependency array for mount-only effect

  // 生成 JSON 数据和 Schema
  const generateSchema = useCallback((data: any): any => {
    if (data === null || data === undefined) {
      return { type: 'null' };
    }

    if (typeof data === 'string') {
      return { type: 'string', example: data };
    }

    if (typeof data === 'number') {
      return { type: 'number', example: data };
    }

    if (typeof data === 'boolean') {
      return { type: 'boolean', example: data };
    }

    if (Array.isArray(data)) {
      const schema: any = { type: 'array' };
      if (data.length > 0) {
        schema.items = generateSchema(data[0]);
        schema.example = [data[0]];
      }
      return schema;
    }

    if (typeof data === 'object') {
      const schema: any = { type: 'object', properties: {} };
      const example: any = {};

      for (const [key, value] of Object.entries(data)) {
        schema.properties[key] = generateSchema(value);
        example[key] = value;
      }

      schema.example = example;
      return schema;
    }

    return { type: 'unknown', example: data };
  }, []);

  // 切换视图模式
  const handleViewModeChange = useCallback((mode: 'json' | '结构') => {
    setViewMode(mode);
  }, []);

  return (
    <Panel $width={width}>
      <PanelTitle>前置节点输入</PanelTitle>
      <OutputContainer style={{ marginRight: showSettings ? `${(nodeWidth || 500) / 2 - 20}px` : '0px' }}>
        <OutputContainerTitle>
          {/* 前置节点选择下拉框 - 只在有前置节点时显示 */}
          {previousNodeIds.length > 0 && (
            <PreviousNodeSelector>
              <SelectorLabel>前置节点 : </SelectorLabel>
              <SelectDropdown
                value={selectedNodeId}
                onChange={handleNodeChange}
                disabled={previousNodeIds.length === 0}
              >
                {previousNodeIds.map(nodeId => (
                  <option key={nodeId} value={nodeId}>
                    {nodeId}
                  </option>
                ))}
              </SelectDropdown>

              {/* JSON 和 Schema 按钮 */}
              {selectedNodeId && localTestResult && (
                <ButtonGroup>
                  <DataViewButton
                    $active={viewMode === 'json'}
                    onClick={() => handleViewModeChange('json')}
                  >
                    JSON
                  </DataViewButton>
                  <DataViewButton
                    $active={viewMode === '结构'}
                    onClick={() => handleViewModeChange('结构')}
                  >
                    结构
                  </DataViewButton>
                </ButtonGroup>
              )}
            </PreviousNodeSelector>
          )}
        </OutputContainerTitle>

        <OutputContainerContent>
          {previousNodeIds.length === 0 ? (
            <NodeEmptyState>
              <NodeEmptyStateText>
                当前节点无前置节点
              </NodeEmptyStateText>
            </NodeEmptyState>
          ) : previousNodeOutput ? (
            previousNodeOutput
          ) : selectedNodeId ? (
            // 选中了前置节点
            localTestResult ? (
              // 有本地测试结果，根据视图模式显示不同数据
              (() => {
                // 检查数据格式并进行适配
                let displayData;
                
                if (localTestResult && typeof localTestResult === 'object') {
                  // 如果数据已经是包装格式 {data: ..., success: ...}
                  if (localTestResult.data !== undefined && localTestResult.success !== undefined) {
                    displayData = {
                      data: localTestResult.data,
                      success: localTestResult.success
                    };
                  } else {
                    // 旧格式或直接数据，包装为新格式
                    displayData = {
                      data: localTestResult,
                      success: true
                    };
                  }
                } else {
                  // 处理空数据或非对象数据
                  displayData = {
                    data: localTestResult,
                    success: true
                  };
                }
                
                return (
                  <JsonTree
                    data={viewMode === '结构' ? generateSchema(displayData) : displayData}
                    nodeId={selectedNodeId}
                    draggable={true}
                  />
                );
              })()
            ) : (
              // 没有测试结果，显示执行按钮
              <NodeEmptyState>
                <NodeEmptyStateText>
                  节点 "{selectedNodeId}" 无测试结果
                </NodeEmptyStateText>
                <ExecuteButton $disabled={isExecuting} onClick={handleExecute}>
                  {isExecuting ? (
                    <>
                      <span className="loading-icon">⏳</span>
                      执行中...
                    </>
                  ) : (
                    '执行前置节点'
                  )}
                </ExecuteButton>
              </NodeEmptyState>
            )
          ) : (
            // 未选中前置节点的默认状态
            <NodeEmptyState>
              <NodeEmptyStateText>
                请选择前置节点
              </NodeEmptyStateText>
            </NodeEmptyState>
          )}
        </OutputContainerContent>
      </OutputContainer>
    </Panel>
  );
});