import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';
import path from 'path';
import { ErrorType, AppError } from '@repo/common';
import { EmbeddingService } from "../types";
import { KnowledgeBaseInstance } from "../KnowledgeBaseManager";
import { DefaultConfig } from "../Constants";

// 允许本地模型
env.allowLocalModels = true;

// 禁止联网（否则会 fallback 到 Hugging Face）
env.allowRemoteModels = false;

// 也可以指定缓存目录（可选）
env.cacheDir = path.resolve(process.env.MODEL_DIR_BASE || DefaultConfig.MODEL_DIR_BASE);

/**
 * 本地向量化服务实现
 * 使用 @xenova/transformers 库实现本地向量化
 */
export class LocalEmbeddingService implements EmbeddingService {
    private pipeline: FeatureExtractionPipeline | null = null;
    private isInitialized = false;
    private initializationPromise: Promise<void> | null = null;

    constructor(private kb: KnowledgeBaseInstance) {
    }

    /**
     * 初始化向量化模型
     */
    private async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    private async _doInitialize(): Promise<void> {
        try {
            console.log(`Initializing embedding model: ${this.kb.config.embedding.model}`);

            // 创建特征提取管道
            this.pipeline = await pipeline('feature-extraction', this.kb.config.embedding.model, {
                local_files_only: true // 进一步强制本地
            });

            // 确保维度配置正确（all-MiniLM-L6-v2 是 384维）
            this.kb.config.embedding.dimension = 384;

            this.isInitialized = true;
            console.log('Embedding model initialized successfully with 384 dimensions');
        } catch (error) {
            this.isInitialized = false;
            this.initializationPromise = null;

            const appError: AppError = {
                type: ErrorType.VECTORIZATION_FAILED,
                message: `Failed to initialize embedding model: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: {model: this.kb.config.embedding.model, error},
                timestamp: new Date(),
            };

            console.error('Failed to initialize embedding model:', appError);
            throw appError;
        }
    }

    /**
     * 生成单个文本的向量表示
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!text || text.trim().length === 0) {
            const error: AppError = {
                type: ErrorType.VALIDATION_ERROR,
                message: 'Text cannot be empty',
                timestamp: new Date(),
            };
            throw error;
        }

        await this.initialize();

        if (!this.pipeline) {
            const error: AppError = {
                type: ErrorType.VECTORIZATION_FAILED,
                message: 'Embedding pipeline not initialized',
                timestamp: new Date(),
            };
            throw error;
        }

        let retries = 0;
        while (retries < this.kb.config.embedding.maxRetries) {
            try {
                // 预处理文本
                const processedText = this.preprocessText(text);

                // 生成向量
                const result = await Promise.race([
                    this.pipeline(processedText),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), this.kb.config.embedding.timeout)
                    ),
                ]);

                // 提取向量数据
                const embedding = this.extractEmbedding(result);

                // 验证向量维度
                if (embedding.length !== this.kb.config.embedding.dimension) {
                    throw new Error(`Expected dimension ${this.kb.config.embedding.dimension}, got ${embedding.length}`);
                }

                return embedding;
            } catch (error) {
                retries++;
                console.warn(`Embedding generation attempt ${retries} failed:`, error);

                if (retries >= this.kb.config.embedding.maxRetries) {
                    const appError: AppError = {
                        type: ErrorType.VECTORIZATION_FAILED,
                        message: `Failed to generate embedding after ${this.kb.config.embedding.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        details: {text: text.substring(0, 100), retries, error},
                        timestamp: new Date(),
                    };
                    throw appError;
                }

                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
        }

        const error: AppError = {
            type: ErrorType.VECTORIZATION_FAILED,
            message: 'Unexpected error in embedding generation',
            timestamp: new Date(),
        };
        throw error;
    }

    /**
     * 批量生成文本向量表示
     */
    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        if (!texts || texts.length === 0) {
            return [];
        }

        // 过滤空文本
        const validTexts = texts.filter(text => text && text.trim().length > 0);
        if (validTexts.length === 0) {
            return [];
        }

