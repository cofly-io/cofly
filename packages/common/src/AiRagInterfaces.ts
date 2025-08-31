// AI RAG 知识库相关接口定义

// AI RAG 知识库数据接口 - 统一的知识库数据结构
export interface AiRagData {
  id?: string;
  name: string;
  collectionName: string;
  vectorConnectId: string;
  embeddingConnectId: string;
  embeddingModelId: string;
  embeddingDimensions?: number | null;
  documentCount?: number | null;
  rerankerConnectId: string;
  rerankerModelId: string;
  chunkSize?: number | null;
  chunkOverlap?: number | null;
  matchingThreshold?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  // 关联的连接配置信息
  vectorConnectConfig?: {
    id: string;
    name: string;
    ctype: string;
  };
  embeddingConnectConfig?: {
    id: string;
    name: string;
    ctype: string;
  };
  rerankConnectConfig?: {
    id: string;
    name: string;
    ctype: string;
  };
}

// AI RAG 知识库配置接口，基于数据库结构（向后兼容）
export interface AiRagConfig extends AiRagData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建 AI RAG 知识库的请求数据
export interface CreateAiRagRequest {
  name: string;
  description?: string;
  vectorConnectId: string;
  embeddingConnectId: string;
  embeddingModelId: string;
  embeddingDimensions: number;
  documentCount?: number;
  rerankerConnectId?: string;
  rerankerModelId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  matchingThreshold?: number;
}

// 更新 AI RAG 知识库的请求数据
export interface UpdateAiRagRequest {
  name?: string;
  collectionName?: string;
  description?: string;
  vectorConnectId?: string;
  embeddingConnectId?: string;
  embeddingModelId?: string;
  embeddingDimensions?: number;
  documentCount?: number;
  rerankerConnectId?: string;
  rerankerModelId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  matchingThreshold?: number;
}

// AI RAG 知识库响应数据
export interface AiRagResponse {
  success: boolean;
  data?: AiRagData;
  error?: string;
  message?: string;
}

// AI RAG 知识库列表响应数据
export interface AiRagListResponse {
  success: boolean;
  data: AiRagData[];
  total: number;
  error?: string;
}

// AI RAG 列表选项
export interface AiRagListOptions {
  limit?: number;
  vectorConnectId?: string;
  embeddingConnectId?: string;
  rerankerConnectId?: string;
  name?: string;
}

// AI RAG 加载器接口
export interface IAiRagLoader {
  get(id: string): Promise<AiRagData | undefined>;
  list(opts?: AiRagListOptions): Promise<AiRagData[]>;
  create(request: CreateAiRagRequest): Promise<AiRagData>;
  update(id: string, request: UpdateAiRagRequest): Promise<AiRagData>;
  delete(id: string): Promise<boolean>;
}

// AI RAG 相关定义
export const AiRagDef = {
  identifier: "IAiRagLoader"
}