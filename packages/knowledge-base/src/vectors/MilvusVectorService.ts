import { DataType, MetricType, MilvusClient, NumberArrayId, StringArrayId } from '@zilliz/milvus2-sdk-node';
import { DocumentStatus, VectorData } from '@repo/common';
import { DocumentSearchResult, ProcessedDocumentMetadata, VectorRecord, VectorService } from "../types";
import { KnowledgeBaseInstance } from "../KnowledgeBaseManager";

/**
 * Milvus 服务类
 * 提供 Milvus 数据库的连接管理、集合操作和向量操作功能
 */
export class MilvusVectorService implements VectorService {
    private client: MilvusClient | null = null;
    private isConnected = false;
    private connectionPromise: Promise<void> | null = null;

    constructor(private kb: KnowledgeBaseInstance) {
    }

    /**
     * 建立 Milvus 连接
     */
    async connect(): Promise<void> {
        if (this.isConnected && this.client) {
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
            this.client = new MilvusClient({
                address: `${this.kb.config.vector.host}:${this.kb.config.vector.port}`,
                username: this.kb.config.vector.username,
                password: this.kb.config.vector.password,
            });

            // 测试连接
            await this.client.checkHealth();
            this.isConnected = true;
            console.log('Milvus 连接成功');
        } catch (error) {
            this.isConnected = false;
            this.client = null;
            this.connectionPromise = null;
            throw new Error(`Milvus 连接失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 带重试机制的操作执行器
     */
    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= this.kb.config.vector.maxRetries; attempt++) {
            try {
                // 确保连接可用
                await this.ensureConnection();
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt === this.kb.config.vector.maxRetries) {
                    break;
                }

                // 连接错误时重置连接状态
                if (this.isConnectionError(error)) {
                    this.isConnected = false;
                    this.connectionPromise = null;
                }

                const delay = this.kb.config.vector.retryDelay * Math.pow(this.kb.config.vector.backoffMultiplier, attempt);
                console.warn(`${operationName} 失败，${delay}ms 后重试 (${attempt + 1}/${this.kb.config.vector.maxRetries}):`, lastError.message);

                await this.sleep(delay);
            }
        }

        throw new Error(`${operationName} 在 ${this.kb.config.vector.maxRetries} 次重试后仍然失败: ${lastError!.message}`);
    }

    /**
     * 判断是否为连接错误
     */
    private isConnectionError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('connection') ||
            errorMessage.includes('network') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('refused');
    }

    /**
     * 确保连接可用
     */
    private async ensureConnection(): Promise<void> {
        if (!this.isConnected || !this.client) {
            await this.connect();
        }
    }

    /**
     * 休眠工具方法
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取客户端实例
     */
    public async getClient(): Promise<MilvusClient> {
        return this.executeWithRetry(async () => {
            await this.ensureConnection();
            if (!this.client) {
                throw new Error('Milvus 客户端未初始化');
            }
            return this.client;
        }, '获取客户端');
    }

    /**
     * 检查连接状态
     */
    public async checkHealth(): Promise<boolean> {
        try {
            const client = await this.getClient();
            await client.checkHealth();
            return true;
        } catch (error) {
            console.error('Milvus 健康检查失败:', error);
            return false;
        }
    }

    /**
     * 断开连接
     */
    public async disconnect(): Promise<void> {
        if (this.client) {
            try {
                // Milvus SDK 通常不需要显式关闭连接
                this.client = null;
                this.isConnected = false;
                this.connectionPromise = null;
                console.log('Milvus 连接已断开');
            } catch (error) {
                console.error('断开 Milvus 连接时出错:', error);
            }
        }
    }

    /**
     * 重置连接
     */
    public async reconnect(): Promise<void> {
        await this.disconnect();
        await this.connect();
    }

    /**
     * 创建集合
     */
    public async createCollection(collectionName: string, dimension: number): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            // 检查集合是否已存在
            const hasCollection = await client.hasCollection({ collection_name: collectionName });
            if (hasCollection.value) {
                console.log(`集合 ${collectionName} 已存在`);
                return;
            }

            // 定义集合 schema
            const schema = {
                collection_name: collectionName,
                description: '知识库文档向量集合',
                fields: [
                    {
                        name: 'id',
                        description: '主键ID',
                        data_type: DataType.VarChar,
                        max_length: 100,
                        is_primary_key: true,
                    },
                    {
                        name: 'vector',
                        description: '文档向量',
                        data_type: DataType.FloatVector,
                        dim: dimension,
                    },
                    {
                        name: 'documentId',
                        description: '文档ID',
                        data_type: DataType.VarChar,
                        max_length: 100,
                    },
                    {
                        name: 'chunkIndex',
                        description: '文档块索引',
                        data_type: DataType.Int64,
                    },
                    {
                        name: 'fileName',
                        description: '文件名',
                        data_type: DataType.VarChar,
                        max_length: 255,
                    },
                    {
                        name: 'fileType',
                        description: '文件类型',
                        data_type: DataType.VarChar,
                        max_length: 50,
                    },
                    {
                        name: 'uploadTime',
                        description: '上传时间戳',
                        data_type: DataType.Int64,
                    },
                    {
                        name: 'contentPreview',
                        description: '内容预览',
                        data_type: DataType.VarChar,
                        max_length: 1000,
                    },
                ],
            };

            // 创建集合
            await client.createCollection(schema);
            console.log(`集合 ${collectionName} 创建成功`);
        }, '创建集合');
    }

    /**
     * 创建索引
     */
    public async createIndex(collectionName: string): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            // 检查索引是否已存在
            const indexInfo = await client.describeIndex({
                collection_name: collectionName,
                field_name: 'vector',
            });

            if (indexInfo.status.error_code === 'Success') {
                console.log(`集合 ${collectionName} 的索引已存在`);
                return;
            }

            // 创建向量索引
            const indexParams = {
                collection_name: collectionName,
                field_name: 'vector',
                index_name: 'vector_index',
                index_type: 'IVF_FLAT',
                metric_type: MetricType.COSINE,
                params: { nlist: 1024 },
            };

            await client.createIndex(indexParams);
            console.log(`集合 ${collectionName} 的索引创建成功`);
        }, '创建索引');
    }

    /**
     * 加载集合到内存
     */
    public async loadCollection(collectionName: string): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            // 检查集合是否已加载
            const loadState = await client.getLoadState({ collection_name: collectionName });
            if (loadState.state === 'LoadStateLoaded') {
                console.log(`集合 ${collectionName} 已加载到内存`);
                return;
            }

            // 加载集合
            await client.loadCollection({ collection_name: collectionName });
            console.log(`集合 ${collectionName} 加载到内存成功`);
        }, '加载集合');
    }

    /**
     * 插入向量数据
     */
    public async insertVectors(collectionName: string, vectors: VectorData[]): Promise<String[] | Number[] | []> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            if (vectors.length === 0) {
                return [];
            }

            // 准备插入数据
            const insertData = {
                collection_name: collectionName,
                data: vectors.map(v => {
                    return {
                        "id": v.id,
                        "vector": v.vector,
                        "documentId": v.metadata.id,
                        "chunkIndex": v.chunkIndex || 0,
                        "fileName": v.metadata.fileName,
                        "fileType": v.metadata.fileType,
                        'uploadTime': v.metadata.uploadTime.getTime(),
                        "contentPreview": v.metadata.textPreview || ''
                    }
                })
            };

            const result = await client.insert(insertData);

            if (result.status.error_code !== 'Success') {
                throw new Error(`插入向量失败: ${result.status.reason}`);
            }

            function isStringArrayID(ids: any): ids is { str_id: { data: string[] } } {
                return ids && typeof ids === 'object' && 'str_id' in ids;
            }

            function isNumberArrayID(ids: any): ids is { int_id: { data: number[] } } {
                return ids && typeof ids === 'object' && 'int_id' in ids;
            }

            console.log(`成功插入 ${vectors.length} 个向量到集合 ${collectionName}`);
            if (isStringArrayID(result.IDs)) {
                return (result.IDs as StringArrayId).str_id.data;
            }

            if (isNumberArrayID(result.IDs)) {
                return (result.IDs as NumberArrayId).int_id.data;;
            }
            return [];
        }, '插入向量');
    }

    /**
     * 搜索相似向量
     */
    public async searchSimilar(
        collectionName: string,
        queryVector: number[],
        topK: number = 10,
        filter?: string
    ): Promise<DocumentSearchResult[]> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            const searchParams = {
                collection_name: collectionName,
                vector: queryVector,
                filter: filter,
                limit: topK,
                offset: 0,
                metric_type: MetricType.COSINE,
                params: { nprobe: 10 },
                output_fields: [
                    "id",
                    'documentId',
                    'chunkIndex',
                    'fileName',
                    'fileType',
                    'uploadTime',
                    'contentPreview',
                ],
            };

            const result = await client.search(searchParams);

            if (!result || result.status.error_code !== 'Success') {
                throw new Error(`搜索失败: ${result.status.reason}`);
            }

            // 转换搜索结果
            const searchResults: DocumentSearchResult[] = [];
            if (result.results && result.results.length > 0) {
                for(const document of result.results) {
                    const metadata: ProcessedDocumentMetadata = {
                        id: document.documentId || '',
                        fileName: document.fileName || '',
                        originalName: document.fileName || '',
                        fileType: document.fileType || '',
                        fileSize: 0, // 这里需要从其他地方获取
                        uploadTime: new Date(document.uploadTime || 0),
                        status: DocumentStatus.COMPLETED,
                        chunkCount: 0, // 这里需要从其他地方获取
                        filePath: '',
                        textPreview: document.contentPreview || '',
                    };

                    searchResults.push({
                        id: document.id,
                        score: document.score,
                        chunkIndex: document.chunkIndex || 0,
                        metadata,
                    });
                }
            }

            console.log(`在集合 ${collectionName} 中找到 ${searchResults.length} 个相似结果`);
            return searchResults;
        }, '搜索相似向量');
    }

    /**
     * 删除向量
     */
    public async deleteVector(collectionName: string, id: string): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            const deleteParams = {
                collection_name: collectionName,
                filter: `id == "${id}"`,
            };

            const result = await client.delete(deleteParams);

            if (result.status.error_code !== 'Success') {
                throw new Error(`删除向量失败: ${result.status.reason}`);
            }

            console.log(`成功删除向量 ${id} 从集合 ${collectionName}`);
        }, '删除向量');
    }

    /**
     * 删除文档的所有向量
     */
    public async deleteDocumentVectors(collectionName: string, documentId: string): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            const deleteParams = {
                collection_name: collectionName,
                filter: `document_id == "${documentId}"`,
            };

            const result = await client.delete(deleteParams);

            if (result.status.error_code !== 'Success') {
                throw new Error(`删除文档向量失败: ${result.status.reason}`);
            }

            console.log(`成功删除文档 ${documentId} 的所有向量从集合 ${collectionName}`);
        }, '删除文档向量');
    }

    /**
     * 获取集合统计信息
     */
    public async getCollectionStats(collectionName: string): Promise<{ entityCount: number }> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            const stats = await client.getCollectionStatistics({ collection_name: collectionName });

            if (stats.status.error_code !== 'Success') {
                throw new Error(`获取集合统计失败: ${stats.status.reason}`);
            }

            const entityCount = parseInt(stats.stats.find(s => s.key === 'row_count')?.value.toString() || '0');

            return { entityCount };
        }, '获取集合统计');
    }

    /**
     * 删除集合
     */
    public async dropCollection(collectionName: string): Promise<void> {
        return this.executeWithRetry(async () => {
            const client = await this.getClient();

            const hasCollection = await client.hasCollection({ collection_name: collectionName });
            if (!hasCollection.value) {
                console.log(`集合 ${collectionName} 不存在`);
                return;
            }

            await client.dropCollection({ collection_name: collectionName });
            console.log(`集合 ${collectionName} 删除成功`);
        }, '删除集合');
    }
}