        await this.initialize();

        const results: number[][] = [];
        const batchSize = this.kb.config.embedding.batchSize;

        // 分批处理以避免内存问题
        for (let i = 0; i < validTexts.length; i += batchSize) {
            const batch = validTexts.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)}`);

            try {
                const batchResults = await this.processBatch(batch);
                results.push(...batchResults);
            } catch (error) {
                console.error(`Failed to process batch starting at index ${i}:`, error);

                // 如果批处理失败，尝试逐个处理
                for (const text of batch) {
                    try {
                        const embedding = await this.generateEmbedding(text);
                        results.push(embedding);
                    } catch (singleError) {
                        console.error('Failed to process single text, skipping:', singleError);
                        // 跳过失败的文本，但记录错误
                    }
                }
            }
        }

        return results;
    }

    /**
     * 处理单个批次
     */
    private async processBatch(texts: string[]): Promise<number[][]> {
        if (!this.pipeline) {
            throw new Error('Pipeline not initialized');
        }

        const processedTexts = texts.map(text => this.preprocessText(text));

        const result = await Promise.race([
            this.pipeline(processedTexts),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Batch timeout')), this.kb.config.embedding.timeout * 2)
            ),
        ]);

        return this.extractBatchEmbeddings(result, texts.length);
    }

    /**
     * 预处理文本
     */
    private preprocessText(text: string): string {
        const processed = text
            .trim()
            .replace(/\s+/g, ' '); // 规范化空白字符

        // 增加长度限制，避免过度截断
        // all-MiniLM-L6-v2 支持最大256 tokens，但这里是字符数
        return processed.substring(0, 1024);
    }

    /**
     * 从模型输出中提取单个向量（添加归一化）
     */
    private extractEmbedding(result: any): number[] {
        if (!result || !result.data || !result.dims) {
            throw new Error('Invalid embedding result format');
        }

        const [batchSize, seqLength, hiddenSize] = result.dims;

        console.log(`Single result dims: [${batchSize}, ${seqLength}, ${hiddenSize}]`);

        if (batchSize !== 1) {
            throw new Error(`Expected batch size 1 for single embedding, got ${batchSize}`);
        }

        // Mean pooling
        const embedding = new Array(hiddenSize).fill(0);

        for (let tokenIdx = 0; tokenIdx < seqLength; tokenIdx++) {
            for (let dimIdx = 0; dimIdx < hiddenSize; dimIdx++) {
                const dataIndex = tokenIdx * hiddenSize + dimIdx;
                embedding[dimIdx] += result.data[dataIndex];
            }
        }

        // 求平均
        for (let dimIdx = 0; dimIdx < hiddenSize; dimIdx++) {
            embedding[dimIdx] /= seqLength;
        }

        // 🔥 关键修复：归一化向量（对COSINE距离很重要）
        const normalizedEmbedding = this.normalizeVector(embedding);

        return normalizedEmbedding;
    }

    /**
     * 从模型输出中提取批量向量（添加归一化）
     */
    private extractBatchEmbeddings(result: any, expectedCount: number): number[][] {
        if (!result || !result.data || !result.dims) {
            throw new Error('Invalid batch embedding result format');
        }

        const [batchSize, seqLength, hiddenSize] = result.dims;

        console.log(`Batch result dims: [${batchSize}, ${seqLength}, ${hiddenSize}]`);

        if (batchSize !== expectedCount) {
            throw new Error(`Expected batch size ${expectedCount}, got ${batchSize}`);
        }

        const embeddings: number[][] = [];

        // 对每个文本进行处理
        for (let batchIdx = 0; batchIdx < batchSize; batchIdx++) {
            const embedding = new Array(hiddenSize).fill(0);

            // 对该文本的所有token进行mean pooling
            for (let tokenIdx = 0; tokenIdx < seqLength; tokenIdx++) {
                for (let dimIdx = 0; dimIdx < hiddenSize; dimIdx++) {
                    // 3D张量的索引：batch * (seq * hidden) + token * hidden + dim
                    const dataIndex = batchIdx * (seqLength * hiddenSize) + tokenIdx * hiddenSize + dimIdx;
                    embedding[dimIdx] += result.data[dataIndex];
                }
            }

            // 除以token数量得到句子向量
            for (let dimIdx = 0; dimIdx < hiddenSize; dimIdx++) {
                embedding[dimIdx] /= seqLength;
            }

            // 🔥 关键修复：归一化每个向量
            const normalizedEmbedding = this.normalizeVector(embedding);
            embeddings.push(normalizedEmbedding);
        }

        return embeddings;
    }

    /**
     * 🔥 新增：向量归一化方法
     */
    private normalizeVector(embedding: number[]): number[] {
        // 计算向量的L2范数
        const norm = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));

        if (norm === 0) {
            console.warn('Zero vector detected, cannot normalize');
            return embedding;
        }

        // 归一化：每个分量除以范数
        const normalizedEmbedding = embedding.map((val: number) => val / norm);

        // 调试信息
        console.log('Vector norm before normalization:', norm.toFixed(6));
        console.log('Vector sample after normalization:', normalizedEmbedding.slice(0, 3).map((v: number) => v.toFixed(6)));

        return normalizedEmbedding;
    }

    /**
     * 🔥 新增：测试向量质量的方法
     */
    async testVectorQuality(): Promise<void> {
        console.log('=== Testing Vector Quality ===');

        try {
            // 测试相同文本
            const text = "这是一个测试文档";
            const vec1 = await this.generateEmbedding(text);
            const vec2 = await this.generateEmbedding(text);

            const selfSimilarity = this.cosineSimilarity(vec1, vec2);
            console.log('Self similarity (should be ~1.0):', selfSimilarity.toFixed(6));

            // 测试相似文本
            const similarText = "这是一个测试文件";
            const vec3 = await this.generateEmbedding(similarText);
            const similarSimilarity = this.cosineSimilarity(vec1, vec3);
            console.log('Similar text similarity:', similarSimilarity.toFixed(6));

            // 测试不同文本
            const differentText = "完全不相关的内容关于天气";
            const vec4 = await this.generateEmbedding(differentText);
            const differentSimilarity = this.cosineSimilarity(vec1, vec4);
            console.log('Different text similarity:', differentSimilarity.toFixed(6));

            // 检查向量统计信息
            const stats = this.analyzeVector(vec1);
            console.log('Vector stats:', stats);

        } catch (error) {
            console.error('Vector quality test failed:', error);
        }

        console.log('===============================');
    }

    /**
     * 🔥 新增：计算余弦相似度
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        const dotProduct = a.reduce((sum: number, val: number, i: number) => sum + val * b[i]!, 0);
        const normA = Math.sqrt(a.reduce((sum: number, val: number) => sum + val * val, 0));
        const normB = Math.sqrt(b.reduce((sum: number, val: number) => sum + val * val, 0));

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (normA * normB);
    }

    /**
     * 🔥 新增：分析向量统计信息
     */
    private analyzeVector(embedding: number[]) {
        const min = Math.min(...embedding);
        const max = Math.max(...embedding);
        const mean = embedding.reduce((sum: number, val: number) => sum + val, 0) / embedding.length;
        const norm = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));

        return {
            min: min.toFixed(6),
            max: max.toFixed(6),
            mean: mean.toFixed(6),
            norm: norm.toFixed(6),
            length: embedding.length
        };
    }

    /**
     * 检查服务是否就绪
     */
    isReady(): boolean {
        return this.isInitialized && this.pipeline !== null;
    }

    /**
     * 获取模型信息
     */
    getModelInfo(): { model: string; dimension: number } {
        return {
            model: this.kb.config.embedding.model,
            dimension: this.kb.config.embedding.dimension,
        };
    }

    /**
     * 清理资源
     */
    async dispose(): Promise<void> {
        if (this.pipeline) {
            // @xenova/transformers 的管道通常不需要显式清理
            this.pipeline = null;
        }
        this.isInitialized = false;
        this.initializationPromise = null;
    }
}