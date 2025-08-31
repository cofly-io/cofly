import {
  DocumentChunk,
  AppError,
  ErrorType,
  SupportedFileType
} from '@repo/common';
import { prisma } from '@repo/database';
import { DefaultConfig } from './Constants'
import { validateSearchQuery } from "./Validation";
import {
    DocumentSearchQuery,
    DocumentSearchResponse, DocumentSearchResult, EmbeddingService, KnowledgeBase, VectorService
} from "./types";
import { KnowledgeBaseInstance } from "./KnowledgeBaseManager";

// /**
//  * 搜索缓存项
//  */
// interface SearchCacheItem {
//   results: DocumentSearchResult[];
//   timestamp: number;
//   queryHash: string;
// }
//
// /**
//  * 搜索统计信息
//  */
// interface SearchStats {
//   totalQueries: number;
//   avekbeQueryTime: number;
//   cacheHitRate: number;
//   popularQueries: Array<{ query: string; count: number }>;
// }

/**
 * 完整的搜索流程服务
 * 集成查询向量化、相似性搜索、结果展示的完整流程
 */
export class SearchFlow {
    private embeddingService: EmbeddingService;
    private vectorService: VectorService;
    private prisma = prisma;

    constructor(private kb: KnowledgeBaseInstance) {
        this.embeddingService = kb.embedding;
        this.vectorService = kb.vector;
    }

    /**
     * 执行搜索的完整流程
     */
    async search(searchQuery: DocumentSearchQuery): Promise<DocumentSearchResponse> {
        const startTime = Date.now();

        try {
            // 步骤1: 验证搜索查询
            const validation = this.validateQuery(searchQuery);
            if (!validation.isValid) {
                throw this.createValidationError(validation.error || 'Invalid search query');
            }

            // 步骤2: 规范化查询参数
            const normalizedQuery = this.normalizeSearchQuery(searchQuery);

            // 步骤3: 检查缓存
            // if (this.kb.config.vector.cacheEnabled) {
            //     const cachedResult = this.getCachedResult(normalizedQuery);
            //     if (cachedResult) {
            //         this.updateSearchStats(Date.now() - startTime, true);
            //         return this.createSearchResponse(cachedResult, normalizedQuery, Date.now() - startTime);
            //     }
            // }

            // 步骤4: 生成查询向量
            const queryVector = await this.generateQueryVector(normalizedQuery.query);

            // 步骤5: 执行向量搜索
            const vectorResults = await this.performVectorSearch(queryVector, normalizedQuery);

            // 步骤6: 增强搜索结果
            const enhancedResults = await this.enhanceSearchResults(vectorResults, normalizedQuery);

            // 步骤7: 应用过滤器和排序
            const filteredResults = this.applyFiltersAndSorting(enhancedResults, normalizedQuery);

            // 步骤8: 缓存结果
            // if (this.kb.config.vector.cacheEnabled) {
            //     this.cacheSearchResult(normalizedQuery, filteredResults);
            // }

            // // 步骤9: 更新统计信息
            // this.updateSearchStats(Date.now() - startTime, false);
            // this.updatePopularQueries(normalizedQuery.query);

            return this.createSearchResponse(filteredResults, normalizedQuery, Date.now() - startTime);

        } catch (error) {
            console.error('Search flow error:', error);

            const appError = this.createAppError(error, 'Search failed');
            throw appError;
        }
    }

    /**
     * 获取搜索建议
     */
    // async getSearchSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    //     try {
    //         if (!partialQuery || partialQuery.trim().length < 2) {
    //             return [];
    //         }
    //
    //         // 从流行查询中获取建议
    //         const suggestions = this.searchStats.popularQueries
    //             .filter(item => item.query.toLowerCase().includes(partialQuery.toLowerCase()))
    //             .slice(0, limit)
    //             .map(item => item.query);
    //
    //         // 如果建议不足，从文档中获取相关关键词
    //         if (suggestions.length < limit) {
    //             const documentSuggestions = await this.getDocumentBasedSuggestions(
    //                 partialQuery,
    //                 limit - suggestions.length
    //             );
    //             suggestions.push(...documentSuggestions);
    //         }
    //
    //         return suggestions;
    //     } catch (error) {
    //         console.error('Failed to get search suggestions:', error);
    //         return [];
    //     }
    // }

