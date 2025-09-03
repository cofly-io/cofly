import { Prisma } from "../schema";
import { prisma } from "../client";
import { DocumentProcessingStatus, DocumentStatus, ErrorType, AppError } from "@cofly-ai/interfaces";

// Types for processing status operations
export interface CreateProcessingStatusInput {
  documentId: string;
  status: DocumentStatus;
  progress: number;
  currentStep: string;
  error?: AppError;
  startTime: bigint;
}

export interface UpdateProcessingStatusInput {
  status?: DocumentStatus;
  progress?: number;
  currentStep?: string;
  error?: AppError;
  endTime?: bigint;
}

export interface ProcessingStatusStats {
  active: number;
  completed: number;
  failed: number;
  averageProcessingTime: bigint;
  totalProcessed: number;
}

export interface BatchProgressUpdate {
  documentId: string;
  progress: number;
  currentStep?: string;
}

export const kbProcessingStatusRepo = Prisma.defineExtension({
    name: "ProcessingStatusRepo",
    model: {
        kbProcessingStatus: {
            // 创建处理状态记录
            async createProcessingStatus(
                status: Omit<CreateProcessingStatusInput, 'endTime'>
            ): Promise<DocumentProcessingStatus> {
                const createdStatus = await prisma.kbProcessingStatus.create({
                    data: {
                        documentId: status.documentId,
                        status: status.status,
                        progress: status.progress,
                        currentStep: status.currentStep,
                        errorMessage: status.error?.message,
                        errorType: status.error?.type,
                        startTime: status.startTime,
                    },
                });

                return this.mapToProcessingStatus(createdStatus);
            },

            // 更新处理状态
            async updateProcessingStatus(
                documentId: string,
                updates: UpdateProcessingStatusInput
            ): Promise<void> {
                const updateData: any = {
                    updatedAt: new Date(),
                };

                if (updates.status !== undefined) {
                    updateData.status = updates.status;
                }

                if (updates.progress !== undefined) {
                    updateData.progress = updates.progress;
                }

                if (updates.currentStep !== undefined) {
                    updateData.currentStep = updates.currentStep;
                }

                if (updates.error !== undefined) {
                    updateData.errorMessage = updates.error.message;
                    updateData.errorType = updates.error.type;
                }

                if (updates.endTime !== undefined) {
                    updateData.endTime = updates.endTime;
                }

                await prisma.kbProcessingStatus.updateMany({
                    where: {
                        documentId,
                        endTime: null,
                    },
                    data: updateData,
                });
            },

            // 完成处理状态（设置结束时间）
            async completeProcessingStatus(
                documentId: string,
                finalStatus: DocumentStatus,
                error?: AppError
            ): Promise<void> {
                const endTime = new Date();

                const updateData: any = {
                    status: finalStatus,
                    endTime: endTime.getTime(),
                    updatedAt: new Date(),
                };

                if (finalStatus === DocumentStatus.COMPLETED) {
                    updateData.progress = 100;
                }

                if (error) {
                    updateData.errorMessage = error.message;
                    updateData.errorType = error.type;
                }

                await prisma.kbProcessingStatus.updateMany({
                    where: {
                        documentId,
                        endTime: null,
                    },
                    data: updateData,
                });
            },

            // 获取文档的当前处理状态
            async getCurrentProcessingStatus(documentId: string, kbId?: string): Promise<DocumentProcessingStatus | null> {

                const where : any = {
                    documentId,
                    endTime: null
                };

                if(kbId) {
                    where.kind = kbId;
                }

                const status = await prisma.kbProcessingStatus.findFirst({
                    where,
                    orderBy: { id: 'desc' },
                });

                return status ? this.mapToProcessingStatus(status) : null;
            },

            // 获取文档的所有处理状态历史
            async getProcessingStatusHistory(documentId: string): Promise<DocumentProcessingStatus[]> {
                const statuses = await prisma.kbProcessingStatus.findMany({
                    where: { documentId },
                    orderBy: { id: 'desc' },
                });

                return statuses.map(status => this.mapToProcessingStatus(status));
            },

            // 获取所有正在处理的文档状态
            async getActiveProcessingStatuses(kbId: string): Promise<DocumentProcessingStatus[]> {
                const statuses = await prisma.kbProcessingStatus.findMany({
                    where: {
                        endTime: null,
                        status: {
                            in: [DocumentStatus.UPLOADING, DocumentStatus.PROCESSING],
                        },
                    },
                    orderBy: {startTime: 'asc'},
                });

                return statuses.map(status => this.mapToProcessingStatus(status));
            },

            // 获取失败的处理状态
            async getFailedProcessingStatuses(kbId: string, limit?: number): Promise<DocumentProcessingStatus[]> {
                const statuses = await prisma.kbProcessingStatus.findMany({
                    where: {
                        status: DocumentStatus.FAILED,
                    },
                    orderBy: {startTime: 'desc'},
                    take: limit,
                });

                return statuses.map(status => this.mapToProcessingStatus(status));
            },

            // 获取处理状态统计
            async getProcessingStatusStats(kbId: string): Promise<ProcessingStatusStats> {
                const [activeCount, completedCount, failedCount, totalCount, avgProcessingTime] = await Promise.all([
                    // 活跃状态数量
                    prisma.kbProcessingStatus.count({
                        where: {
                            endTime: null,
                            status: {
                                in: [DocumentStatus.UPLOADING, DocumentStatus.PROCESSING],
                            },
                        },
                    }),
                    // 完成状态数量
                    prisma.kbProcessingStatus.count({
                        where: {status: DocumentStatus.COMPLETED},
                    }),
                    // 失败状态数量
                    prisma.kbProcessingStatus.count({
                        where: {status: DocumentStatus.FAILED},
                    }),
                    // 总处理数量
                    prisma.kbProcessingStatus.count(),
                    // 平均处理时间（只计算已完成的）
                    prisma.kbProcessingStatus.aggregate({
                        where: {
                            endTime: {not: null},
                            status: DocumentStatus.COMPLETED,
                        },
                        _avg: {
                            endTime: true,
                            startTime: true,
                        },
                    }),
                ]);

                // 计算平均处理时间（毫秒转秒）
                const avgTime = avgProcessingTime._avg.endTime && avgProcessingTime._avg.startTime
                    ? (avgProcessingTime._avg.endTime - avgProcessingTime._avg.startTime) / 1000n
                    : 0n;

                return {
                    active: activeCount,
                    completed: completedCount,
                    failed: failedCount,
                    totalProcessed: totalCount,
                    averageProcessingTime: avgTime,
                };
            },

            // 清理旧的处理状态记录
            async cleanupOldProcessingStatuses(olderThanDays: number = 30): Promise<number> {
                const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

                const result = await prisma.kbProcessingStatus.deleteMany({
                    where: {
                        endTime: {
                            not: null,
                            lt: cutoffTime,
                        },
                    },
                });

                return result.count;
            },

            // 获取长时间运行的处理任务
            async getLongRunningProcesses(thresholdMinutes: number = 30): Promise<DocumentProcessingStatus[]> {
                const thresholdTime = Date.now() - (thresholdMinutes * 60 * 1000);

                const statuses = await prisma.kbProcessingStatus.findMany({
                    where: {
                        endTime: null,
                        startTime: {lt: thresholdTime},
                        status: {
                            in: [DocumentStatus.UPLOADING, DocumentStatus.PROCESSING],
                        },
                    },
                    orderBy: {startTime: 'asc'},
                });

                return statuses.map(status => this.mapToProcessingStatus(status));
            },

            // 重置处理状态（用于重新处理失败的文档）
            async resetProcessingStatus(documentId: string): Promise<void> {
                // 结束当前的处理状态
                await prisma.kbProcessingStatus.updateMany({
                    where: {
                        documentId,
                        endTime: null,
                    },
                    data: {
                        endTime: Date.now(),
                        updatedAt: new Date(),
                    },
                });

                // 创建新的处理状态
                const newStatus: Omit<CreateProcessingStatusInput, 'endTime'> = {
                    documentId,
                    status: DocumentStatus.UPLOADING,
                    progress: 0,
                    currentStep: 'Initializing reprocessing',
                    startTime: BigInt(Date.now()),
                };

                await this.createProcessingStatus(newStatus);
            },

            // 批量更新处理进度
            async batchUpdateProgress(updates: BatchProgressUpdate[]): Promise<void> {
                if (updates.length === 0) return;

                await prisma.$transaction(
                    updates.map(update => {
                        const updateData: any = {
                            progress: update.progress,
                            updatedAt: new Date(),
                        };

                        if (update.currentStep) {
                            updateData.currentStep = update.currentStep;
                        }

                        return prisma.kbProcessingStatus.updateMany({
                            where: {
                                documentId: update.documentId,
                                endTime: null,
                            },
                            data: updateData,
                        });
                    })
                );
            },

            // 删除文档的所有处理状态记录
            async deleteProcessingStatusesByDocumentId(documentId: string): Promise<void> {
                await prisma.kbProcessingStatus.deleteMany({
                    where: {documentId},
                });
            },

            // 将 Prisma 模型映射为 ProcessingStatus 接口
            mapToProcessingStatus(status: any): DocumentProcessingStatus {
                const error = status.errorMessage ? {
                    type: status.errorType as ErrorType,
                    message: status.errorMessage,
                    timestamp: new Date(status.startTime),
                } : undefined;

                return {
                    documentId: status.documentId,
                    status: status.status as DocumentStatus,
                    progress: status.progress,
                    currentStep: status.currentStep,
                    error,
                    startTime: status.startTime,
                    endTime: status.endTime || undefined,
                };
            },
        },
    },
});