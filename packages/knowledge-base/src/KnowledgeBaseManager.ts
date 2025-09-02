import path from 'path';
import { AiKb, DocumentsResult, GetDocumentsOptions, prisma } from "@repo/database";
import {
    credentialManager,
    DocumentMetadata,
    DocumentProcessingStatus,
    KnowledgeBaseHealth,
    KnowledgeBaseMetadata,
    ModelSeries
} from "@repo/common"
import { DefaultConfig } from "./Constants";
import {
    DocumentSearchQuery,
    DocumentSearchResponse,
    EmbeddingConfig,
    EmbeddingService,
    IKnowledgeBaseInstance,
    KnowledgeBase,
    ProcessingResult,
    ProcessorConfig,
    RerankerConfig,
    VectorConfig,
    VectorService
} from "./types";
import { DocumentProcessingFlow } from "./DocumentProcessingFlow";
import { getEmbeddingService } from "./Embedding";
import { getVectorService } from "./Vector";
import { SearchFlow } from "./SearchFlow";
import * as process from "node:process";
import * as console from "node:console";

export class KnowledgeBaseInstance implements IKnowledgeBaseInstance {

    public processor: DocumentProcessingFlow;
    public embedding: EmbeddingService;
    public vector: VectorService;
    public search: SearchFlow;

    get id() : string {
        return this.config.metadata.id;
    }

    get name() : string {
        return this.config.metadata.id;
    }

    get storagePath() {
        return path.join(process.env.STORAGE_DIR_BASE || this.config.processor.storageDir, "knowledge-base", this.id)
    }

    constructor(public config: KnowledgeBase) {
        this.embedding = getEmbeddingService(this);
        this.vector = getVectorService(this);
        this.processor = new DocumentProcessingFlow(this)
        this.search = new SearchFlow(this);
    }

    async initialize() {

    }

    async health() : Promise<KnowledgeBaseHealth> {
        return {
            metadata: this.config.metadata,
            stats: await prisma.kbDocument.getDocumentStats(this.config.metadata.id)
        }
    }

    async getDocuments(options: GetDocumentsOptions = {}): Promise<DocumentsResult> {

        return prisma.kbDocument.getDocuments(this.config.metadata.id, options);
    }

    async getDocumentById(docId: string): Promise<DocumentMetadata | null> {

        return prisma.kbDocument.getDocumentById(docId, this.config.metadata.id);
    }

    async processFile(file: File): Promise<ProcessingResult> {
        return this.processor.processFile(file)
    }

    async getProcessingStatus(docId: string): Promise<DocumentProcessingStatus | null> {
        return this.processor.getProcessingStatus(docId);
    }

    async searchDocuments(searchQuery: DocumentSearchQuery): Promise<DocumentSearchResponse> {
        return this.search.search(searchQuery);
    }

    async deleteDocument(docId: string): Promise<boolean> {

        try {
            return prisma.$transaction(async (tx) => {

                await tx.kbDocumentChunk.deleteChunksByDocumentId(docId);
                await tx.kbProcessingStatus.deleteProcessingStatusesByDocumentId(docId);
                await tx.kbDocument.deleteDocument(docId);

                await this.vector.deleteDocumentVectors(this.config.vector.collectionName, docId);

                return true;
            })
        } catch(error) {
            console.error(error);
            return false;
        }
    }

    async deleteDocumentChunk(chunkId: string): Promise<boolean> {
        try {
            return prisma.$transaction(async (tx) => {

                const chunk = await tx.kbDocumentChunk.getChunkById(chunkId);
                if(!chunk) {
                    return false;
                }

                await tx.kbDocumentChunk.deleteChunk(chunkId);

                if(chunk.vectorId) {
                    await this.vector.deleteVector(this.config.vector.collectionName, chunk.vectorId);
                }

                return true;
            })
        } catch(error) {
            console.error(error);
            return false;
        }
    }
}

export class KnowledgeBaseManager {

    private kbs: Map<string, KnowledgeBaseInstance> = new Map();

    async list() : Promise<KnowledgeBaseMetadata[]> {
        return prisma.aiKb.findMany().then(kbs =>
            kbs.map(u => ({
                id: u.id,
                name: u.name,
                processorModel: u.processorModelId || DefaultConfig.PROCESSOR_MODEL,
                embeddingModel: u.embeddingModelId || DefaultConfig.EMBEDDING_MODEL,
                vectorKind: u.processorModelId ? 'connect' : 'internal',
                rerankerModel: u.rerankerModelId || DefaultConfig.RERANKER_MODEL,
            } as KnowledgeBaseMetadata)));
    }

    async get(kbId: string) : Promise<IKnowledgeBaseInstance> {

        if(this.kbs.has(kbId)) {
            const instance = this.kbs.get(kbId);
            if(instance) return instance;
        }

        const kb = await prisma.aiKb.findUnique({
            where: {
                id: kbId
            }
        });

        if(kb) {

            const instance = await this.build(kb);

            this.kbs.set(kbId, instance);

            return instance;
        }

        throw new Error(`Knowledge Base ${kbId} doesn't exist`);
    }

