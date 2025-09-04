// 导入 AiRagConfig 类型
import { AiRagConfig } from '@repo/common';

/**
 * 创建 AI RAG 知识库的请求数据
 */
export interface CreateAiRagRequest {
  name: string;
  description?: string;
  vectorConnectId: string;
  embeddingConnectId: string;
  embeddingModelId: string;
  embeddingDimension: number;
  documentCount?: number;
  rerankerConnectId?: string;
  rerankerModelId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  matchingThreshold?: number;
}

/**
 * 更新 AI RAG 知识库的请求数据
 */
export interface UpdateAiRagRequest {
  name?: string;
  collectionName?: string;
  description?: string;
  vectorConnectId?: string;
  embeddingConnectId?: string;
  embeddingModelId?: string;
  embeddingDimension?: number;
  documentCount?: number;
  rerankerConnectId?: string;
  rerankerModelId?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  matchingThreshold?: number;
}

/**
 * AI RAG 知识库响应数据
 */
export interface AiRagResponse {
  success: boolean;
  data?: AiRagConfig;
  error?: string;
  message?: string;
}

/**
 * AI RAG 知识库列表响应数据
 */
export interface AiRagListResponse {
  success: boolean;
  data: AiRagConfig[];
  total: number;
  error?: string;
}

/**
 * 文件上传响应数据
 */
export interface FileUploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    status: string;
    message?: string;
  };
  error?: {
    type: string;
    message: string;
    timestamp: Date;
  };
  message?: string;
}

/**
 * 文件上传进度回调函数类型
 */
export type UploadProgressCallback = (progress: {
  fileId: string;
  fileName: string;
  progress: number;
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
  uploadedBytes?: number;
  totalBytes?: number;
}) => void;

/**
 * 文档列表查询参数
 */
export interface DocumentsQueryParams {
  page: number;
  limit: number;
  status?: string;
  fileType?: string;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * 文档列表响应数据
 */
export interface DocumentsResponse {
  success: boolean;
  data?: {
    documents: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  error?: string;
}

/**
 * 文档操作响应数据
 */
export interface DocumentOperationResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * 文档下载响应数据
 */
export interface DocumentDownloadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * AI RAG 知识库服务类 - 通过HTTP API调用
 */
export class AiRagService {
  
  /**
   * 创建 AI RAG 知识库
   */
  static async createAiRag(request: CreateAiRagRequest): Promise<AiRagResponse> {
    console.log('🔧 AiRagService.createAiRag 开始执行');
    console.log('📥 接收到的请求数据:', request);
    
    try {
      const response = await fetch('/api/ai-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '创建 AI RAG 知识库失败'
        };
      }

      return result;

    } catch (error) {
      console.error('❌ 创建 AI RAG 知识库失败:', error);
      return {
        success: false,
        error: '创建 AI RAG 知识库失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取 AI RAG 知识库列表
   */
  static async getAiRags(filter?: {
    vectorConnectId?: string;
    embeddingConnectId?: string;
    rerankerConnectId?: string;
    name?: string;
  }): Promise<AiRagListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filter?.vectorConnectId) {
        searchParams.append('vectorConnectId', filter.vectorConnectId);
      }
      if (filter?.embeddingConnectId) {
        searchParams.append('embeddingConnectId', filter.embeddingConnectId);
      }
      if (filter?.rerankerConnectId) {
        searchParams.append('rerankerConnectId', filter.rerankerConnectId);
      }
      if (filter?.name) {
        searchParams.append('name', filter.name);
      }

      const url = `/api/ai-rag${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const response = await fetch(url);

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          data: [],
          total: 0,
          error: result.error || '获取 AI RAG 知识库列表失败'
        };
      }

      return result;

    } catch (error) {
      console.error('获取 AI RAG 知识库列表失败:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取单个 AI RAG 知识库
   */
  static async getAiRag(id: string): Promise<AiRagResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${id}`);
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '获取 AI RAG 知识库失败'
        };
      }

