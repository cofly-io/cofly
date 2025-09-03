import {
    DocumentSearchResult,
    KnowledgeBaseMetadata,
    ModelSeries,
    VectorData
} from "@repo/common";

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