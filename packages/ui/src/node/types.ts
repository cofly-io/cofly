// Type definitions for Node components

import { Node } from 'reactflow';
import { TestResult, NodeTestResults, INodeFields } from '@repo/common';
import { LinkageCallbacks } from '../utils/UnifiedParameterInput';
import { ToastType as NodeToastType } from '@repo/common';

// Re-export for backward compatibility
export type { TestResult, NodeTestResults, INodeFields };

// Toast notification McpInterfaces.ts
export type ShowToastFn = (type: NodeToastType, title: string, message: string) => void;

// Core interfaces
export interface NodeSettingsProps {
  node: Node;
  parameters: INodeFields[];
  savedValues?: Record<string, any>;
  onClose: () => void;
  onSave: (nodeData: Node) => void;
  onNodeIdChange?: (oldId: string, newId: string) => void;
  previousNodeOutput?: string;
  onTest?: (nodeValues: Record<string, any>) => void;
  onStopTest?: (nodeInstanceId: string) => Promise<any>;
  onTestPreviousNode?: (nodeValues: Record<string, any>, targetNodeId: string) => void;
  onSaveMockData?: (mockTestResult: any) => void;
  isNodeTesting?: boolean;
  nodeTestEventId?: string;
  testOutput?: string;
  nodeWidth?: number;
  lastTestResult?: TestResult;
  testHistory?: TestResult[];
  previousNodeIds?: string[];
  onPreviousNodeChange?: (nodeId: string) => void;
  selectedPreviousNodeId?: string;
  nodesTestResultsMap?: Record<string, any>;
  getLatestNodesTestResultsMap?: () => Record<string, any>;
  nodesDetailsMap?: Record<string, any>;
  showToast?: ShowToastFn;
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
  nodeId?: string; // 节点ID，用于状态隔离
  onAIhelpClick?: (prompt: string, content: string, fieldName: string) => Promise<string>; // AI助手点击回调
}

export interface LeftPanelProps {
  width: number;
  previousNodeOutput?: string;
  previousNodeIds?: string[];
  onPreviousNodeChange?: (nodeId: string) => void;
  selectedPreviousNodeId?: string;
  onTest?: (nodeValues: Record<string, any>, nodeId: string) => void;
  nodesTestResultsMap?: Record<string, any>;
  getLatestNodesTestResultsMap?: () => Record<string, any>;
  onDisplayTestResult?: (testResult: TestResult | null) => void;
  nodesDetailsMap?: Record<string, any>;
  showToast?: ShowToastFn;
  showSettings?: boolean;
  overlayLeftOffset?: number;
  nodeWidth?: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export interface RightPanelProps {
  width: number;
  onTest?: (nodeValues: Record<string, any>) => void;
  testOutput?: string;
  nodeWidth?: number;
  showSettings?: boolean;
  onMockDataChange?: (mockData: any) => void;
  onSaveMockData?: (mockData: any) => void;
  lastTestResult?: TestResult;
  testHistory?: TestResult[];
  overlayLeftOffset?: number;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export interface NodeDetailsViewProps extends NodeSettingsProps {
  // Extends NodeSettingsProps, no additional properties needed
}

// Hook return McpInterfaces.ts
export interface UseTestResultPollingReturn {
  localTestResult: TestResult | null;
  isExecuting: boolean;
  executeNode: (nodeId: string) => Promise<void>;
  setLocalTestResult: (result: TestResult | null) => void;
}

// Internal state McpInterfaces.ts
export interface NodeFormState {
  activeTab: 'parameters' | 'settings';
  nodeId: string;
  nodeIcon: string;
  showSettings: boolean;
  leftWidth: number;
  isDragging: boolean;
  overlayLeftOffset: number;
  isExpanded: boolean;
  displayedTestResult: TestResult | null;
  displayedTestHistory: TestResult[];
  isEditingTitle: boolean;
  tempNodeId: string;
}

// Utility McpInterfaces.ts
export type NodeValues = Record<string, any>;
export type NodesDetailsMap = Record<string, any>;
export type NodesTestResultsMap = Record<string, any>;

// Event handler McpInterfaces.ts
export type ValueChangeHandler = (name: string, value: any) => void;
export type NodeIdChangeHandler = (newId: string) => void;
export type MouseEventHandler = (e: React.MouseEvent) => void;
export type KeyboardEventHandler = (e: React.KeyboardEvent<HTMLInputElement>) => void;
export type ChangeEventHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;