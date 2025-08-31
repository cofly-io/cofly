import { DocumentStatus, SupportedFileType, VectorData } from '@repo/common';
import { DocumentSearchResult, ProcessedDocumentMetadata, VectorRecord, VectorService } from "../types";
import { KnowledgeBaseInstance } from "../KnowledgeBaseManager";
import { LocalIndex, IndexItem, MetadataTypes } from 'vectra';
import * as path from 'path';
import { DefaultConfig } from "@/Constants";

// 定义向量元数据接口
interface MetadataType extends Record<string, MetadataTypes> {

}

type VectorMetadata = MetadataType & VectorRecord;

/**
 * 本地向量存储服务 - 使用 Vectra
 * 基于 Vectra 本地文件系统向量数据库实现
 */
export class LocalVectorService implements VectorService {
    private index: LocalIndex<VectorMetadata> | null = null;
    private isConnected = false;
    private readonly dataDir: string;

    constructor(private kb: KnowledgeBaseInstance) {
        // 设置本地数据存储目录
        this.dataDir = path.join(process.cwd(), kb.getStoragePath());
    }

    /**
     * 获取或创建索引实例
     */
    private async getIndex(): Promise<LocalIndex<VectorMetadata>> {
        if (!this.index) {
            this.index = new LocalIndex<VectorMetadata>(this.dataDir);
        }
        return this.index;
    }

    /**
     * 检查向量服务健康状态
     */
    async checkHealth(): Promise<boolean> {
        try {
            const index = await this.getIndex();
            // 尝试获取索引统计信息来验证服务是否正常
            await index.getIndexStats();
            return true;
        } catch (error) {
            console.error('Vectra 服务不可用:', error);
            return false;
        }
    }