    async build(config: AiKb): Promise<KnowledgeBaseInstance> {

        const kb = {
            metadata: {
                id: config.id,
                name: config.name,
                processorModel: DefaultConfig.PROCESSOR_MODEL,
                embeddingModel: DefaultConfig.EMBEDDING_MODEL,
                vectorKind: DefaultConfig.VECTOR_KIND,
                rerankerModel: DefaultConfig.RERANKER_MODEL,
            } as KnowledgeBaseMetadata,
            processor: {
                kind: 'internal',
                model: DefaultConfig.PROCESSOR_MODEL,
                maxRetries: DefaultConfig.MAX_RETRIES,
                retryDelay: DefaultConfig.RETRY_DELAY,
                storageDir: process.env.STORAGE_DIR_BASE || DefaultConfig.STORAGE_DIR_BASE,
            } as ProcessorConfig,
            embedding: {
                kind: 'internal',
                model: DefaultConfig.EMBEDDING_MODEL,
                chunkSize: DefaultConfig.CHUNK_SIZE,
                chunkOverlap: DefaultConfig.CHUNK_OVERLAP,
                maxRetries: DefaultConfig.MAX_RETRIES,
                batchSize: DefaultConfig.BATCH_SIZE,
                timeout: DefaultConfig.TIMEOUT,
                dimension: config.embeddingDimension || DefaultConfig.EMBEDDING_DIMENSION,
            } as EmbeddingConfig,
            vector: {
                kind: 'internal',
                database: DefaultConfig.DATABASE_NAME,
                collectionName: DefaultConfig.COLLECTION_NAME,
                maxRetries: DefaultConfig.MAX_RETRIES,
                retryDelay: DefaultConfig.RETRY_DELAY,
                backoffMultiplier: DefaultConfig.BACKOFF_MULTIPLIER,
                defaultTopK: DefaultConfig.DEFAULT_TOPK,
                maxTopK: DefaultConfig.MAX_TOPK,
                defaultThreshold: DefaultConfig.DEFAULT_THRESHOLD,
                topK: DefaultConfig.DEFAULT_TOPK,
                threshold: DefaultConfig.DEFAULT_THRESHOLD,
                highlightEnabled: DefaultConfig.HIGHLIGHT_ENABLED
            } as VectorConfig,
            reranker: {
                kind: 'internal',
                model: DefaultConfig.RERANKER_MODEL,
            } as RerankerConfig
        } as KnowledgeBase;

        if(config.processorConnectId) {
            const connectConfig = await credentialManager.mediator?.get(config.processorConnectId);
            if(connectConfig) {
                kb.processor.kind = 'connect';
                kb.processor.series = connectConfig.config?.driver as ModelSeries || ModelSeries.Unknown;
                kb.processor.baseUrl = connectConfig.config?.baseUrl;
                kb.processor.apiKey = connectConfig.config?.apiKey;
                kb.processor.model = config.processorModelId || DefaultConfig.PROCESSOR_MODEL;
            }
        }

        if(config.embeddingConnectId) {
            const connectConfig = await credentialManager.mediator?.get(config.embeddingConnectId);
            if(connectConfig) {
                kb.embedding.kind = 'connect';
                kb.embedding.series = connectConfig.config?.driver as ModelSeries || ModelSeries.Unknown;
                kb.embedding.baseUrl = connectConfig.config?.baseUrl;
                kb.embedding.apiKey = connectConfig.config?.apiKey;
                kb.embedding.model = config.embeddingModelId || DefaultConfig.EMBEDDING_MODEL;
            }
        }

        if(config.vectorConnectId) {
            const connectConfig = await credentialManager.mediator?.get(config.vectorConnectId);
            if(connectConfig) {
                kb.vector.kind = 'connect';
                kb.vector.host = connectConfig.config?.host;
                kb.vector.port = connectConfig.config?.port;
                kb.vector.username = connectConfig.config?.username;
                kb.vector.password = connectConfig.config?.password;
                kb.vector.database = connectConfig.config?.database || DefaultConfig.DATABASE_NAME;
                kb.vector.collectionName = connectConfig.config?.collection || DefaultConfig.COLLECTION_NAME;

                if(config.documentCount) {
                    kb.vector.topK = config.documentCount;
                }

                if(config.matchingThreshold) {
                    kb.vector.threshold = config.matchingThreshold;
                }
            }
        }

        if(config.rerankerConnectId) {
            const connectConfig = await credentialManager.mediator?.get(config.rerankerConnectId);
            if(connectConfig) {
                kb.reranker.kind = 'connect';
                kb.reranker.series = connectConfig.config?.driver as ModelSeries || ModelSeries.Unknown;
                kb.reranker.baseUrl = connectConfig.config?.baseUrl;
                kb.reranker.apiKey = connectConfig.config?.apiKey;
                kb.reranker.model = config.rerankerModelId || DefaultConfig.RERANKER_MODEL;
            }
        }

        const rag = new KnowledgeBaseInstance(kb);
        await rag.initialize();

        return rag;
    }
}

export const knowledgeBaseManager = new KnowledgeBaseManager();