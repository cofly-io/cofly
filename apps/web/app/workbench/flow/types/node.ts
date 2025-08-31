/**
 * 节点相关类型定义
 */

export interface NodeTestResult {
  success: boolean;
  data?: any;
  // error?: string;
  // timestamp: number;
  // nodeId: string;
}

export interface NodeDetails {
  nodeInfo: any; // ReactFlow Node类型
  savedValues: Record<string, any>;
  originalNodeKind: string;
  lastTestResult?: NodeTestResult;
  parameters?: NodeParameter[] | null; // 节点参数定义
  createdAt?: number; // 创建时间戳
  lastSaved?: string; // 最后保存时间戳
  agentResources?: Record<string, any>; // AI节点的代理资源
}

export interface NodeTestHistory {
  nodeId: string;
  results: NodeTestResult[];
  maxHistory?: number;
}

export interface NodeCategory {
  name: string;
  description?: string;
  nodes: NodeInfo[];
}

export interface NodeInfo {
  kind: string;
  name: string;
  description: string;
  icon?: string;
  catalog?: string; // 使用 catalog 替代 category
  category?: string; // 保留用于向后兼容
  version: string;
  link?: NodeLink;
  nodeWidth?: number;
}

export interface NodeLink {
  inputs?: NodeLinkPort[];
  outputs?: NodeLinkPort[];
}

export interface NodeLinkPort {
  desc: string;
  subflow?: boolean;
}

export interface NodeParameter {
  name: string;
  displayName: string;
  type: string;
  controlType?: string;
  default?: any;
  options?: NodeParameterOption[];
  description?: string;
  placeholder?: string;
  connectType?: string;
  displayOptions?: {
    show?: Record<string, string[]>;
    hide?: Record<string, string[]>;
  };
}

export interface NodeParameterOption {
  name: string;
  value: any;
  description?: string;
}

export interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
  mtype: string;
  nodeinfo: Record<string, any>;
  description?: string;
}

export interface FetchTablesResponse {
  loading: boolean;
  error: string | null;
  tableOptions: Array<{ label: string; value: string }>;
}

export interface NodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NodeExecutionContext {
  nodeId: string;
  inputs: Record<string, any>;
  previousNodes: string[];
  testResultsMap: Record<string, NodeTestResult>;
}