/**
 * 节点管理组件 - 应用层组件
 * 
 * 负责管理节点的详情显示、测试和配置
 * 这个组件主要作为节点相关功能的容器和协调器
 */

import React, { useCallback, useState, useMemo } from 'react';
import styled from 'styled-components';

// UI组件导入
import { NodeDetailsView } from '@repo/ui';

// 应用层hooks导入
import { useNodeTesting } from '../../hooks/useNodeTesting';
import { useConnectConfig } from '../../hooks/useConnectConfig';

// 工具函数导入
import { getAllPreviousNodeIds } from '../../utils/nodeProcessing';
import { logger } from '../../utils/errorHandling';

// 类型导入
import { NodeDetails, ConnectConfig, FetchTablesResponse } from '../../types/node';

const NodeManagementContainer = styled.div`
  position: relative;
  z-index: 1000;
`;

interface NodeManagementProps {
  selectedNode?: any; // 选中的节点详情数据
  nodesDetailsMap: Record<string, NodeDetails>;
  nodesTestResultsMap: Record<string, any>;
  edgesState: any[]; // Edge类型
  workflowId: string;
  updateNodeDetails: (nodeId: string, details: Partial<NodeDetails>) => void;
  updateNodeTestResult: (nodeId: string, result: any) => void;
  deleteNodeCompletely: (nodeId: string) => void;
  onClose: () => void;
  onNodeSave: (nodeData: any) => void;
  onNodeIdChange?: (oldId: string, newId: string) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  //这个要改，不对的
  connectConfigs?: ConnectConfig[];
  onFetchConnectConfigs?: (ctype?: string) => Promise<ConnectConfig[]>;
  onFetchTables?: (datasourceId: string, search?: string) => Promise<FetchTablesResponse>;
}

/**
 * 节点管理组件
 */