    /**
     * 获取相似文档
     */
    async getSimilarDocuments(documentId: string, limit: number = 5): Promise<DocumentSearchResult[]> {
        try {
            // 获取文档信息
            const document = await this.prisma.kbDocument.getDocumentById(documentId);
            if (!document) {
                throw new Error(`Document not found: ${documentId}`);
            }

            // 使用文档的文本预览作为查询
            const searchQuery: DocumentSearchQuery = {
                query: document.textPreview,
                topK: limit + 1, // +1 因为结果会包含原文档
                threshold: 0.3 // 降低阈值以获取更多相似文档
            };

            const searchResponse = await this.search(searchQuery);

            // 过滤掉原文档
            const similarDocuments = searchResponse.results.filter(
                result => result.metadata.id !== documentId
            ).slice(0, limit);

            return similarDocuments;
        } catch (error) {
            console.error('Failed to get similar documents:', error);
            return [];
        }
    }

    /**
     * 验证搜索查询
     */
    private validateQuery(searchQuery: DocumentSearchQuery): { isValid: boolean; error?: string } {
        const validation = validateSearchQuery(searchQuery.query);
        if (!validation.isValid) {
            return {isValid: false, error: validation.error};
        }

        // 验证其他参数
        if (searchQuery.topK && (searchQuery.topK < 1 || searchQuery.topK > this.kb.config.vector.maxTopK)) {
            return {
                isValid: false,
                error: `topK must be between 1 and ${this.kb.config.vector.maxTopK}`
            };
        }

        if (searchQuery.threshold && (searchQuery.threshold < 0 || searchQuery.threshold > 1)) {
            return {
                isValid: false,
                error: 'threshold must be between 0 and 1'
            };
        }

        return {isValid: true};
    }

    /**
     * 规范化搜索查询
     */
    private normalizeSearchQuery(searchQuery: DocumentSearchQuery): DocumentSearchQuery {
        return {
            ...searchQuery,
            query: searchQuery.query.trim(),
            topK: Math.min(searchQuery.topK || this.kb.config.vector.defaultTopK, this.kb.config.vector.maxTopK),
            threshold: searchQuery.threshold || this.kb.config.vector.defaultThreshold
        };
    }

    /**
     * 生成查询向量
     */
    private async generateQueryVector(query: string): Promise<number[]> {
        try {
            return await this.embeddingService.generateEmbedding(query);
        } catch (error) {
            throw this.createAppError(error, 'Failed to generate query vector');
        }
    }

    /**
     * 执行向量搜索
     */
    private async performVectorSearch(
        queryVector: number[],
        searchQuery: DocumentSearchQuery
    ): Promise<DocumentSearchResult[]> {
        try {
            const topK = (searchQuery.topK || this.kb.config.vector.defaultTopK) * 2; // 获取更多结果用于后续过滤

            return await this.vectorService.searchSimilar(
                this.kb.config.vector.collectionName,
                queryVector,
                topK
            );
        } catch (error) {
            throw this.createAppError(error, 'Vector search failed');
        }
    }

    /**
     * 增强搜索结果
     */
    private async enhanceSearchResults(
        vectorResults: DocumentSearchResult[],
        searchQuery: DocumentSearchQuery
    ): Promise<DocumentSearchResult[]> {
        const enhancedResults: DocumentSearchResult[] = [];

        for (const vectorResult of vectorResults) {
            try {
                // 获取完整的文档信息
                const document = await this.prisma.kbDocument.getDocumentById(
                    vectorResult.metadata.id
                );

                if (!document) {
                    console.warn(`Document not found: ${vectorResult.metadata.id}`);
                    continue;
                }

                // 获取文档块信息
                let chunk: DocumentChunk | undefined;
                if (vectorResult.chunkIndex !== undefined) {
                    const chunks = await this.prisma.kbDocumentChunk.getChunksByDocumentId(document.id);
                    chunk = chunks.find(c => c.chunkIndex === vectorResult.chunkIndex);
                }

                // 生成高亮内容
                const highlightedContent = this.kb.config.vector.highlightEnabled
                    ? this.generateHighlightedContent(
                        chunk?.content || document.textPreview,
                        searchQuery.query
                    )
                    : chunk?.content || document.textPreview;

                const enhancedResult: DocumentSearchResult = {
                    ...vectorResult,
                    metadata: document,
                    chunk,
                    highlightedContent
                };

                enhancedResults.push(enhancedResult);
            } catch (error) {
                console.error(`Error enhancing search result ${vectorResult.id}:`, error);
                // 继续处理其他结果
            }
        }

        return enhancedResults;
    }