    /**
     * 连接到本地向量数据库
     */
    async connect(): Promise<void> {
        try {
            const index = await this.getIndex();
            
            // 检查索引是否已创建，如果没有则创建
            const isCreated = await index.isIndexCreated();
            if (!isCreated) {
                await index.createIndex({
                    version: 1,
                    metadata_config: {
                        indexed: ['document_id', 'file_type', 'upload_time']
                    }
                });
            }

            this.isConnected = true;
            console.log('Vectra 本地向量数据库连接成功');
        } catch (error) {
            this.isConnected = false;
            throw new Error(`连接 Vectra 失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 断开连接
     */
    async disconnect(): Promise<void> {
        try {
            if (this.isConnected) {
                this.index = null;
                this.isConnected = false;
                console.log('Vectra 连接已断开');
            }
        } catch (error) {
            console.error('断开 Vectra 连接时出错:', error);
        }
    }

    /**
     * 重新连接
     */
    async reconnect(): Promise<void> {
        await this.disconnect();
        await this.connect();
    }

    /**
     * 创建集合（在Vectra中相当于确保索引存在）
     */
    async createCollection(collectionName: string, dimension: number): Promise<void> {
        try {
            await this.ensureConnected();
            
            const index = await this.getIndex();
            const isCreated = await index.isIndexCreated();
            
            if (isCreated) {
                console.log(`索引已存在`);
                return;
            }

            await index.createIndex({
                version: 1,
                metadata_config: {
                    indexed: ['document_id', 'file_type', 'upload_time']
                }
            });
            
            console.log(`索引创建成功`);
        } catch (error) {
            throw new Error(`创建索引失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 创建索引（Vectra中索引在创建时已经建立）
     */
    async createIndex(collectionName: string): Promise<void> {
        try {
            await this.ensureConnected();
            // Vectra 在创建索引时已经自动建立了向量索引，无需额外操作
            console.log(`索引已就绪`);
        } catch (error) {
            throw new Error(`索引操作失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 加载集合到内存（Vectra自动管理内存）
     */
    async loadCollection(collectionName: string): Promise<void> {
        try {
            await this.ensureConnected();
            // Vectra 自动管理内存加载，无需手动操作
            console.log(`索引已加载到内存`);
        } catch (error) {
            throw new Error(`加载索引失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 插入向量数据
     */
    async insertVectors(collectionName: string, vectors: VectorData[]): Promise<String[] | Number[] | []> {
        try {
            await this.ensureConnected();

            if (vectors.length === 0) {
                return [];
            }

            const index = await this.getIndex();
            await index.beginUpdate();

            const insertedIds: string[] = [];

            try {
                for (const v of vectors) {
                    const item: Partial<IndexItem<VectorMetadata>> = {
                        id: v.id,
                        vector: v.vector,
                        metadata: {
                            document_id: v.metadata.id,
                            chunk_index: v.chunkIndex || 0,
                            file_name: v.metadata.fileName,
                            file_type: v.metadata.fileType,
                            upload_time: v.metadata.uploadTime.getTime(),
                            content_preview: v.metadata.textPreview || ''
                        }
                    };

                    const insertedItem = await index.upsertItem(item);
                    insertedIds.push(insertedItem.id);
                }

                await index.endUpdate();
                console.log(`成功插入 ${vectors.length} 个向量到索引`);
                return insertedIds;
            } catch (error) {
                await index.cancelUpdate();
                throw error;
            }
        } catch (error) {
            throw new Error(`插入向量失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 搜索相似向量
     */
    async searchSimilar(
        collectionName: string,
        queryVector: number[],
        topK: number = 10,
        filter?: string
    ): Promise<DocumentSearchResult[]> {
        try {
            await this.ensureConnected();

            const index = await this.getIndex();
            
            // 构建元数据过滤器
            let metadataFilter;
            if (filter) {
                // 简单的过滤器解析，支持基本的等式过滤
                // 例如: "document_id == 'doc123'" 或 "file_type == 'pdf'"
                const filterMatch = filter.match(/(\w+)\s*==\s*['"]([^'"]+)['"]/);
                if (filterMatch) {
                    const [, key, value] = filterMatch;
                    if(key) metadataFilter = { [key]: { '$eq': value } };
                }
            }

            // 执行向量搜索
            const results = await index.queryItems(queryVector, '', topK, metadataFilter);

            // 转换搜索结果
            const searchResults: DocumentSearchResult[] = results.map(result => {
                const metadata: ProcessedDocumentMetadata = {
                    id: result.item.metadata.document_id,
                    fileName: result.item.metadata.file_name,
                    originalName: result.item.metadata.file_name,
                    fileType: result.item.metadata.file_type as SupportedFileType,
                    fileSize: 0,
                    uploadTime: new Date(result.item.metadata.upload_time),
                    status: DocumentStatus.COMPLETED,
                    chunkCount: 0,
                    filePath: '',
                    textPreview: result.item.metadata.content_preview,
                };

                return {
                    id: result.item.id,
                    score: result.score,
                    chunkIndex: result.item.metadata.chunk_index,
                    metadata,
                };
            });

            console.log(`在索引中找到 ${searchResults.length} 个相似结果`);
            return searchResults;
        } catch (error) {
            throw new Error(`搜索相似向量失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 删除向量
     */
    async deleteVector(collectionName: string, id: string): Promise<void> {
        try {
            await this.ensureConnected();

            const index = await this.getIndex();
            await index.deleteItem(id);
            console.log(`成功删除向量 ${id} 从索引`);
        } catch (error) {
            throw new Error(`删除向量失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 删除文档的所有向量
     */
    async deleteDocumentVectors(collectionName: string, documentId: string): Promise<void> {
        try {
            await this.ensureConnected();

            const index = await this.getIndex();
            
            // 查找所有属于该文档的向量
            const items = await index.listItemsByMetadata({ document_id: { '$eq': documentId } });
            
            if (items.length > 0) {
                await index.beginUpdate();
                try {
                    for (const item of items) {
                        await index.deleteItem(item.id);
                    }
                    await index.endUpdate();
                    console.log(`成功删除文档 ${documentId} 的 ${items.length} 个向量从索引`);
                } catch (error) {
                    await index.cancelUpdate();
                    throw error;
                }
            } else {
                console.log(`文档 ${documentId} 没有找到相关向量`);
            }
        } catch (error) {
            throw new Error(`删除文档向量失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 获取集合统计信息
     */
    async getCollectionStats(collectionName: string): Promise<{ entityCount: number }> {
        try {
            await this.ensureConnected();

            const index = await this.getIndex();
            const stats = await index.getIndexStats();

            return { entityCount: stats.items };
        } catch (error) {
            throw new Error(`获取索引统计失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 删除集合
     */
    async dropCollection(collectionName: string): Promise<void> {
        try {
            await this.ensureConnected();

            const index = await this.getIndex();
            const isCreated = await index.isIndexCreated();
            
            if (!isCreated) {
                console.log(`索引不存在`);
                return;
            }

            await index.deleteIndex();
            this.index = null; // 重置索引实例
            console.log(`索引删除成功`);
        } catch (error) {
            throw new Error(`删除索引失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 确保连接可用
     */
    private async ensureConnected(): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }
    }
}