import { ErrorType, AppError } from '@repo/common';
import { EmbeddingService } from "../types";
import { KnowledgeBaseInstance } from "../KnowledgeBaseManager";

/**
 * 远程向量化服务实现
 * 使用远程API（如OpenAI）进行向量化
 */
export class RemoteEmbeddingService implements EmbeddingService {
    private isConnected = false;
    private connectionPromise: Promise<void> | null = null;

    constructor(private kb: KnowledgeBaseInstance) {
    }

    /**
     * 建立连接
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._establishConnection();
        return this.connectionPromise;
    }

    /**
     * 实际建立连接的私有方法
     */
    private async _establishConnection(): Promise<void> {
        try {
            // 验证配置
            if (!this.kb.config.embedding.apiKey) {
                throw new Error('API key is required for remote embedding service');
            }

            if (!this.kb.config.embedding.baseUrl) {
                throw new Error('API URL is required for remote embedding service');
            }

            // 测试连接
            await this.testConnection();
            this.isConnected = true;
            console.log('Remote embedding service connected successfully');
        } catch (error) {
            this.isConnected = false;
            this.connectionPromise = null;
            throw new Error(`Remote embedding service connection failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 测试连接
     */
    private async testConnection(): Promise<void> {
        try {
            // 发送一个简单的测试请求
            await this.makeApiRequest(['test'], 1);
        } catch (error) {
            // 如果是因为测试文本导致的错误，可能连接是正常的
            if (error instanceof Error && error.message.includes('test')) {
                return;
            }
            throw error;
        }
    }

    /**
     * 确保连接可用
     */
    private async ensureConnection(): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
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

        await this.ensureConnection();

        let retries = 0;
        while (retries < this.kb.config.embedding.maxRetries) {
            try {
                const embeddings = await this.makeApiRequest([text], 1);
                
                if (!embeddings || embeddings.length === 0) {
                    throw new Error('No embedding returned from API');
                }

                const embedding = embeddings[0];

                // 验证向量维度
                if (!embedding || embedding.length !== this.kb.config.embedding.dimension) {
                    throw new Error(`Expected dimension ${this.kb.config.embedding.dimension}, got ${embedding?.length}`);
                }

                return embedding;
            } catch (error) {
                retries++;
                console.warn(`Remote embedding generation attempt ${retries} failed:`, error);

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
            message: 'Unexpected error in remote embedding generation',
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

        await this.ensureConnection();

        const results: number[][] = [];
        const batchSize = this.kb.config.embedding.batchSize;

        // 分批处理以避免API限制
        for (let i = 0; i < validTexts.length; i += batchSize) {
            const batch = validTexts.slice(i, i + batchSize);
            console.log(`Processing remote batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)}`);

            try {
                const batchResults = await this.makeApiRequest(batch, batch.length);
                results.push(...batchResults);
            } catch (error) {
                console.error(`Failed to process remote batch starting at index ${i}:`, error);

                // 如果批处理失败，尝试逐个处理
                for (const text of batch) {
                    try {
                        const embedding = await this.generateEmbedding(text);
                        results.push(embedding);
                    } catch (singleError) {
                        console.error('Failed to process single text remotely, skipping:', singleError);
                        // 跳过失败的文本，但记录错误
                    }
                }
            }
        }

        return results;
    }

    /**
     * 发送API请求
     */
    private async makeApiRequest(texts: string[], expectedCount: number): Promise<number[][]> {
        const requestBody = {
            input: texts,
            model: this.kb.config.embedding.model,
            encoding_format: 'float'
        };

        const response = await fetch(this.kb.config.embedding.baseUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.kb.config.embedding.apiKey}`,
                'User-Agent': 'Cofly-KnowledgeBase/1.0'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(this.kb.config.embedding.timeout)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid API response format');
        }

        const embeddings: number[][] = data.data.map((item: any) => {
            if (!item.embedding || !Array.isArray(item.embedding)) {
                throw new Error('Invalid embedding format in API response');
            }
            return item.embedding;
        });

        if (embeddings.length !== expectedCount) {
            throw new Error(`Expected ${expectedCount} embeddings, got ${embeddings.length}`);
        }

        return embeddings;
    }

    /**
     * 断开连接
     */
    async disconnect(): Promise<void> {
        this.isConnected = false;
        this.connectionPromise = null;
        console.log('Remote embedding service disconnected');
    }

    /**
     * 重新连接
     */
    async reconnect(): Promise<void> {
        await this.disconnect();
        await this.connect();
    }

    /**
     * 检查服务是否就绪
     */
    isReady(): boolean {
        return this.isConnected;
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
        await this.disconnect();
    }
}