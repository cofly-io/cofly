import { ErrorType, AppError } from '@repo/common';
import { LocalEmbeddingService } from './embeddings/LocalEmbeddingService';
import { EmbeddingService, EmbeddingConfig } from './types';
import { KnowledgeBaseInstance } from './KnowledgeBaseManager';

/**
 * 增强的向量化配置接口
 */
export interface EnhancedEmbeddingConfig extends EmbeddingConfig {
  // 性能优化配置
  enableCaching: boolean;
  cacheSize: number;
  enableBatching: boolean;
  batchTimeout: number; // 批处理超时时间（毫秒）
  
  // 错误处理配置
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number; // 失败阈值
  circuitBreakerTimeout: number; // 熔断器恢复时间（毫秒）
  
  // 降级配置
  enableFallback: boolean;
  fallbackStrategy: 'cache' | 'simple' | 'skip';
  
  // 监控配置
  enableMetrics: boolean;
}

/**
 * 缓存条目接口
 */
interface CacheEntry {
  embedding: number[];
  timestamp: number;
  hitCount: number;
}

/**
 * 性能指标接口
 */
export interface EmbeddingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLatency: number;
  batchProcessed: number;
  circuitBreakerTrips: number;
  fallbackUsed: number;
}

/**
 * 熔断器状态枚举
 */
enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * 批处理队列项接口
 */
interface BatchQueueItem {
  text: string;
  resolve: (embedding: number[]) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * 增强的向量化服务实现
 * 包含缓存、批处理、熔断器、降级等功能
 */
export class EnhancedEmbeddingService implements EmbeddingService {
    private baseService: LocalEmbeddingService;
    private config: EnhancedEmbeddingConfig;

    // 缓存相关
    private cache = new Map<string, CacheEntry>();
    private cacheCleanupInterval?: NodeJS.Timeout;

    // 批处理相关
    private batchQueue: BatchQueueItem[] = [];
    private batchTimer?: NodeJS.Timeout;

    // 熔断器相关
    private circuitBreakerState = CircuitBreakerState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private circuitBreakerTimer?: NodeJS.Timeout;

    // 性能指标
    private metrics: EmbeddingMetrics = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageLatency: 0,
        batchProcessed: 0,
        circuitBreakerTrips: 0,
        fallbackUsed: 0,
    };

    private latencySum = 0;

    constructor(private kb: KnowledgeBaseInstance, customConfig?: Partial<EnhancedEmbeddingConfig>) {
        this.config = {
            // 从知识库配置继承基础配置
            ...kb.config.embedding,

            // 增强配置
            enableCaching: true,
            cacheSize: 1000,
            enableBatching: true,
            batchTimeout: 100,
            enableCircuitBreaker: true,
            circuitBreakerThreshold: 5,
            circuitBreakerTimeout: 60000,
            enableFallback: true,
            fallbackStrategy: 'cache',
            enableMetrics: true,

            ...customConfig,
        };

        this.baseService = new LocalEmbeddingService(this.kb);

        if (this.config.enableCaching) {
            this.setupCacheCleanup();
        }
    }

    /**
     * 生成单个文本的向量表示（增强版）
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const startTime = Date.now();
        this.metrics.totalRequests++;

        try {
            // 检查熔断器状态
            if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen()) {
                return await this.handleFallback(text, 'Circuit breaker is open');
            }

            // 检查缓存
            if (this.config.enableCaching) {
                const cached = this.getCachedEmbedding(text);
                if (cached) {
                    this.metrics.cacheHits++;
                    this.recordLatency(startTime);
                    return cached;
                }
                this.metrics.cacheMisses++;
            }

            // 使用批处理（如果启用）
            if (this.config.enableBatching) {
                return await this.addToBatch(text);
            }

            // 直接处理
            const embedding = await this.processWithErrorHandling(text);

            // 缓存结果
            if (this.config.enableCaching) {
                this.cacheEmbedding(text, embedding);
            }

            this.metrics.successfulRequests++;
            this.recordLatency(startTime);
            this.recordSuccess();

            return embedding;
        } catch (error) {
            this.metrics.failedRequests++;
            this.recordLatency(startTime);
            this.recordFailure();

            // 尝试降级处理
            if (this.config.enableFallback) {
                try {
                    const fallbackResult = await this.handleFallback(text, error instanceof Error ? error.message : 'Unknown error');
                    this.metrics.fallbackUsed++;
                    return fallbackResult;
                } catch (fallbackError) {
                    // 降级也失败，抛出原始错误
                    throw error;
                }
            }

            throw error;
        }
    }

    /**
     * 批量生成文本向量表示（增强版）
     */
    async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
        if (!texts || texts.length === 0) {
            return [];
        }

        const startTime = Date.now();
        this.metrics.totalRequests += texts.length;

