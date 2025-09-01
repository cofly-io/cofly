import { ErrorType, AppError, getConnectRegistry, ILLMConnect } from '@repo/common';
import { EmbeddingService } from "../types";
import { KnowledgeBaseInstance } from "../KnowledgeBaseManager";

/**
 * 远程向量化服务实现
 * 使用远程API（如OpenAI）进行向量化
 */
export class RemoteEmbeddingService implements EmbeddingService {

    constructor(private kb: KnowledgeBaseInstance) {
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

        let retries = 0;
        while (retries < this.kb.config.embedding.maxRetries) {
            try {
                const embeddings = await this.makeApiRequest([text]);
                
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

        const results: number[][] = [];
        const batchSize = this.kb.config.embedding.batchSize;

        // 分批处理以避免API限制
        for (let i = 0; i < validTexts.length; i += batchSize) {
            const batch = validTexts.slice(i, i + batchSize);
            console.log(`Processing remote batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validTexts.length / batchSize)}`);

            try {
                const batchResults = await this.makeApiRequest(batch);
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
    private async makeApiRequest(texts: string[]): Promise<number[][]> {
        const registry = getConnectRegistry();
        const connect = registry.getConnectsByProvider(this.kb.config.embedding.series?.toString() || "openai").at(0) as ILLMConnect;
        if(!connect || !connect.execute) {
            throw new Error('Invalid Connection format');
        }

        const embeddings: number[][] = [];
        for(const text of texts) {

            const requestBody = {
                input: text,
                model: this.kb.config.embedding.model
            };

            const result = await connect.execute({
                input: requestBody,
                model: this.kb.config.embedding.series?.toString() || "openai",
                modelType: 'embedding',
                connectInfo: {
                    apiKey: this.kb.config.embedding.apiKey,
                    baseUrl: this.kb.config.embedding.baseUrl,
                }
            });

            const data : number[] = result.data.data[0];
            embeddings.push(data);
        }

        return embeddings;
    }
}