      return result;

    } catch (error) {
      console.error('获取 AI RAG 知识库失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 更新 AI RAG 知识库
   */
  static async updateAiRag(id: string, request: UpdateAiRagRequest): Promise<AiRagResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '更新 AI RAG 知识库失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('更新 AI RAG 知识库失败:', error);
      return {
        success: false,
        error: '更新 AI RAG 知识库失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 删除 AI RAG 知识库
   */
  static async deleteAiRag(id: string): Promise<AiRagResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '删除 AI RAG 知识库失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('删除 AI RAG 知识库失败:', error);
      return {
        success: false,
        error: '删除 AI RAG 知识库失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 批量删除 AI RAG 知识库
   */
  static async batchDeleteAiRags(ids: string[]): Promise<AiRagResponse> {
    try {
      const deletePromises = ids.map(id => this.deleteAiRag(id));
      const results = await Promise.all(deletePromises);
      
      const failedResults = results.filter(result => !result.success);
      
      if (failedResults.length > 0) {
        return {
          success: false,
          error: `批量删除失败，${failedResults.length} 个知识库删除失败`,
          message: failedResults.map(r => r.error).join('; ')
        };
      }

      return {
        success: true,
        message: `成功删除 ${ids.length} 个 AI RAG 知识库`
      };

    } catch (error) {
      console.error('批量删除 AI RAG 知识库失败:', error);
      return {
        success: false,
        error: '批量删除 AI RAG 知识库失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 上传文件到知识库
   */
  static async uploadFileToKnowledgeBase(
    knowledgeBaseId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<FileUploadResponse> {
    console.log('🔧 [AiRagService] 开始上传文件:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      knowledgeBaseId: knowledgeBaseId
    });

    // 验证参数
    if (!knowledgeBaseId) {
      return {
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '缺少知识库ID，无法上传文件',
          timestamp: new Date()
        }
      };
    }

    if (!file) {
      return {
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '未选择文件',
          timestamp: new Date()
        }
      };
    }

    return new Promise<FileUploadResponse>((resolve) => {
      try {
        const fileId = 'upload-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileId', fileId);
        formData.append('fileName', file.name);

        // 使用XMLHttpRequest来支持上传进度
        const xhr = new XMLHttpRequest();

        // 监听上传进度
        let startTime = Date.now();
        let lastLoaded = 0;
        let lastTime = startTime;
        let lastUpdateTime = startTime;
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const currentTime = Date.now();
            const progress = Math.round((event.loaded / event.total) * 100);
            
            // 限制更新频率，避免过于频繁的状态更新
            const shouldUpdate = currentTime - lastUpdateTime > 100; // 最多每100ms更新一次
            
            // 计算上传速度和剩余时间
            const timeDiff = currentTime - lastTime;
            const loadedDiff = event.loaded - lastLoaded;
            
            let uploadSpeed = 0;
            let estimatedTimeRemaining = 0;
            
            // 只有在有足够的时间差时才计算速度，避免不准确的计算
            if (timeDiff > 500 && loadedDiff > 0) {
              uploadSpeed = loadedDiff / (timeDiff / 1000); // bytes per second
              const remainingBytes = event.total - event.loaded;
              if (uploadSpeed > 0) {
                estimatedTimeRemaining = remainingBytes / uploadSpeed; // seconds
              }
              lastLoaded = event.loaded;
              lastTime = currentTime;
            }
            
            if (shouldUpdate || progress === 100) {
              onProgress({
                fileId,
                fileName: file.name,
                progress,
                uploadSpeed: uploadSpeed > 0 ? uploadSpeed : undefined,
                estimatedTimeRemaining: estimatedTimeRemaining > 0 ? estimatedTimeRemaining : undefined,
                uploadedBytes: event.loaded,
                totalBytes: event.total
              });
              lastUpdateTime = currentTime;
            }
          }
        });

        // 监听请求完成
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const result = JSON.parse(xhr.responseText);
              if (result.success) {
                console.log('🔧 [AiRagService] 文件上传成功:', result.data);
                resolve(result);
              } else {
                console.error('🔧 [AiRagService] 文件上传失败:', result.error);
                resolve({
                  success: false,
                  error: result.error || {
                    type: 'UPLOAD_ERROR',
                    message: '文件上传失败',
                    timestamp: new Date()
                  }
                });
              }
            } else {
              // 尝试解析错误响应
              let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`;
              try {
                const errorResult = JSON.parse(xhr.responseText);
                if (errorResult.error?.message) {
                  errorMessage = errorResult.error.message;
                } else if (errorResult.message) {
                  errorMessage = errorResult.message;
                }
              } catch (parseError) {
                console.error('🔧 [AiRagService] Failed to parse error response:', parseError);
              }
              
              // 记录详细的错误信息用于调试
              console.error('🔧 [AiRagService] Upload failed with status:', xhr.status);
              console.error('🔧 [AiRagService] Response text:', xhr.responseText);
              console.error('🔧 [AiRagService] Request URL:', `/api/ai-rag/${knowledgeBaseId}/upload`);
              
              // 如果是 500 错误，提供更友好的提示
              if (xhr.status === 500) {
                errorMessage = '服务器内部错误，请检查知识库配置或联系管理员';
              }
              
              resolve({
                success: false,
                error: {
                  type: 'HTTP_ERROR',
                  message: errorMessage,
                  timestamp: new Date()
                }
              });
            }
          } catch (error) {
            console.error('🔧 [AiRagService] Error processing response:', error);
            resolve({
              success: false,
              error: {
                type: 'PROCESSING_ERROR',
                message: error instanceof Error ? error.message : '响应处理失败',
                timestamp: new Date()
              }
            });
          }
        });

        // 监听请求错误
        xhr.addEventListener('error', () => {
          console.error('🔧 [AiRagService] Network error during upload');
          resolve({
            success: false,
            error: {
              type: 'NETWORK_ERROR',
              message: '网络错误，上传失败',
              timestamp: new Date()
            }
          });
        });

        // 监听请求中止
        xhr.addEventListener('abort', () => {
          console.log('🔧 [AiRagService] Upload aborted');
          resolve({
            success: false,
            error: {
              type: 'ABORTED',
              message: '上传已取消',
              timestamp: new Date()
            }
          });
        });

        // 监听超时
        xhr.addEventListener('timeout', () => {
          console.error('🔧 [AiRagService] Upload timeout');
          resolve({
            success: false,
            error: {
              type: 'TIMEOUT',
              message: '上传超时，请检查网络连接',
              timestamp: new Date()
            }
          });
        });

        // 设置超时时间（5分钟）
        xhr.timeout = 5 * 60 * 1000;

        // 发送请求
        const uploadUrl = `/api/ai-rag/${knowledgeBaseId}/upload`;
        console.log('🔧 [AiRagService] 发送请求到:', uploadUrl);
        
        xhr.open('POST', uploadUrl);
        xhr.send(formData);

      } catch (error) {
        console.error('🔧 [AiRagService] Upload setup error:', error);
        resolve({
          success: false,
          error: {
            type: 'SETUP_ERROR',
            message: error instanceof Error ? error.message : '上传初始化失败',
            timestamp: new Date()
          }
        });
      }
    });
  }

  /**
   * 加载文档列表
   */
  static async loadDocuments(
    knowledgeBaseId: string,
    params: DocumentsQueryParams
  ): Promise<DocumentsResponse> {
    try {
      // 构建查询参数
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        sortBy: params.sortBy,
        sortOrder: params.sortOrder
      });

      if (params.status) searchParams.append('status', params.status);
      if (params.fileType) searchParams.append('fileType', params.fileType);
      if (params.search) searchParams.append('search', params.search);

      const response = await fetch(`/api/ai-rag/${knowledgeBaseId}/documents?${searchParams}`);

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorResult.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Load documents error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '加载文档列表失败'
      };
    }
  }

  /**
   * 删除文档
   */
  static async deleteDocument(
    knowledgeBaseId: string,
    documentId: string
  ): Promise<DocumentOperationResponse> {
    try {
      console.log('🔧 [AiRagService] 开始删除文档:', { knowledgeBaseId, documentId });
      
      const response = await fetch(`/api/ai-rag/${knowledgeBaseId}/documents/${documentId}`, {
        method: 'DELETE'
      });

      console.log('🔧 [AiRagService] API响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        console.error('🔧 [AiRagService] API响应错误:', errorResult);
        return {
          success: false,
          error: errorResult.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('🔧 [AiRagService] API响应成功:', result);
      return result;

    } catch (error) {
      console.error('🔧 [AiRagService] Delete document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文档失败'
      };
    }
  }

  /**
   * 删除文档片段
   */
  static async deleteDocumentChunk(
    knowledgeBaseId: string,
    documentId: string,
    chunkId: string
  ): Promise<DocumentOperationResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${knowledgeBaseId}/documents/${documentId}/chunks/${chunkId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorResult.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Delete document chunk error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文档片段失败'
      };
    }
  }

  /**
   * 重新处理文档
   */
  static async reprocessDocument(
    knowledgeBaseId: string,
    documentId: string
  ): Promise<DocumentOperationResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${knowledgeBaseId}/documents/${documentId}/reprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorResult.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Reprocess document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新处理文档失败'
      };
    }
  }

  /**
   * 下载文档
   */
  static async downloadDocument(
    knowledgeBaseId: string,
    documentId: string
  ): Promise<DocumentDownloadResponse> {
    try {
      const response = await fetch(`/api/ai-rag/${knowledgeBaseId}/documents/${documentId}/download`);

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorResult.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      // 如果响应是文件流，创建下载URL
      if (response.headers.get('content-type')?.includes('application/') || 
          response.headers.get('content-disposition')?.includes('attachment')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return {
          success: true,
          url
        };
      }

      // 如果响应是JSON，可能包含下载URL
      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Download document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '下载文档失败'
      };
    }
  }
}