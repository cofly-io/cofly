import {
    DocumentMetadata,
    DocumentChunk,
    DocumentStatus,
    DocumentProcessingStatus,
    VectorData,
    AppError,
    ErrorType,
    ProcessingResult
} from '@repo/common';
import { prisma } from '@repo/database';
import { DocumentProcessor } from './DocumentProcessor';
import { EmbeddingService, ProcessingStep, VectorService } from "./types";
import { KnowledgeBaseInstance } from "./KnowledgeBaseManager";

/**
 * 完整的文档处理流程服务
 * 集成文件上传、处理、向量化、存储的完整流程
 */
export class DocumentProcessingFlow {
    private prisma = prisma;
    private documentProcessor: DocumentProcessor;
    private embeddingService: EmbeddingService;
    private vecotorService: VectorService;

    constructor(private kb: KnowledgeBaseInstance) {

        this.embeddingService = kb.embedding;
        this.vecotorService = kb.vector;

        this.documentProcessor = new DocumentProcessor({
            storageDir: kb.storagePath,
            chunkSize: kb.config.embedding.chunkSize,
            chunkOverlap: kb.config.embedding.chunkOverlap
        });
    }

    /**
     * 处理文件上传的完整流程
     */
    async processFile(file: File): Promise<ProcessingResult> {
        const startTime = Date.now();
        let documentId: string | null = null;
        let processingStatus: DocumentProcessingStatus | null = null;

        try {
            // 步骤1: 文件验证和上传
            const uploadResult = await this.handleFile(file);
            documentId = uploadResult.id;

            // 创建处理状态记录
            processingStatus = await this.createProcessingStatus(documentId);

            // 启动异步处理
            const processingResult = await this.processDocumentAsync(uploadResult);

            return {
                success: true,
                documentId,
                status: processingResult.status,
                chunkCount: processingResult.chunkCount,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            const appError = this.createAppError(error, 'File upload processing failed');

            // 更新处理状态为失败
            if (processingStatus) {
                await this.updateProcessingStatusError(processingStatus, appError);
            }

            // 更新文档状态为失败
            if (documentId) {
                await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.FAILED);
            }

            return {
                success: false,
                documentId: documentId || '',
                status: DocumentStatus.FAILED,
                chunkCount: 0,
                processingTime,
                error: appError
            };
        }
    }

    /**
     * 重新处理已存在的文档
     */
    async reprocessDocument(documentId: string): Promise<ProcessingResult> {
        const startTime = Date.now();
        let processingStatus: DocumentProcessingStatus | null = null;

        try {
            // 获取文档信息
            const document = await this.prisma.kbDocument.getDocumentById(documentId);
            if (!document) {
                throw new Error(`Document not found: ${documentId}`);
            }

            // 检查文档状态
            if (document.status === DocumentStatus.PROCESSING) {
                throw new Error('Document is already being processed');
            }

            // 清理旧的处理数据
            await this.cleanupOldProcessingData(documentId);

            // 创建新的处理状态记录
            processingStatus = await this.createProcessingStatus(documentId);

            // 重新处理文档
            const processingResult = await this.processDocumentAsync(document);

            return {
                success: true,
                documentId,
                status: processingResult.status,
                chunkCount: processingResult.chunkCount,
                processingTime: Date.now() - startTime
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            const appError = this.createAppError(error, 'Document reprocessing failed');

            // 更新处理状态为失败
            if (processingStatus) {
                await this.updateProcessingStatusError(processingStatus, appError);
            }

            // 更新文档状态为失败
            await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.FAILED);

            return {
                success: false,
                documentId,
                status: DocumentStatus.FAILED,
                chunkCount: 0,
                processingTime,
                error: appError
            };
        }
    }

    /**
     * 处理文件上传
     */
    private async handleFile(file: File): Promise<DocumentMetadata> {
        // 使用文档处理器处理文件上传
        const metadata = {
            ...await this.documentProcessor.processFile(file),
            kbId: this.kb.config.metadata.id
        };

        // 保存到数据库
        await this.prisma.kbDocument.createDocument(metadata);

        return metadata;
    }