    /**
     * 应用过滤器和排序
     */
    private applyFiltersAndSorting(
        results: DocumentSearchResult[],
        searchQuery: DocumentSearchQuery
    ): DocumentSearchResult[] {
        let filteredResults = results;

        // 应用相关度阈值过滤
        if (searchQuery.threshold) {
            filteredResults = filteredResults.filter(
                result => result.score >= searchQuery.threshold!
            );
        }

        // 应用其他过滤器
        if (searchQuery.filters) {
            filteredResults = this.applyAdvancedFilters(filteredResults, searchQuery.filters);
        }

        // 排序结果（默认按相关度排序）
        filteredResults.sort((a, b) => b.score - a.score);

        // 限制结果数量
        const topK = searchQuery.topK || this.kb.config.vector.defaultTopK;
        return filteredResults.slice(0, topK);
    }

    /**
     * 应用高级过滤器
     */
    private applyAdvancedFilters(
        results: DocumentSearchResult[],
        filters: DocumentSearchQuery['filters']
    ): DocumentSearchResult[] {
        if (!filters) return results;

        let filteredResults = results;

        // 文件类型过滤
        if (filters.fileTypes && filters.fileTypes.length > 0) {
            filteredResults = filteredResults.filter(result =>
                filters.fileTypes!.includes(result.metadata.fileType)
            );
        }

        // 日期范围过滤
        if (filters.dateRange) {
            const {start, end} = filters.dateRange;
            filteredResults = filteredResults.filter(result => {
                const uploadTime = new Date(result.metadata.uploadTime);
                return uploadTime >= start && uploadTime <= end;
            });
        }

        // 文件大小范围过滤
        if (filters.fileSizeRange) {
            const {min, max} = filters.fileSizeRange;
            filteredResults = filteredResults.filter(result => {
                const fileSize = result.metadata.fileSize;
                return fileSize >= min && fileSize <= max;
            });
        }

        return filteredResults;
    }

    /**
     * 生成高亮内容
     */
    private generateHighlightedContent(content: string, query: string): string {
        if (!content || !query) {
            return content;
        }

        // 提取关键词
        const keywords = query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 1)
            .slice(0, 10); // 限制关键词数量

        let highlightedContent = content;

        // 高亮每个关键词
        for (const keyword of keywords) {
            const regex = new RegExp(`(${this.escapeRegExp(keyword)})`, 'gi');
            highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
        }

