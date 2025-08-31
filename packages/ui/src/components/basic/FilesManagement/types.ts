// 文件管理组件类型定义

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing', 
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum SupportedFileType {
  TXT = 'txt',
  DOC = 'doc',
  DOCX = 'docx',
  PDF = 'pdf',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  MD = 'md',
  JSON = 'json',
  CSV = 'csv'
}

export interface DocumentMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileType: SupportedFileType;
  fileSize: number;
  uploadTime: Date;
  processedTime?: Date;
  status: DocumentStatus;
  chunkCount: number;
  filePath: string;
  textPreview: string;
  mimeType: string;
  checksum?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: DocumentStatus;
  error?: string;
  uploadSpeed?: number; // bytes per second
  estimatedTimeRemaining?: number; // seconds
  uploadedBytes?: number;
  totalBytes?: number;
}

export interface FileUploadProps {
  onUploadSuccess?: (fileId: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: SupportedFileType[];
  maxFileSize?: number;
  multiple?: boolean;
  knowledgeBaseId?: string; // 知识库ID，用于API调用
  // 文件上传函数
  onFileUpload?: (
    knowledgeBaseId: string,
    file: File,
    onProgress?: (progress: {
      fileId: string;
      fileName: string;
      progress: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      uploadedBytes?: number;
      totalBytes?: number;
    }) => void
  ) => Promise<{
    success: boolean;
    fileId?: string;
    error?: string;
    message?: string;
  }>;
}

export interface FilesManagementProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  acceptedTypes?: SupportedFileType[];
  maxFileSize?: number;
  onFileSelect?: (files: DocumentMetadata[]) => void;
  knowledgeBaseId?: string; // 知识库ID，用于API调用
  // 文件上传函数
  onFileUpload?: (
    knowledgeBaseId: string,
    file: File,
    onProgress?: (progress: {
      fileId: string;
      fileName: string;
      progress: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      uploadedBytes?: number;
      totalBytes?: number;
    }) => void
  ) => Promise<{
    success: boolean;
    fileId?: string;
    error?: string;
    message?: string;
  }>;
  // 文档管理服务函数
  onLoadDocuments?: (
    knowledgeBaseId: string,
    params: {
      page: number;
      limit: number;
      status?: string;
      fileType?: string;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ) => Promise<{
    success: boolean;
    data?: FilesDocumentsResponse;
    error?: string;
  }>;
  onDeleteDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onReprocessDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDownloadDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
}

export interface BatchOperationResult {
  documentId: string;
  success: boolean;
  error?: string;
}

export interface FilesApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  message?: string;
}

export interface FilesPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FilesDocumentsResponse {
  documents: DocumentMetadata[];
  pagination: FilesPaginationInfo;
}