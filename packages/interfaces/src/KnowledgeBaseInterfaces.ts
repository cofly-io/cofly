import { AppError, ErrorType } from "./SystemInterfaces";

// 文档状态枚举
export enum DocumentStatus {
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

// 文档状态枚举
export enum DocumentSortDirection {
    UPLOADTIME = 'uploadTime',
    FILENAME = 'fileName',
    FILESIZE = 'fileSize'
}

// 支持的文件类型
export enum SupportedFileType {
    TXT = 'txt',
    DOC = 'doc',
    DOCX = 'docx',
    PDF = 'pdf',
    XLS = 'xls',
    XLSX = 'xlsx',
    PPT = 'ppt',
    PPTX = 'pptx'
}

// 知识库元数据接口
export interface KnowledgeBaseMetadata {
    id: string;
    name: string;
    processorModel: string;
    embeddingModel: string;
    vectorKind: string;
    rerankerModel: string;
}

// 文档元数据接口
export interface DocumentMetadata {
    id: string;
    kbId: string;
    fileName: string;
    originalName: string;
    fileType: SupportedFileType;
    fileSize: number;
    uploadTime: Date;
    processedTime?: Date;
    status: DocumentStatus;
    chunkCount: number;
    filePath: string;
    textPreview: string; // 前500字符预览
    mimeType?: string;
    checksum?: string; // 文件校验和
}

// 文档块接口
export interface DocumentChunk {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    contentLength: number;
    vectorId?: string; // Milvus 中的向量ID
    startPosition: number;
    endPosition: number;
}

// 向量数据接口
export interface VectorData {
    id: string;
    vector: number[];
    metadata: DocumentMetadata;
    chunkIndex?: number;
}

// 文件验证结果
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    errorType?: ErrorType;
}

// 处理状态接口
export interface DocumentProcessingStatus {
    documentId: string;
    status: DocumentStatus;
    progress: number;
    currentStep: string;
    error?: AppError;
    startTime: bigint;
    endTime?: bigint;
}

// 批量操作接口
export interface DocumentBatchOperation {
    operationType: 'delete' | 'reprocess' | 'export';
    documentIds: string[];
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    results?: DocumentBatchOperationResult[];
}

export interface DocumentBatchOperationResult {
    documentId: string;
    success: boolean;
    error?: string;
}

export interface KnowledgeBaseHealth {
    metadata: KnowledgeBaseMetadata;
    stats: Record<DocumentStatus, number>;
}