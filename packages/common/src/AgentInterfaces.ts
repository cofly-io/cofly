// Agent相关接口定义

// 智能体数据接口 - 统一的智能体数据结构
export interface AgentData {
  id?: string;
  name: string;
  description: string;
  prompt?: string | null;
  avatar?: string | { name: string; color: string } | null;
  modelId?: string; // 选择的具体模型ID
  modelName?: string | null; // 选择的模型名称，用于显示
  connectid?: string;
  connectIds?: string[]; // 关联的连接配置 ID 列表
  mcpIds?: string[];
  workflowIds?: string[];
  // 关联的MCP工具
  mcpTools?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  // 关联的工作流
  workflows?: Array<{
    id: string;
    name: string;
    type?: string;
  }>;
  // 关联的连接配置信息
  connectConfig?: {
    id: string;
    name: string;
    ctype: string;
    mtype?: string | null;
    configinfo?: string;
    createdtime?: Date;
    updatedtime?: Date;
    creator?: string | null;
  };
  createUser?: string;
  createdAt?: Date;
  updatedAt?: Date;
  agentInfo?: string; // 智能体配置信息，JSON字符串格式
}

// 智能体配置接口，基于数据库结构（向后兼容）
export interface AgentConfig extends AgentData {
  id: string;
  connectid: string;
  createdAt: Date;
  updatedAt: Date;
  createUser: string;
}

// 保存智能体的请求数据
export interface SaveAgentRequest {
  name: string;
  description: string;
  prompt?: string;
  avatar?: string;
  modelId: string; // 选择的具体模型ID，必填
  modelName?: string; // 选择的模型名称，用于显示
  connectId: string; // 连接配置ID
  mcpIds?: string[];
  createUser?: string;
}

// 智能体响应数据
export interface AgentResponse {
  success: boolean;
  data?: AgentData;
  error?: string;
  message?: string;
}

// 智能体列表响应数据
export interface AgentListResponse {
  success: boolean;
  data: AgentData[];
  total: number;
  error?: string;
}

// 模型信息接口
export interface ModelInfo {
  id: string;
  name: string;
  group?: string;
  provider?: string;
  description?: string;
  maxTokens?: number;
  supportedFeatures?: string[];
  tags?: string[];
}

export interface McpConfig {
    id: string;
    name: string;
    type: string;
    description: string;
    mcpinfo: string;
    createdAt: number;
    updatedAt: number;
    isActive: boolean;
    timeout?: number;
}