export const NodeManagement: React.FC<NodeManagementProps> = ({
  selectedNode,
  nodesDetailsMap,
  nodesTestResultsMap,
  edgesState,
  workflowId,
  updateNodeDetails,
  updateNodeTestResult,
  deleteNodeCompletely,
  onClose,
  onNodeSave,
  onNodeIdChange,
  showError,
  showSuccess,
  showWarning,
  connectConfigs = [],
  onFetchConnectConfigs,
  onFetchTables
}) => {

  // 节点测试状态
  const [testOutput, setTestOutput] = useState<string>('');
  const [selectedPreviousNodeId, setSelectedPreviousNodeId] = useState<string>('');

  // 初始化节点测试hook
  const nodeTestingHook = useNodeTesting({
    workflowId,
    nodesDetailsMap,
    nodesTestResultsMap,
    edgesState,
    updateNodeTestResult,
    updateNodeDetails,
    showError,
    showSuccess,
    showWarning
  });

  // 初始化连接配置hook
  const connectConfigHook = useConnectConfig({
    showError,
    showWarning,
    showSuccess
  });

  /**
   * 处理节点测试
   */
  const handleNodeTest = useCallback(async (nodeValues: Record<string, any>) => {
    if (!selectedNode?.node?.id) return;

    const nodeId = selectedNode.node.id;
    logger.info('开始节点测试', { nodeId, nodeValues: Object.keys(nodeValues) });

    const result = await nodeTestingHook.handleNodeTest(nodeValues, nodeId);

    if (result && result.success) {
      setTestOutput(JSON.stringify(result.data, null, 2));
    } else {
      setTestOutput(`测试失败: ${result?.error || '未知错误'}`);
    }
  }, [selectedNode, nodeTestingHook]);

  /**
   * 处理前置节点测试
   */
  const handleTestPreviousNode = useCallback(async (
    nodeValues: Record<string, any>,
    targetNodeId: string
  ) => {
    logger.info('开始前置节点测试', { targetNodeId, nodeValues: Object.keys(nodeValues) });

    const result = await nodeTestingHook.handleLeftPanelNodeTest(nodeValues, targetNodeId);

    if (result && result.success) {
      setTestOutput(JSON.stringify(result.data, null, 2));
    } else {
      setTestOutput(`前置节点测试失败: ${result?.error || '未知错误'}`);
    }
  }, [nodeTestingHook]);

  /**
   * 处理保存模拟数据
   */
  const handleSaveMockData = useCallback((mockTestResult: any) => {
    if (!selectedNode?.node?.id) return;

    const nodeId = selectedNode.node.id;
    nodeTestingHook.handleSaveMockData(mockTestResult, nodeId);
  }, [selectedNode, nodeTestingHook]);

  /**
   * 处理前置节点选择变化
   */
  const handlePreviousNodeChange = useCallback((nodeId: string) => {
    setSelectedPreviousNodeId(nodeId);
  }, []);

  /**
   * 计算前置节点列表
   */
  const previousNodeIds = useMemo(() => {
    if (!selectedNode?.node?.id) return [];

    return getAllPreviousNodeIds(
      selectedNode.node.id,
      edgesState,
      nodesDetailsMap
    );
  }, [selectedNode, edgesState, nodesDetailsMap]);

  /**
   * 获取节点参数
   */
  const nodeParameters = useMemo(() => {
    if (!selectedNode?.node?.data?.parameters) return [];
    return selectedNode.node.data.parameters;
  }, [selectedNode]);

  /**
   * 获取保存的值
   */
  const savedValues = useMemo(() => {
    if (!selectedNode?.node?.id) return {};

    const nodeDetails = nodesDetailsMap[selectedNode.node.id];
    return nodeDetails?.savedValues || {};
  }, [selectedNode, nodesDetailsMap]);

  /**
   * 获取最后的测试结果
   */
  const lastTestResult = useMemo(() => {
    if (!selectedNode?.node?.id) return null;

    const nodeDetails = nodesDetailsMap[selectedNode.node.id];
    return nodeDetails?.lastTestResult || null;
  }, [selectedNode, nodesDetailsMap]);

  /**
   * Toast显示函数
   */
  const showToast = useCallback((type: 'error' | 'warning', title: string, message: string) => {
    if (type === 'error') {
      showError(title, message);
    } else {
      showWarning(title, message);
    }
  }, [showError, showWarning]);

  // 使用connect config hook的函数，如果父组件没有提供的话
  const finalFetchConnectConfigs = onFetchConnectConfigs || connectConfigHook.handleFetchConnectConfigs;
  const finalFetchTables = onFetchTables || connectConfigHook.handleFetchTables;

  // 如果没有选中的节点，不渲染任何内容
  if (!selectedNode) {
    return null;
  }

  return (
    <NodeManagementContainer>
      <NodeDetailsView
        node={selectedNode.node}
        parameters={nodeParameters}
        savedValues={savedValues}
        onClose={onClose}
        onSave={onNodeSave}
        onNodeIdChange={onNodeIdChange}
        nodeWidth={selectedNode.node?.data?.nodeWidth}
        onTest={handleNodeTest}
        onTestPreviousNode={handleTestPreviousNode}
        onSaveMockData={handleSaveMockData}
        testOutput={testOutput}
        lastTestResult={lastTestResult}
        previousNodeIds={previousNodeIds}
        onPreviousNodeChange={handlePreviousNodeChange}
        selectedPreviousNodeId={selectedPreviousNodeId}
        nodesTestResultsMap={nodesTestResultsMap}
        getLatestNodesTestResultsMap={nodeTestingHook.getLatestNodesTestResultsMap}
        nodesDetailsMap={nodesDetailsMap}
        showToast={showToast}
        connectConfigs={connectConfigs}
        onFetchConnectInstances={finalFetchConnectConfigs}
        onFetchConnectDetail={finalFetchTables}
      />
    </NodeManagementContainer>
  );
};

export default NodeManagement;