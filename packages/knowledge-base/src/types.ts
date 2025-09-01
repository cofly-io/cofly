import {
    AppError,
    DocumentChunk,
    DocumentMetadata,
    DocumentProcessingStatus,
    DocumentStatus,
    KnowledgeBaseMetadata,
    ModelSeries,
    SupportedFileType,
    VectorData
} from "@repo/common";
import { DocumentsResult, GetDocumentsOptions } from "@repo/database";

/**
 * 向量存储接口
 */
export interface VectorService {
    connect(): Promise<void>;
    checkHealth(): Promise<boolean>
    disconnect(): Promise<void>
    reconnect(): Promise<void>
    createCollection(collectionName: string, dimension: number): Promise<void>
    createIndex(collectionName: string): Promise<void>
    loadCollection(collectionName: string): Promise<void>
    insertVectors(collectionName: string, vectors: VectorData[]): Promise<String[] | Number[] | []>
    searchSimilar(collectionName: string, queryVector: number[], topK: number, filter?: string): Promise<DocumentSearchResult[]>
    deleteVector(collectionName: string, id: string): Promise<void>
    deleteDocumentVectors(collectionName: string, documentId: string): Promise<void>
    getCollectionStats(collectionName: string): Promise<{ entityCount: number }>
    dropCollection(collectionName: string): Promise<void>
}

export interface VectorRecord {
    documentId: string;
    chunkIndex: number;
    fileName: string;
    fileType: string;
    uploadTime: number;
    contentPreview: string;
}

/**
 * 向量化服务接口
 */
export interface EmbeddingService {
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
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
}

export type ConnectKind = 'internal' | 'connect'

// 向量库连接信息
export interface ProcessorConfig {
    kind: ConnectKind;
    series?: ModelSeries;
    baseUrl?: string;
    apiKey?: string;
    model: string;
    storageDir: string;
    maxRetries: number;
    retryDelay: number;
}

// 嵌入模型连接信息
export interface EmbeddingConfig {
    kind: ConnectKind;
    series?: ModelSeries;
    baseUrl?: string;
    apiKey?: string;
    model: string;
    chunkSize: number;
    chunkOverlap: number;
    dimension: number;
    maxRetries: number;
    batchSize: number;
    timeout: number;
}

// 向量库连接信息
export interface VectorConfig {
    kind: ConnectKind;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database: string;
    collectionName: string;
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
    defaultTopK: number,
    maxTopK: number,
    topK: number,
    defaultThreshold: number,
    threshold: number,
    cacheEnabled: boolean,
    cacheTTL: number, // 5 minutes
    highlightEnabled: boolean,
}

// 重排序模型连接信息
export interface RerankerConfig {
    kind: ConnectKind;
    series?: ModelSeries;
    baseUrl?: string;
    apiKey?: string;
    model: string;
}

export interface KnowledgeBase {
    metadata: KnowledgeBaseMetadata,
    processor: ProcessorConfig,
    embedding: EmbeddingConfig;
    vector: VectorConfig;
    reranker: RerankerConfig;
}

export interface IKnowledgeBaseInstance {
    getDocuments(options: GetDocumentsOptions): Promise<DocumentsResult>;

    getDocumentById(docId: string): Promise<DocumentMetadata | null>;

    processFile(file: File): Promise<ProcessingResult>;

    getProcessingStatus(docId: string): Promise<DocumentProcessingStatus | null>;

    searchDocuments(searchQuery: DocumentSearchQuery): Promise<DocumentSearchResponse>;

    deleteDocument(docId: string): Promise<boolean>
}