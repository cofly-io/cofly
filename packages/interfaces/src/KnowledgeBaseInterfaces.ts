import { AppError, ErrorType } from "./SystemInterfaces";

export const KnowledgeBaseDef = {
    identifier: "IKnowledgeBaseLoader"
}

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

export interface GetDocumentsOptions {
    limit?: number;
    offset?: number;
    status?: DocumentStatus;
    fileType?: SupportedFileType;
    sortBy?: DocumentSortDirection;
    sortOrder?: 'asc' | 'desc';
}

export interface DocumentsResult {
    documents: DocumentMetadata[];
    total: number;
}

/**
 * 处理步骤枚举
 */
export enum ProcessingStep {
    VALIDATION = 'validation',
    TEXT_EXTRACTION = 'text_extraction',
    TEXT_CHUNKING = 'text_chunking',
    VECTORIZATION = 'vectorization',
    VECTOR_STORAGE = 'vector_stokbe',
    METADATA_UPDATE = 'metadata_update',
    COMPLETION = 'completion'
}

/**
 * 处理结果接口
 */
export interface ProcessingResult {
    success: boolean;
    documentId: string;
    status: DocumentStatus;
    chunkCount: number;
    processingTime: number;
    error?: AppError;
}

export type ProcessedDocumentMetadata = Omit<DocumentMetadata, 'kbId'>

// 搜索结果接口
export interface DocumentSearchResult {
    id: string;
    score: number;
    metadata: ProcessedDocumentMetadata;
    chunkIndex?: number;
    chunk?: DocumentChunk;
    highlightedContent?: string;
}

// 搜索查询接口
export interface DocumentSearchQuery {
    query: string;
    topK?: number;
    threshold?: number;
    filters?: DocumentSearchFilters;
}

// 搜索过滤器
export interface DocumentSearchFilters {
    fileTypes?: SupportedFileType[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    fileSizeRange?: {
        min: number;
        max: number;
    };
}

// 搜索响应接口
export interface DocumentSearchResponse {
    results: DocumentSearchResult[];
    totalCount: number;
    queryTime: number;
    query: string;
    filters?: DocumentSearchFilters;
    error?: AppError;
}

export interface IKnowledgeBaseLoader {
    list() : Promise<KnowledgeBaseMetadata[]>
    get(kbId: string) : Promise<IKnowledgeBaseInstance>
}

export interface IKnowledgeBaseInstance {
    getDocuments(options: GetDocumentsOptions): Promise<DocumentsResult>;

    getDocumentById(docId: string): Promise<DocumentMetadata | null>;

    processFile(file: File): Promise<ProcessingResult>;

    getProcessingStatus(docId: string): Promise<DocumentProcessingStatus | null>;

    searchDocuments(searchQuery: DocumentSearchQuery): Promise<DocumentSearchResponse>;

    deleteDocument(docId: string): Promise<boolean>

    deleteDocumentChunk(chunkId: string): Promise<boolean>
}