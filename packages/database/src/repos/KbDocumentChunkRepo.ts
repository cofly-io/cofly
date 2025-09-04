import { Prisma, KbDocumentChunk, PrismaClient } from "../schema";
import { prisma } from "../client";
import { DocumentChunk } from "@cofly-ai/interfaces";

// Types for chunk operations
export interface CreateChunkInput {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  vectorId?: string;
  startPosition: number;
  endPosition: number;
}

export interface UpdateChunkVectorInput {
  chunkId: string;
  vectorId: string;
}

export interface ChunkStats {
  totalChunks: number;
  vectorizedChunks: number;
  avekbeChunkSize: number;
  documentsWithChunks: number;
}

function mapToDocumentChunk(data: KbDocumentChunk) : DocumentChunk {

    return {
        id: data.id,
        documentId: data.documentId,
        chunkIndex: data.chunkIndex,
        content: data.content,
        contentLength: data.content.length,
        vectorId: data.vectorId,
        startPosition: data.startPosition,
        endPosition: data.endPosition,
    } as DocumentChunk;
}

export const kbDocumentChunkRepo = Prisma.defineExtension({
    name: "ChunkRepo",
    model: {
        kbDocumentChunk: {
            // 创建文档块
            async createChunk(data: CreateChunkInput, tx?: PrismaClient): Promise<DocumentChunk> {

                const client = tx || prisma;
                const chunk = await client.kbDocumentChunk.create({
                    data: {
                        id: data.id,
                        documentId: data.documentId,
                        chunkIndex: data.chunkIndex,
                        content: data.content,
                        contentLength: data.content.length,
                        vectorId: data.vectorId,
                        startPosition: data.startPosition,
                        endPosition: data.endPosition,
                    },
                });

                return mapToDocumentChunk(chunk);
            },

            // 批量创建文档块
            async createChunks(chunks: CreateChunkInput[], tx?: PrismaClient): Promise<void> {

                if (chunks.length === 0) return;

                const client = tx || prisma;
                await client.kbDocumentChunk.createMany({
                    data: chunks.map(chunk => ({
                        id: chunk.id,
                        documentId: chunk.documentId,
                        chunkIndex: chunk.chunkIndex,
                        content: chunk.content,
                        contentLength: chunk.content.length,
                        vectorId: chunk.vectorId,
                        startPosition: chunk.startPosition,
                        endPosition: chunk.endPosition,
                    })),
                });
            },

            // 根据ID获取文档块
            async getChunkById(id: string): Promise<DocumentChunk | null> {

                const chunk = await prisma.kbDocumentChunk.findUnique({
                    where: {id},
                });

                if(!chunk) return null;

                return mapToDocumentChunk(chunk);
            },

            // 根据文档ID获取所有块
            async getChunksByDocumentId(documentId: string): Promise<DocumentChunk[]> {

                const chunks = await prisma.kbDocumentChunk.findMany({
                    where: {documentId},
                    orderBy: {chunkIndex: 'asc'},
                });

                return chunks.map(chunk => mapToDocumentChunk(chunk));
            },

            // 根据向量ID获取文档块
            async getChunkByVectorId(vectorId: string): Promise<DocumentChunk | null> {

                const chunk = await prisma.kbDocumentChunk.findFirst({
                    where: {vectorId},
                });

                if(!chunk) return null;

                return mapToDocumentChunk(chunk);
            },

            // 根据多个向量ID获取文档块
            async getChunksByVectorIds(vectorIds: string[]): Promise<DocumentChunk[]> {

                if (vectorIds.length === 0) return [];

                const chunks = await prisma.kbDocumentChunk.findMany({
                    where: {
                        vectorId: {
                            in: vectorIds,
                        },
                    },
                    orderBy: [
                        {documentId: 'asc'},
                        {chunkIndex: 'asc'},
                    ],
                });

                return chunks.map(chunk => mapToDocumentChunk(chunk));
            },

            // 更新文档块的向量ID
            async updateChunkVectorId(id: string, vectorId: string, tx?: PrismaClient): Promise<void> {

                const client = tx || prisma;
                await client.kbDocumentChunk.update({
                    where: {id},
                    data: {vectorId},
                });
            },

            // 批量更新文档块的向量ID
            async updateChunksVectorIds(updates: UpdateChunkVectorInput[], tx?: PrismaClient): Promise<void> {

                if (updates.length === 0) return;

                const client = tx || prisma;
                await client.$transaction(
                    updates.map(update =>
                        prisma.kbDocumentChunk.update({
                            where: {id: update.chunkId},
                            data: {vectorId: update.vectorId},
                        })
                    )
                );
            },

            // 删除文档的所有块
            async deleteChunksByDocumentId(documentId: string, tx?: PrismaClient): Promise<void> {

                const client = tx || prisma;
                await client.kbDocumentChunk.deleteMany({
                    where: {documentId},
                });
            },

            // 删除特定的文档块
            async deleteChunk(id: string, tx?: PrismaClient): Promise<void> {

                const client = tx || prisma;
                await client.kbDocumentChunk.deleteMany({
                    where: {id},
                });
            },

            // 获取文档的块数量
            async getChunkCountByDocumentId(documentId: string): Promise<number> {
                return await prisma.kbDocumentChunk.count({
                    where: {documentId},
                });
            },

            // 获取已向量化的块数量
            async getVectorizedChunkCount(documentId?: string): Promise<number> {
                const where: any = {
                    vectorId: {
                        not: null,
                    },
                };

                if (documentId) {
                    where.documentId = documentId;
                }

                return await prisma.kbDocumentChunk.count({where});
            },

            // 获取未向量化的块
            async getUnvectorizedChunks(limit?: number): Promise<DocumentChunk[]> {
                const chunks = await prisma.kbDocumentChunk.findMany({
                    where: {
                        vectorId: null,
                    },
                    orderBy: [
                        {documentId: 'asc'},
                        {chunkIndex: 'asc'},
                    ],
                    take: limit,
                });

                return chunks.map(chunk => mapToDocumentChunk(chunk));
            },

            // 搜索文档块内容
            async searchChunks(
                query: string,
                documentId?: string,
                limit: number = 50
            ): Promise<DocumentChunk[]> {
                const where: any = {
                    content: {
                        contains: query,
                    },
                };

                if (documentId) {
                    where.documentId = documentId;
                }

                const chunks = await prisma.kbDocumentChunk.findMany({
                    where,
                    orderBy: [
                        {documentId: 'asc'},
                        {chunkIndex: 'asc'},
                    ],
                    take: limit,
                });

                return chunks.map(chunk => mapToDocumentChunk(chunk));
            },

            // 获取块统计信息
            async getChunkStats(): Promise<ChunkStats> {
                const [totalChunks, vectorizedChunks, avgChunkSize, documentsWithChunks] = await Promise.all([
                    prisma.kbDocumentChunk.count(),
                    prisma.kbDocumentChunk.count({
                        where: {
                            vectorId: {
                                not: null,
                            },
                        },
                    }),
                    prisma.kbDocumentChunk.aggregate({
                        _avg: {
                            contentLength: true
                        },
                    }),
                    prisma.kbDocumentChunk.groupBy({
                        by: ['documentId'],
                        _count: true,
                    }),
                ]);

                return {
                    totalChunks,
                    vectorizedChunks,
                    avekbeChunkSize: Math.round(avgChunkSize._avg.contentLength || 0),
                    documentsWithChunks: documentsWithChunks.length,
                };
            },
        },
    },
});