        try {
            // 检查熔断器状态
            if (this.config.enableCircuitBreaker && this.isCircuitBreakerOpen()) {
                const results: number[][] = [];
                for (const text of texts) {
                    try {
                        const fallbackResult = await this.handleFallback(text, 'Circuit breaker is open');
                        results.push(fallbackResult);
                    } catch (error) {
                        // 跳过失败的文本
                        console.error('Fallback failed for text:', error);
                    }
                }
                return results;
            }

            // 分离缓存命中和未命中的文本
            const cachedResults: { [index: number]: number[] } = {};
            const uncachedTexts: { text: string; originalIndex: number }[] = [];

            if (this.config.enableCaching) {
                texts.forEach((text, index) => {
                    const cached = this.getCachedEmbedding(text);
                    if (cached) {
                        cachedResults[index] = cached;
                        this.metrics.cacheHits++;
                    } else {
                        uncachedTexts.push({text, originalIndex: index});
                        this.metrics.cacheMisses++;
                    }
                });
            } else {
                texts.forEach((text, index) => {
                    uncachedTexts.push({text, originalIndex: index});
                });
            }

            // 处理未缓存的文本
            const uncachedEmbeddings = uncachedTexts.length > 0
                ? await this.baseService.generateBatchEmbeddings(uncachedTexts.map(item => item.text))
                : [];

            // 缓存新生成的向量
            if (this.config.enableCaching) {
                uncachedTexts.forEach((item, index) => {
                    if (index < uncachedEmbeddings.length) {
                        if(uncachedEmbeddings[index]) {
                            this.cacheEmbedding(item.text, uncachedEmbeddings[index]);
                        }
                    }
                });
            }

            // 合并结果
            const results: number[][] = new Array(texts.length);

            // 填入缓存结果
            Object.entries(cachedResults).forEach(([index, embedding]) => {
                results[parseInt(index)] = embedding;
            });

            // 填入新生成的结果
            uncachedTexts.forEach((item, index) => {
                if (index < uncachedEmbeddings.length && uncachedEmbeddings[index]) {
                    results[item.originalIndex] = uncachedEmbeddings[index];
                }
            });

            // 过滤掉未定义的结果
            const validResults = results.filter(result => result !== undefined);

            this.metrics.successfulRequests += validResults.length;
            this.metrics.batchProcessed++;
            this.recordLatency(startTime);
            this.recordSuccess();

            return validResults;
        } catch (error) {
            this.metrics.failedRequests += texts.length;
            this.recordLatency(startTime);
            this.recordFailure();

            // 尝试逐个处理（降级策略）
            if (this.config.enableFallback) {
                const results: number[][] = [];
                for (const text of texts) {
                    try {
                        const embedding = await this.generateEmbedding(text);
                        results.push(embedding);
                    } catch (singleError) {
                        console.error('Failed to process single text in fallback:', singleError);
                    }
                }
                if (results.length > 0) {
                    this.metrics.fallbackUsed++;
                    return results;
                }
            }

            throw error;
        }
    }

    /**
     * 带错误处理的处理方法
     */
    private async processWithErrorHandling(text: string): Promise<number[]> {
        try {
            return await this.baseService.generateEmbedding(text);
        } catch (error) {
            // 记录错误并重新抛出
            console.error('Embedding generation failed:', error);
            throw error;
        }
    }

    /**
     * 添加到批处理队列
     */
    private async addToBatch(text: string): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            this.batchQueue.push({
                text,
                resolve,
                reject,
                timestamp: Date.now(),
            });

            // 如果队列满了或者是第一个项目，立即处理
            if (this.batchQueue.length >= this.config.batchSize || this.batchQueue.length === 1) {
                this.processBatchQueue();
            } else if (!this.batchTimer) {
                // 设置定时器
                this.batchTimer = setTimeout(() => {
                    this.processBatchQueue();
                }, this.config.batchTimeout);
            }
        });
    }

    /**
     * 处理批处理队列
     */
    private async processBatchQueue(): Promise<void> {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = undefined;
        }

        if (this.batchQueue.length === 0) {
            return;
        }

        const currentBatch = this.batchQueue.splice(0, this.config.batchSize);
        const texts = currentBatch.map(item => item.text);

        try {
            const embeddings = await this.baseService.generateBatchEmbeddings(texts);

            // 返回结果给各个 Promise
            currentBatch.forEach((item, index) => {
                if (index < embeddings.length) {
                    if (embeddings[index] !== undefined) {
                        // 缓存结果
                        if (this.config.enableCaching) {
                            this.cacheEmbedding(item.text, embeddings[index]);
                        }
                        item.resolve(embeddings[index]);
                    }
                } else {
                    item.reject(new Error('Batch processing incomplete'));
                }
            });
        } catch (error) {
            // 批处理失败，尝试逐个处理
            for (const item of currentBatch) {
                try {
                    const embedding = await this.processWithErrorHandling(item.text);
                    if (this.config.enableCaching) {
                        this.cacheEmbedding(item.text, embedding);
                    }
                    item.resolve(embedding);
                } catch (singleError) {
                    item.reject(singleError instanceof Error ? singleError : new Error('Unknown error'));
                }
            }
        }
    }

    /**
     * 获取缓存的向量
     */
    private getCachedEmbedding(text: string): number[] | null {
        const key = this.getCacheKey(text);
        const entry = this.cache.get(key);

        if (entry) {
            entry.hitCount++;
            entry.timestamp = Date.now(); // 更新访问时间
            return entry.embedding;
        }

        return null;
    }

    /**
     * 缓存向量
     */
    private cacheEmbedding(text: string, embedding: number[]): void {
        const key = this.getCacheKey(text);

        // 检查缓存大小限制
        if (this.cache.size >= this.config.cacheSize) {
            this.evictLeastUsed();
        }

        this.cache.set(key, {
            embedding: [...embedding], // 创建副本
            timestamp: Date.now(),
            hitCount: 0,
        });
    }

    /**
     * 生成缓存键
     */
    private getCacheKey(text: string): string {
        // 使用简单的哈希函数
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    }

    /**
     * 驱逐最少使用的缓存项
     */
    private evictLeastUsed(): void {
        let leastUsedKey: string | null = null;
        let leastUsedScore = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            // 计算分数：命中次数 / 时间差（越小越容易被驱逐）
            const timeDiff = Date.now() - entry.timestamp;
            const score = entry.hitCount / (timeDiff + 1);

            if (score < leastUsedScore) {
                leastUsedScore = score;
                leastUsedKey = key;
            }
        }

        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
        }
    }

    /**
     * 设置缓存清理定时器
     */
    private setupCacheCleanup(): void {
        this.cacheCleanupInterval = setInterval(() => {
            const now = Date.now();
            const maxAge = 60 * 60 * 1000; // 1小时

            for (const [key, entry] of this.cache.entries()) {
                if (now - entry.timestamp > maxAge) {
                    this.cache.delete(key);
                }
            }
        }, 10 * 60 * 1000); // 每10分钟清理一次
    }

    /**
     * 检查熔断器是否打开
     */
    private isCircuitBreakerOpen(): boolean {
        if (this.circuitBreakerState === CircuitBreakerState.OPEN) {
            // 检查是否可以尝试半开状态
            if (Date.now() - this.lastFailureTime > this.config.circuitBreakerTimeout) {
                this.circuitBreakerState = CircuitBreakerState.HALF_OPEN;
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * 记录成功
     */
    private recordSuccess(): void {
        if (this.config.enableCircuitBreaker) {
            if (this.circuitBreakerState === CircuitBreakerState.HALF_OPEN) {
                this.circuitBreakerState = CircuitBreakerState.CLOSED;
                this.failureCount = 0;
            }
        }
    }

    /**
     * 记录失败
     */
    private recordFailure(): void {
        if (this.config.enableCircuitBreaker) {
            this.failureCount++;
            this.lastFailureTime = Date.now();

            if (this.failureCount >= this.config.circuitBreakerThreshold) {
                this.circuitBreakerState = CircuitBreakerState.OPEN;
                this.metrics.circuitBreakerTrips++;
                console.warn('Circuit breaker opened due to repeated failures');
            }
        }
    }

    /**
     * 处理降级逻辑
     */
    private async handleFallback(text: string, reason: string): Promise<number[]> {
        console.warn(`Using fallback for text embedding. Reason: ${reason}`);

        switch (this.config.fallbackStrategy) {
            case 'cache':
                // 尝试从缓存获取类似的结果
                const cached = this.getCachedEmbedding(text);
                if (cached) {
                    return cached;
                }
            // 如果缓存中没有，继续到下一个策略

            case 'simple':
                // 返回简单的向量（全零或随机）
                return new Array(this.config.dimension).fill(0);

            case 'skip':
            default:
                throw new AppError(ErrorType.VECTORIZATION_FAILED, `Fallback failed: ${reason}`);
        }
    }

    /**
     * 记录延迟
     */
    private recordLatency(startTime: number): void {
        if (this.config.enableMetrics) {
            const latency = Date.now() - startTime;
            this.latencySum += latency;
            this.metrics.averageLatency = this.latencySum / this.metrics.totalRequests;
        }
    }

    /**
     * 检查服务是否就绪
     */
    isReady(): boolean {
        return this.baseService.isReady() && this.circuitBreakerState !== CircuitBreakerState.OPEN;
    }

    /**
     * 获取模型信息
     */
    getModelInfo(): { model: string; dimension: number } {
        return this.baseService.getModelInfo();
    }

    /**
     * 获取性能指标
     */
    getMetrics(): EmbeddingMetrics {
        return {...this.metrics};
    }

    /**
     * 重置性能指标
     */
    resetMetrics(): void {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageLatency: 0,
            batchProcessed: 0,
            circuitBreakerTrips: 0,
            fallbackUsed: 0,
        };
        this.latencySum = 0;
    }

    /**
     * 清理资源
     */
    async dispose(): Promise<void> {
        // 清理定时器
        if (this.cacheCleanupInterval) {
            clearInterval(this.cacheCleanupInterval);
        }
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        if (this.circuitBreakerTimer) {
            clearTimeout(this.circuitBreakerTimer);
        }

        // 处理剩余的批处理队列
        if (this.batchQueue.length > 0) {
            await this.processBatchQueue();
        }

        // 清理缓存
        this.cache.clear();

        // 清理基础服务
        await this.baseService.dispose();
    }
}