        return highlightedContent;
    }

    /**
     * 转义正则表达式特殊字符
     */
    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // /**
    //  * 获取缓存结果
    //  */
    // private getCachedResult(searchQuery: DocumentSearchQuery): DocumentSearchResult[] | null {
    //     const queryHash = this.generateQueryHash(searchQuery);
    //     const cacheItem = this.searchCache.get(queryHash);
    //
    //     if (cacheItem && Date.now() - cacheItem.timestamp < this.kb.config.vector.cacheTTL) {
    //         return cacheItem.results;
    //     }
    //
    //     return null;
    // }

    // /**
    //  * 缓存搜索结果
    //  */
    // private cacheSearchResult(searchQuery: DocumentSearchQuery, results: DocumentSearchResult[]): void {
    //     const queryHash = this.generateQueryHash(searchQuery);
    //     const cacheItem: SearchCacheItem = {
    //         results,
    //         timestamp: Date.now(),
    //         queryHash
    //     };
    //
    //     this.searchCache.set(queryHash, cacheItem);
    //
    //     // 限制缓存大小
    //     if (this.searchCache.size > 1000) {
    //         const oldestKey = this.searchCache.keys().next().value;
    //         if(oldestKey) {
    //             this.searchCache.delete(oldestKey);
    //         }
    //     }
    // }

    /**
     * 生成查询哈希
     */
    private generateQueryHash(searchQuery: DocumentSearchQuery): string {
        const hashData = {
            query: searchQuery.query,
            topK: searchQuery.topK,
            threshold: searchQuery.threshold,
            filters: searchQuery.filters
        };

        return Buffer.from(JSON.stringify(hashData)).toString('base64');
    }

    // /**
    //  * 清理过期缓存
    //  */
    // private cleanupExpiredCache(): void {
    //     const now = Date.now();
    //     for (const [key, item] of this.searchCache.entries()) {
    //         if (now - item.timestamp > this.kb.config.vector.cacheTTL) {
    //             this.searchCache.delete(key);
    //         }
    //     }
    // }

    // /**
    //  * 更新搜索统计信息
    //  */
    // private updateSearchStats(queryTime: number, cacheHit: boolean): void {
    //     this.searchStats.totalQueries++;
    //
    //     // 更新平均查询时间
    //     this.searchStats.avekbeQueryTime =
    //         (this.searchStats.avekbeQueryTime * (this.searchStats.totalQueries - 1) + queryTime) /
    //         this.searchStats.totalQueries;
    //
    //     // 更新缓存命中率
    //     if (cacheHit) {
    //         const totalCacheHits = Math.floor(this.searchStats.cacheHitRate * this.searchStats.totalQueries);
    //         this.searchStats.cacheHitRate = (totalCacheHits + 1) / this.searchStats.totalQueries;
    //     } else {
    //         const totalCacheHits = Math.floor(this.searchStats.cacheHitRate * (this.searchStats.totalQueries - 1));
    //         this.searchStats.cacheHitRate = totalCacheHits / this.searchStats.totalQueries;
    //     }
    // }

    // /**
    //  * 更新流行查询
    //  */
    // private updatePopularQueries(query: string): void {
    //     const existingQuery = this.searchStats.popularQueries.find(item => item.query === query);
    //
    //     if (existingQuery) {
    //         existingQuery.count++;
    //     } else {
    //         this.searchStats.popularQueries.push({query, count: 1});
    //     }
    //
    //     // 排序并限制数量
    //     this.searchStats.popularQueries.sort((a, b) => b.count - a.count);
    //     this.searchStats.popularQueries = this.searchStats.popularQueries.slice(0, 100);
    // }

    // /**
    //  * 获取基于文档的搜索建议
    //  */
    // private async getDocumentBasedSuggestions(
    //     partialQuery: string,
    //     limit: number
    // ): Promise<string[]> {
    //     try {
    //         const documents = await this.prisma.kbDocument.searchDocuments(partialQuery, limit * 2);
    //
    //         const suggestions = documents
    //             .map(doc => this.extractKeywords(doc.textPreview, partialQuery))
    //             .flat()
    //             .filter((keyword, index, array) => array.indexOf(keyword) === index) // 去重
    //             .slice(0, limit);
    //
    //         return suggestions;
    //     } catch (error) {
    //         console.error('Failed to get document-based suggestions:', error);
    //         return [];
    //     }
    // }

    /**
     * 从文本中提取关键词
     */
    private extractKeywords(text: string, partialQuery: string): string[] {
        if (!text) return [];

        const words = text
            .toLowerCase()
            .split(/\s+/)
            .filter(word =>
                word.length > 2 &&
                word.includes(partialQuery.toLowerCase()) &&
                word !== partialQuery.toLowerCase()
            );

        return words.slice(0, 3);
    }

    /**
     * 创建搜索响应
     */
    private createSearchResponse(
        results: DocumentSearchResult[],
        searchQuery: DocumentSearchQuery,
        queryTime: number
    ): DocumentSearchResponse {
        return {
            results,
            totalCount: results.length,
            queryTime,
            query: searchQuery.query,
            filters: searchQuery.filters
        };
    }

    /**
     * 创建验证错误
     */
    private createValidationError(message: string): AppError {
        return {
            type: ErrorType.VALIDATION_ERROR,
            message,
            timestamp: new Date()
        };
    }

    /**
     * 创建应用错误
     */
    private createAppError(error: unknown, defaultMessage: string): AppError {
        if (error && typeof error === 'object' && 'type' in error) {
            return error as AppError;
        }

        return {
            type: ErrorType.SEARCH_FAILED,
            message: error instanceof Error ? error.message : defaultMessage,
            timestamp: new Date(),
            details: error
        };
    }

    // /**
    //  * 获取搜索统计信息
    //  */
    // getSearchStats(): SearchStats {
    //     return {...this.searchStats};
    // }

    // /**
    //  * 清空缓存
    //  */
    // clearCache(): void {
    //     this.searchCache.clear();
    // }

    // /**
    //  * 重置统计信息
    //  */
    // resetStats(): void {
    //     this.searchStats = {
    //         totalQueries: 0,
    //         avekbeQueryTime: 0,
    //         cacheHitRate: 0,
    //         popularQueries: []
    //     };
    // }
}