import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UploadProgress, AppError, ErrorType } from '@repo/common';
import { knowledgeBaseManager } from "@repo/common";

export async function GET(
    request: NextRequest,
    { params }: { params: { kbId: string, fileId: string } }
): Promise<NextResponse> {
    try {
        const { kbId, fileId } = params;

        if (!kbId) {
            const error: AppError = {
                type: ErrorType.VALIDATION_ERROR,
                message: '知识库ID不能为空',
                timestamp: new Date()
            };

            const response: ApiResponse<UploadProgress> = {
                success: false,
                error
            };

            return NextResponse.json(response, { status: 400 });
        }

        if (!fileId) {
            const error: AppError = {
                type: ErrorType.VALIDATION_ERROR,
                message: '文件ID不能为空',
                timestamp: new Date()
            };

            const response: ApiResponse<UploadProgress> = {
                success: false,
                error
            };

            return NextResponse.json(response, { status: 400 });
        }

        const kb = await knowledgeBaseManager.mediator?.get(kbId);

        // 获取文档信息
        const document = await kb?.getDocumentById(fileId);
        if (!document) {
            const error: AppError = {
                type: ErrorType.VALIDATION_ERROR,
                message: '文档不存在',
                timestamp: new Date()
            };

            const response: ApiResponse<UploadProgress> = {
                success: false,
                error
            };

            return NextResponse.json(response, { status: 404 });
        }

        // 获取处理状态
        const processingStatus = await kb?.getProcessingStatus(fileId);

        const progress: UploadProgress = {
            fileId: document.id,
            progress: processingStatus?.progress || 0,
            status: document.status,
            error: processingStatus?.error?.message
        };

        const response: ApiResponse<UploadProgress> = {
            success: true,
            data: progress
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('Progress tracking error:', error);

        const appError: AppError = {
            type: ErrorType.PROCESSING_ERROR,
            message: error instanceof Error ? error.message : '获取上传进度失败',
            timestamp: new Date(),
            details: error
        };

        const response: ApiResponse<UploadProgress> = {
            success: false,
            error: appError
        };

        return NextResponse.json(response, { status: 500 });
    }
}