    /**
     * 创建处理状态记录
     */
    private async createProcessingStatus(documentId: string): Promise<DocumentProcessingStatus> {
        const processingStatus: DocumentProcessingStatus = {
            documentId,
            status: DocumentStatus.PROCESSING,
            progress: 0,
            currentStep: ProcessingStep.VALIDATION,
            startTime: BigInt(Date.now())
        };

        await this.prisma.kbProcessingStatus.createProcessingStatus(processingStatus);
        return processingStatus;
    }

    /**
     * 异步处理文档
     */
    private async processDocumentAsync(document: DocumentMetadata): Promise<{
        status: DocumentStatus;
        chunkCount: number;
    }> {
        const documentId = document.id;
        let chunks: DocumentChunk[] = [];

        try {
            // 更新文档状态为处理中
            await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.PROCESSING);

            // 步骤1: 文本提取
            await this.updateProcessingProgress(documentId, 10, ProcessingStep.TEXT_EXTRACTION);
            const extractedText = await this.extractTextWithRetry(document);

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text content extracted from document');
            }

            // 步骤2: 文本分块
            await this.updateProcessingProgress(documentId, 30, ProcessingStep.TEXT_CHUNKING);
            chunks = await this.chunkTextWithRetry(extractedText, documentId);

            // 保存文档块到数据库
            for (const chunk of chunks) {
                await this.prisma.kbDocumentChunk.createChunk(chunk);
            }

            // 步骤3: 向量化
            await this.updateProcessingProgress(documentId, 50, ProcessingStep.VECTORIZATION);
            const vectors = await this.generateVectorsWithRetry(chunks);

            // 步骤4: 存储向量到 Milvus
            await this.updateProcessingProgress(documentId, 80, ProcessingStep.VECTOR_STORAGE);
            await this.storeVectorsWithRetry(chunks, vectors, document);

            // 步骤5: 更新元数据
            await this.updateProcessingProgress(documentId, 95, ProcessingStep.METADATA_UPDATE);
            await this.updateDocumentMetadata(document, extractedText, chunks.length);

            // 步骤6: 完成处理
            await this.updateProcessingProgress(documentId, 100, ProcessingStep.COMPLETION);
            await this.completeProcessing(documentId);

