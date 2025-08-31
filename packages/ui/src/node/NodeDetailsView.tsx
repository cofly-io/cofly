"use client";

import React from 'react';
import styled from 'styled-components';
import { NodeSettings } from './NodeSettings';
import { LinkageCallbacks } from '../utils/UnifiedParameterInput';
import { ToastType } from '@repo/common';


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
`;

interface NodeDetailsViewProps {
  node: any;
  parameters: any[];
  savedValues?: Record<string, any>;
  onClose: () => void;
  onSave: (nodeData: any) => void;
  onNodeIdChange?: (oldId: string, newId: string) => void;
  nodeWidth?: number;
  onTest?: (nodeValues: Record<string, any>) => void;
  onTestPreviousNode?: (nodeValues: Record<string, any>, targetNodeId: string) => void;
  onSaveMockData?: (mockTestResult: any) => void;
  testOutput?: string;
  lastTestResult?: any;
  testHistory?: any[];
  previousNodeIds?: string[];
  onPreviousNodeChange?: (nodeId: string) => void;
  selectedPreviousNodeId?: string;
  nodesTestResultsMap?: Record<string, any>;
  getLatestNodesTestResultsMap?: () => Record<string, any>;
  nodesDetailsMap?: Record<string, any>;
  showToast?: (type: ToastType, title: string, message: string) => void;
  connectConfigs?: Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>; // 添加连接配置数据源
  onFetchConnectInstances?: (connectType?: string) => Promise<Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>>; // 动态获取连接配置的回调
  onFetchConnectDetail?: (datasourceId: string) => Promise<{
    loading: boolean;
    error: string | null;
    tableOptions: Array<{ label: string; value: string; }>;
  }>; // 动态获取表名的回调
  linkageCallbacks?: LinkageCallbacks; // 联动回调函数映射
  isNodeTesting?: boolean; // 节点是否正在测试
  nodeTestEventId?: string; // 节点测试事件ID
  onStopTest?: (nodeId: string) => Promise<any>; // 停止测试的回调
  onAIhelpClick?: (prompt: string, content: string, fieldName: string) => Promise<string>; // AI助手点击回调
}

export const NodeDetailsView: React.FC<NodeDetailsViewProps> = ({
  node,
  parameters,
  savedValues = {},
  onClose,
  onSave,
  onNodeIdChange,
  nodeWidth,
  onTest,
  onTestPreviousNode,
  onSaveMockData,
  testOutput,
  lastTestResult,
  testHistory,
  previousNodeIds,
  onPreviousNodeChange,
  selectedPreviousNodeId,
  nodesTestResultsMap,
  getLatestNodesTestResultsMap,
  nodesDetailsMap,
  showToast,
  connectConfigs,
  onFetchConnectInstances,
  onFetchConnectDetail,
  linkageCallbacks,
  isNodeTesting,
  nodeTestEventId,
  onStopTest,
  onAIhelpClick,
}) => {
  console.log('🟠 [NodeDetailsView] 组件渲染:', {
    nodeId: node?.id,
    onAIhelpClick: typeof onAIhelpClick,
    onAIhelpClickExists: !!onAIhelpClick
  });
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick} className="node-details-view">
      <NodeSettings
        node={node}
        parameters={parameters}
        savedValues={savedValues}
        onClose={onClose}
        onSave={onSave}
        onNodeIdChange={onNodeIdChange}
        nodeWidth={nodeWidth}
        onTest={onTest}
        onTestPreviousNode={onTestPreviousNode}
        onSaveMockData={onSaveMockData}
        testOutput={testOutput}
        lastTestResult={lastTestResult}
        previousNodeIds={previousNodeIds}
        onPreviousNodeChange={onPreviousNodeChange}
        selectedPreviousNodeId={selectedPreviousNodeId}
        nodesTestResultsMap={nodesTestResultsMap}
        getLatestNodesTestResultsMap={getLatestNodesTestResultsMap}
        nodesDetailsMap={nodesDetailsMap}
        showToast={showToast}
        connectConfigs={connectConfigs}
        onFetchConnectInstances={onFetchConnectInstances}
        onFetchConnectDetail={onFetchConnectDetail}
        linkageCallbacks={linkageCallbacks}
        isNodeTesting={isNodeTesting}
        nodeTestEventId={nodeTestEventId}
        onStopTest={onStopTest}
        nodeId={node.id}
        onAIhelpClick={onAIhelpClick}
      />
    </ModalOverlay>
  );
};