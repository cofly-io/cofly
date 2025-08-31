import { DocumentStatus, DocumentProcessingStatus, AppError, ErrorType } from '@repo/common';
import { prisma } from "@repo/database";

// 文档状态管理器 - 提供高级的文档状态管理功能
export class DocumentStatusManager {
    private prisma = prisma;

    // 开始文档处理
    async startDocumentProcessing(documentId: string, initialStep: string = 'Starting document processing'): Promise<void> {
        // 更新文档状态为处理中
        await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.PROCESSING);

        // 创建处理状态记录
        const processingStatus: Omit<DocumentProcessingStatus, 'endTime'> = {
            documentId,
            status: DocumentStatus.PROCESSING,
            progress: 0,
            currentStep: initialStep,
            startTime: new Date()
        };

        await this.prisma.kbProcessingStatus.createProcessingStatus(processingStatus);
    }

    // 更新处理进度
    async updateProcessingProgress(
        documentId: string,
        progress: number,
        currentStep?: string
    ): Promise<void> {
        // 验证进度值
        if (progress < 0 || progress > 100) {
            throw new Error('Progress must be between 0 and 100');
        }

        await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
            progress,
            currentStep
        });
    }

    // 完成文档处理
    async completeDocumentProcessing(documentId: string): Promise<void> {
        // 更新文档状态为已完成
        await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.COMPLETED, new Date());

        // 完成处理状态
        await this.prisma.kbProcessingStatus.completeProcessingStatus(documentId, DocumentStatus.COMPLETED);
    }

    // 标记文档处理失败
    async failDocumentProcessing(
        documentId: string,
        error: AppError | string,
        currentStep?: string
    ): Promise<void> {
        const appError: AppError = typeof error === 'string'
            ? {
                type: ErrorType.PROCESSING_ERROR,
                message: error,
                timestamp: new Date()
            }
            : error;

        // 更新文档状态为失败
        await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
            status: DocumentStatus.FAILED
        });

        // 完成处理状态并记录错误
        await this.prisma.kbProcessingStatus.completeProcessingStatus(documentId, DocumentStatus.FAILED, appError);

        // 如果提供了当前步骤，也要更新
        if (currentStep) {
            await this.prisma.kbProcessingStatus.updateProcessingStatus(documentId, {
                currentStep,
                error: appError
            });
        }
    }

    // 获取文档的完整状态信息
    async getDocumentStatusInfo(documentId: string): Promise<{
        document: any;
        currentProcessing: DocumentProcessingStatus | null;
        processingHistory: DocumentProcessingStatus[];
    } | null> {
        const document = await this.prisma.kbDocument.getDocumentById(documentId);
        if (!document) {
            return null;
        }

        const currentProcessing = await this.prisma.kbProcessingStatus.getCurrentProcessingStatus(documentId);
        const processingHistory = await this.prisma.kbProcessingStatus.getProcessingStatusHistory(documentId);

        return {
            document,
            currentProcessing,
            processingHistory
        };
    }

    // 重新处理文档
    async reprocessDocument(documentId: string): Promise<void> {
        // 检查文档是否存在
        const document = await this.prisma.kbDocument.getDocumentById(documentId);
        if (!document) {
            throw new Error(`Document with ID ${documentId} not found`);
        }

        // 重置处理状态
        await this.prisma.kbProcessingStatus.resetProcessingStatus(documentId);

        // 更新文档状态
        await this.prisma.kbDocument.updateDocumentStatus(documentId, DocumentStatus.UPLOADING);

        // 重置块数量和文本预览
        await this.prisma.kbDocument.updateDocumentChunkCount(documentId, 0);
        await this.prisma.kbDocument.updateDocumentTextPreview(documentId, '');
    }

    // 批量更新多个文档的处理进度
    async batchUpdateProgress(updates: {
        documentId: string;
        progress: number;
        currentStep?: string
    }[]): Promise<void> {
        await this.prisma.kbProcessingStatus.batchUpdateProgress(updates);
    }

    // 获取处理队列状态
    async getProcessingQueueStatus(kbId: string): Promise<{
        activeProcesses: DocumentProcessingStatus[];
        queueLength: number;
        avekbeProcessingTime: number;
        failedProcesses: DocumentProcessingStatus[];
    }> {
        const activeProcesses = await this.prisma.kbProcessingStatus.getActiveProcessingStatuses(kbId);
        const stats = await this.prisma.kbProcessingStatus.getProcessingStatusStats(kbId);
        const failedProcesses = await this.prisma.kbProcessingStatus.getFailedProcessingStatuses(kbId, 10);

        return {
            activeProcesses,
            queueLength: activeProcesses.length,
            avekbeProcessingTime: stats.avekbeProcessingTime,
            failedProcesses
        };
    }

    // 检测并处理超时的处理任务
    async handleTimeoutProcesses(timeoutMinutes: number = 30): Promise<{
        timeoutProcesses: DocumentProcessingStatus[];
        handledCount: number;
    }> {
        const timeoutProcesses = await this.prisma.kbProcessingStatus.getLongRunningProcesses(timeoutMinutes);
        let handledCount = 0;

        for (const process of timeoutProcesses) {
            try {
                const timeoutError: AppError = {
                    type: ErrorType.PROCESSING_ERROR,
                    message: `Processing timeout after ${timeoutMinutes} minutes`,
                    timestamp: new Date(),
                    details: {timeoutMinutes, currentStep: process.currentStep}
                };

                await this.failDocumentProcessing(
                    process.documentId,
                    timeoutError,
                    'Processing timeout'
                );

                handledCount++;
            } catch (error) {
                console.error(`Failed to handle timeout for document ${process.documentId}:`, error);
            }
        }

        return {
            timeoutProcesses,
            handledCount
        };
    }

    // 获取系统处理统计
    async getSystemProcessingStats(kbId: string): Promise<{
        documentStats: Record<DocumentStatus, number>;
        processingStats: {
            active: number;
            completed: number;
            failed: number;
            avekbeProcessingTime: number;
            totalProcessed: number;
        };
    }> {
        const documentStats = await this.prisma.kbDocument.getDocumentStats(kbId);
        const processingStats = await this.prisma.kbProcessingStatus.getProcessingStatusStats(kbId);

        return {
            documentStats,
            processingStats
        };
    }

    // 清理旧的处理记录
    async cleanupOldRecords(olderThanDays: number = 30): Promise<{
        cleanedProcessingRecords: number;
    }> {
        const cleanedProcessingRecords = await this.prisma.kbProcessingStatus.cleanupOldProcessingStatuses(olderThanDays);

        return {
            cleanedProcessingRecords
        };
    }

    // 监控文档处理健康状态
    async getProcessingHealthStatus(kbId: string): Promise<{
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
        stats: any;
    }> {
        const stats = await this.getSystemProcessingStats(kbId);
        const queueStatus = await this.getProcessingQueueStatus(kbId);

        const issues: string[] = [];
        const recommendations: string[] = [];

        // 检查失败率
        const totalProcessed = stats.processingStats.totalProcessed;
        const failedCount = stats.processingStats.failed;
        const failureRate = totalProcessed > 0 ? (failedCount / totalProcessed) * 100 : 0;

        if (failureRate > 10) {
            issues.push(`High failure rate: ${failureRate.toFixed(1)}%`);
            recommendations.push('Review failed documents and check for common error patterns');
        }

        // 检查队列长度
        if (queueStatus.queueLength > 50) {
            issues.push(`Large processing queue: ${queueStatus.queueLength} documents`);
            recommendations.push('Consider scaling processing resources or optimizing processing pipeline');
        }

        // 检查平均处理时间
        if (queueStatus.avekbeProcessingTime > 300) { // 5分钟
            issues.push(`Slow processing: avekbe ${queueStatus.avekbeProcessingTime}s per document`);
            recommendations.push('Optimize document processing pipeline or increase processing resources');
        }

        // 检查长时间运行的任务
        const longRunningProcesses = await this.prisma.kbProcessingStatus.getLongRunningProcesses(15);
        if (longRunningProcesses.length > 0) {
            issues.push(`${longRunningProcesses.length} processes running longer than 15 minutes`);
            recommendations.push('Review long-running processes for potential issues');
        }

        const isHealthy = issues.length === 0;

        return {
            isHealthy,
            issues,
            recommendations,
            stats: {
                ...stats,
                queueStatus,
                longRunningProcesses: longRunningProcesses.length
            }
        };
    }
}