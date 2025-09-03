import { Prisma, KbDocument } from "../schema";
import { prisma } from "../client";
import { DocumentMetadata, DocumentSortDirection, DocumentStatus, SupportedFileType } from "@cofly-ai/interfaces";

// Types for document operations
export interface CreateDocumentInput {
    id: string;
    kbId: string;
    fileName: string;
    originalName: string;
    fileType: SupportedFileType;
    fileSize: number;
    status: DocumentStatus;
    chunkCount: number;
    filePath: string;
    textPreview: string;
    mimeType?: string;
    checksum?: string;
}

export interface GetDocumentsOptions {
    limit?: number;
    offset?: number;
    status?: DocumentStatus;
    fileType?: SupportedFileType;
    sortBy?: DocumentSortDirection;
    sortOrder?: 'asc' | 'desc';
}

export interface DocumentsResult {
    documents: DocumentMetadata[];
    total: number;
}

export const kbDocumentRepo = Prisma.defineExtension({
    name: "DocumentMetadataRepo",
    model: {
        kbDocument: {
            // 创建新文档记录
            async createDocument(
                document: Omit<CreateDocumentInput, 'uploadTime' | 'processedTime'>
            ): Promise<DocumentMetadata> {
                const now = new Date();

                const createdDoc = await prisma.kbDocument.create({
                    data: {
                        id: document.id,
                        kbId: document.kbId,
                        fileName: document.fileName,
                        originalName: document.originalName,
                        fileType: document.fileType,
                        fileSize: document.fileSize,
                        uploadTime: now,
                        processedTime: null,
                        status: document.status,
                        chunkCount: document.chunkCount,
                        filePath: document.filePath,
                        textPreview: document.textPreview,
                        mimeType: document.mimeType,
                        checksum: document.checksum,
                    },
                });

                return this.mapToDocumentMetadata(createdDoc);
            },

            // 根据ID获取文档
            async getDocumentById(id: string, kbId?: string): Promise<DocumentMetadata | null> {

                const where: any = { id };
                if(kbId) {
                    where.kbId = kbId;
                }

                const document = await prisma.kbDocument.findUnique({
                    where: where,
                });

                if (!document) {
                    return null;
                }

                return this.mapToDocumentMetadata(document);
            },

            // 获取所有文档（支持分页和过滤）
            async getDocuments(kbId: string, options: GetDocumentsOptions = {}): Promise<DocumentsResult> {
                const {
                    limit = 50,
                    offset = 0,
                    status,
                    fileType,
                    sortBy = 'uploadTime',
                    sortOrder = 'desc',
                } = options;

                // 构建查询条件
                const where: any = {};

                if(kbId) {
                    where.kbId = kbId;
                }

                if (status) {
                    where.status = status;
                }

                if (fileType) {
                    where.fileType = fileType;
                }

                // 构建排序条件
                const orderBy: any = {};
                orderBy[sortBy] = sortOrder;

                // 获取总数和文档列表
                const [total, documents] = await Promise.all([
                    prisma.kbDocument.count({where}),
                    prisma.kbDocument.findMany({
                        where,
                        orderBy,
                        take: limit,
                        skip: offset,
                    }),
                ]);

                return {
                    documents: documents.map((doc: KbDocument) => this.mapToDocumentMetadata(doc)),
                    total,
                };
            },

            // 更新文档状态
            async updateDocumentStatus(
                id: string,
                status: string,
                processedTime?: Date
            ): Promise<void> {
                const updateData: any = {
                    status,
                    updatedAt: new Date(),
                };

                if (processedTime) {
                    updateData.processedTime = processedTime;
                }

                await prisma.kbDocument.update({
                    where: {id},
                    data: updateData,
                });
            },

            // 更新文档块数量
            async updateDocumentChunkCount(id: string, chunkCount: number): Promise<void> {
                await prisma.kbDocument.update({
                    where: {id},
                    data: {
                        chunkCount,
                        updatedAt: new Date(),
                    },
                });
            },

            // 更新文档文本预览
            async updateDocumentTextPreview(id: string, textPreview: string): Promise<void> {
                await prisma.kbDocument.update({
                    where: {id},
                    data: {
                        textPreview,
                        updatedAt: new Date(),
                    },
                });
            },

            // 删除文档
            async deleteDocument(id: string): Promise<void> {
                await prisma.kbDocument.delete({
                    where: {id},
                });
            },

            // 批量删除文档
            async deleteDocuments(ids: string[]): Promise<void> {
                if (ids.length === 0) return;

                await prisma.kbDocument.deleteMany({
                    where: {
                        id: {
                            in: ids,
                        },
                    },
                });
            },

            // 根据状态获取文档数量统计
            async getDocumentStats(kbId: string): Promise<Record<DocumentStatus, number>> {
                const stats = await prisma.kbDocument.groupBy({
                    where: {
                        kbId
                    },
                    by: ['status'],
                    _count: {
                        status: true,
                    },
                });

                const result: Record<DocumentStatus, number> = {
                    [DocumentStatus.UPLOADING]: 0,
                    [DocumentStatus.PROCESSING]: 0,
                    [DocumentStatus.COMPLETED]: 0,
                    [DocumentStatus.FAILED]: 0,
                };

                stats.forEach((stat: any) => {
                    result[stat.status as DocumentStatus] = stat._count.status;
                });

                return result;
            },

            // 搜索文档（基于文件名和文本预览）
            async searchDocuments(query: string, limit: number = 20): Promise<DocumentMetadata[]> {
                const documents = await prisma.kbDocument.findMany({
                    where: {
                        AND: [
                            {
                                OR: [
                                    {fileName: {contains: query}},
                                    {originalName: {contains: query}},
                                    {textPreview: {contains: query}},
                                ],
                            },
                            {status: DocumentStatus.COMPLETED},
                        ],
                    },
                    orderBy: {uploadTime: 'desc'},
                    take: limit,
                });

                return documents.map((doc: KbDocument) => this.mapToDocumentMetadata(doc));
            },

            mapToDocumentMetadata(document: KbDocument): DocumentMetadata {

                return {
                    id: document.id,
                    kbId: document.kbId,
                    fileName: document.fileName,
                    originalName: document.originalName,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    uploadTime: document.uploadTime,
                    processedTime: document.processedTime,
                    status: document.status,
                    chunkCount: document.chunkCount,
                    filePath: document.filePath,
                    textPreview: document.textPreview,
                    mimeType: document.mimeType,
                    checksum: document.checksum,
                } as DocumentMetadata;
            }
        },
    },
});