/**
 * 工作流相关类型定义
 */

export interface WorkflowMetadata {
  workflowName: string;
  workflowId: string;
  exportedAt: string;
  version: string;
}

export interface WorkflowNode {
  id: string;
  kind: string;
  type: string;
  position: { x: number; y: number };
  inputs: Record<string, any>;
  data: NodeData;
}

export interface NodeData {
  kind: string;
  name: string;
  description: string;
  icon?: string;
  catalog?: string; // 使用 catalog 替代 category
  category?: string; // 保留用于向后兼容
  version?: string;
  link?: NodeLink | null;
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

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  subflow?: 'loop' | 'composite' | 'subflow';
}

export interface WorkflowData {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface SaveWorkflowRequest {
  workflowId: string;
  workflowName: string;
  nodesToSave: SaveWorkflowNode[];
  edgesToSave: SaveWorkflowEdge[];
  createUser: string;
}

export interface SaveWorkflowNode {
  id: string;
  kind: string;
  type: string;
  position: { x: number; y: number };
  inputs: Record<string, any>;
  link: NodeLink | null;
  lastTestResult: any;
  // 图标和显示信息
  icon?: string | null;
  catalog?: string | null; // 使用 catalog 替代 category
  name?: string;
  description?: string;
  version?: string;
}

export interface SaveWorkflowEdge {
  to: string;
  from: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  subflow?: 'loop' | 'subflow';
}

export interface WorkflowTestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ExportWorkflowResult {
  success: boolean;
  data?: WorkflowData;
  error?: string;
}