            return {
                status: DocumentStatus.COMPLETED,
                chunkCount: chunks.length
            };

        } catch (error) {
            console.error(`Document processing failed for ${documentId}:`, error);

            // 清理失败的数据
            await this.cleanupFailedProcessing(documentId, chunks);

            throw error;
        }
    }

    /**
     * 带重试的文本提取
     */
    private async extractTextWithRetry(document: DocumentMetadata): Promise<string> {
        let lastError: Error;

        for (let attempt = 0; attempt < this.kb.config.processor.maxRetries; attempt++) {
            try {
                return await this.documentProcessor.extractTextFromDocument(
                    document.filePath,
                    document.fileType
                );
            } catch (error) {
                // 保持 AppError 的原始结构，不要转换为字符串
                if (error && typeof error === 'object' && 'type' in error) {
                    // AppError objects have their own structure, create a compatible Error
                    const appError = error as AppError;
                    lastError = new Error(appError.message || 'Text extraction failed');
                    // Preserve the original AppError information
                    (lastError as any).originalError = appError;
                } else {
                    lastError = error instanceof Error ? error : new Error(String(error));
                }

                if (attempt < this.kb.config.processor.maxRetries - 1) {
                    console.warn(`Text extraction attempt ${attempt + 1} failed, retrying...`);
                    await this.sleep(this.kb.config.processor.retryDelay * (attempt + 1));
                }
            }
        }

        throw lastError!;
    }

    /**
     * 带重试的文本分块
     */
    private async chunkTextWithRetry(text: string, documentId: string): Promise<DocumentChunk[]> {
        let lastError: Error;

        for (let attempt = 0; attempt < this.kb.config.processor.maxRetries; attempt++) {
            try {
                return this.documentProcessor.chunkText(text, documentId, {
                    chunkSize: this.kb.config.embedding.chunkSize,
                    chunkOverlap: this.kb.config.embedding.chunkOverlap,
                    preserveParagraphs: true,
                    preserveSentences: true
                });
            } catch (error) {
                // 保持 AppError 的原始结构，不要转换为字符串
                if (error && typeof error === 'object' && 'type' in error) {
                    // AppError objects have their own structure, create a compatible Error
                    const appError = error as AppError;
                    lastError = new Error(appError.message || 'Text chunking failed');
                    // Preserve the original AppError information
                    (lastError as any).originalError = appError;
                } else {
                    lastError = error instanceof Error ? error : new Error(String(error));
                }

                if (attempt < this.kb.config.processor.maxRetries - 1) {
                    console.warn(`Text chunking attempt ${attempt + 1} failed, retrying...`);
                    await this.sleep(this.kb.config.processor.retryDelay * (attempt + 1));
                }
            }
        }

        throw lastError!;
    }

    /**
     * 带重试的向量生成
     */
    private async generateVectorsWithRetry(chunks: DocumentChunk[]): Promise<number[][]> {
        let lastError: Error;

        for (let attempt = 0; attempt < this.kb.config.processor.maxRetries; attempt++) {
            try {
                const texts = chunks.map(chunk => chunk.content);
                return await this.embeddingService.generateBatchEmbeddings(texts);
            } catch (error) {
                // 保持 AppError 的原始结构，不要转换为字符串
                if (error && typeof error === 'object' && 'type' in error) {
                    // AppError objects have their own structure, create a compatible Error
                    const appError = error as AppError;
                    lastError = new Error(appError.message || 'Vector generation failed');
                    // Preserve the original AppError information
                    (lastError as any).originalError = appError;
                } else {
                    lastError = error instanceof Error ? error : new Error(String(error));
                }

                if (attempt < this.kb.config.processor.maxRetries - 1) {
                    console.warn(`Vector generation attempt ${attempt + 1} failed, retrying...`);
                    await this.sleep(this.kb.config.processor.retryDelay * (attempt + 1));
                }
            }
        }

        throw lastError!;
    }

    /**
     * 带重试的向量存储
     */
    private async storeVectorsWithRetry(
        chunks: DocumentChunk[],
        vectors: number[][],
        document: DocumentMetadata
    ): Promise<void> {
        let lastError: Error;

        for (let attempt = 0; attempt < this.kb.config.processor.maxRetries; attempt++) {
            try {
                // 确保 Milvus 集合存在
                await this.vecotorService.createCollection(this.kb.config.vector.collectionName, this.kb.config.embedding.dimension);
                await this.vecotorService.createIndex(this.kb.config.vector.collectionName);
                await this.vecotorService.loadCollection(this.kb.config.vector.collectionName);

                // 准备向量数据
                const vectorData: VectorData[] = chunks.map((chunk, index) => ({
                    id: chunk.id,
                    vector: vectors[index] || [],
                    metadata: document,
                    chunkIndex: chunk.chunkIndex
                }));

                // 批量插入向量
                const vectorIds = await this.vecotorService.insertVectors(this.kb.config.vector.collectionName, vectorData);

                // 更新文档块的向量ID
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const vectorId = vectorIds[i];
                    if(chunk && vectorId) {
                        await this.prisma.kbDocumentChunk.updateChunkVectorId(chunk.id, vectorId.toString());
                    }
                }

                return;
            } catch (error) {
                // 保持 AppError 的原始结构，不要转换为字符串
                if (error && typeof error === 'object' && 'type' in error) {
                    // AppError objects have their own structure, create a compatible Error
                    const appError = error as AppError;
                    lastError = new Error(appError.message || 'Vector storage failed');
                    // Preserve the original AppError information
                    (lastError as any).originalError = appError;
                } else {
                    lastError = error instanceof Error ? error : new Error(String(error));
                }

                if (attempt < this.kb.config.processor.maxRetries - 1) {
                    console.warn(`Vector stokbe attempt ${attempt + 1} failed, retrying...`);
                    await this.sleep(this.kb.config.processor.retryDelay * (attempt + 1));
                }
            }
        }

        throw lastError!;
    }

    /**
     * 更新文档元数据
     */
    private async updateDocumentMetadata(
        document: DocumentMetadata,
        extractedText: string,
        chunkCount: number
    ): Promise<void> {
        const textPreview = this.documentProcessor.getTextPreview(extractedText);

        await this.prisma.kbDocument.updateDocumentChunkCount(document.id, chunkCount);
        await this.prisma.kbDocument.updateDocumentTextPreview(document.id, textPreview);
        await this.prisma.kbDocument.updateDocumentStatus(document.id, DocumentStatus.COMPLETED, new Date());
    }

    /**
     * 完成处理
     */
    private async completeProcessing(documentId: string): Promise<void> {
        await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
            status: DocumentStatus.COMPLETED,
            progress: 100,
            currentStep: ProcessingStep.COMPLETION,
            endTime: BigInt(Date.now())
        });
    }

    /**
     * 更新处理进度
     */
    private async updateProcessingProgress(
        documentId: string,
        progress: number,
        step: ProcessingStep
    ): Promise<void> {
        await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
            progress,
            currentStep: step
        });
    }

    /**
     * 更新处理状态错误
     */
    private async updateProcessingStatusError(
        processingStatus: DocumentProcessingStatus,
        error: AppError
    ): Promise<void> {
        await this.prisma.kbProcessingStatus.updateProcessingStatus(processingStatus.documentId, {
            status: DocumentStatus.FAILED,
            error,
            endTime: BigInt(Date.now())
        });
    }

    /**
     * 清理旧的处理数据
     */
    private async cleanupOldProcessingData(documentId: string): Promise<void> {
        try {
            // 删除旧的文档块
            const oldChunks = await this.prisma.kbDocumentChunk.getChunksByDocumentId(documentId);
            for (const chunk of oldChunks) {
                if (chunk.vectorId) {
                    // 从 Milvus 删除向量
                    await this.vecotorService.deleteVector(this.kb.config.vector.collectionName, chunk.vectorId);
                }
            }
            await this.prisma.kbDocumentChunk.deleteChunksByDocumentId(documentId);

            // 删除旧的处理状态
            await this.prisma.kbProcessingStatus.deleteProcessingStatusesByDocumentId(documentId);
        } catch (error) {
            console.warn(`Failed to cleanup old processing data for ${documentId}:`, error);
            // 不抛出错误，继续处理
        }
    }

    /**
     * 清理失败的处理数据
     */
    private async cleanupFailedProcessing(
        documentId: string,
        chunks: DocumentChunk[]
    ): Promise<void> {
        try {
            // 删除已创建的文档块
            for (const chunk of chunks) {
                if (chunk.vectorId) {
                    await this.vecotorService.deleteVector(this.kb.config.vector.collectionName, chunk.vectorId);
                }
                await this.prisma.kbDocumentChunk.deleteChunk(chunk.id);
            }
        } catch (error) {
            console.warn(`Failed to cleanup failed processing data for ${documentId}:`, error);
        }
    }

    /**
     * 创建应用错误
     */
    private createAppError(error: unknown, defaultMessage: string): AppError {
        if (error && typeof error === 'object' && 'type' in error) {
            return error as AppError;
        }

        return {
            type: ErrorType.PROCESSING_ERROR,
            message: error instanceof Error ? error.message : defaultMessage,
            timestamp: new Date(),
            details: error
        };
    }

    /**
     * 休眠工具方法
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取处理状态
     */
    async getProcessingStatus(documentId: string): Promise<DocumentProcessingStatus | null> {
        return await this.prisma.kbProcessingStatus.getCurrentProcessingStatus(documentId, this.kb.id);
    }

    /**
     * 取消处理
     */
    async cancelProcessing(documentId: string): Promise<void> {
        await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
            status: DocumentStatus.FAILED,
            error: {
                type: ErrorType.PROCESSING_ERROR,
                message: 'Processing cancelled by user',
                timestamp: new Date()
            },
            endTime: BigInt(Date.now())
        });

        await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.FAILED);
    }
}