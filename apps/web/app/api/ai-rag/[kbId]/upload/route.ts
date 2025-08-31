import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UploadResponse, AppError, ErrorType, UploadProgress } from '@repo/common';
import {
    validateUploadRequest,
    logUploadRequest,
    logUploadError,
    logUploadSuccess
} from '@/middleware/upload-middleware';
import { knowledgeBaseManager } from "@repo/knowledge-base";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ kbId: string }> }
): Promise<NextResponse> {
    const { kbId } = await params;
    let fileInfo: { name: string; size: number; type: string } | undefined;

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

    try {
        // 验证上传请求
        const kb = await knowledgeBaseManager.get(kbId);
        const validation = await validateUploadRequest(request);
        if (!validation.isValid || !validation.formData) {
            if (validation.error) {
                logUploadError(validation.error, request, fileInfo);
            }

            const response: ApiResponse<UploadResponse> = {
                success: false,
                error: validation.error
            };

            return NextResponse.json(response, { status: 400 });
        }

        const file = validation.formData.get('file') as File;
        fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type
        };

        // 记录上传请求
        logUploadRequest(request, fileInfo);

        // 使用集成的文档处理流程
        const processingResult = await kb.processFile(file);

        if (!processingResult.success) {
            const error = processingResult.error!;
            logUploadError(error, request, fileInfo);

            const response: ApiResponse<UploadResponse> = {
                success: false,
                error
            };

            // 根据错误类型返回适当的状态码
            let statusCode = 500;
            switch (error.type) {
                case ErrorType.FILE_TOO_LARGE:
                case ErrorType.UNSUPPORTED_FORMAT:
                case ErrorType.VALIDATION_ERROR:
                    statusCode = 400;
                    break;
                case ErrorType.PROCESSING_ERROR:
                    statusCode = 500;
                    break;
                default:
                    statusCode = 500;
            }

            return NextResponse.json(response, { status: statusCode });
        }

        // 记录成功日志
        logUploadSuccess(processingResult.documentId, request, fileInfo);

        // 构建响应
        const uploadResponse: UploadResponse = {
            fileId: processingResult.documentId,
            fileName: fileInfo.name,
            fileSize: fileInfo.size,
            status: processingResult.status,
            message: processingResult.success ? '文件上传并处理成功' : '文件上传成功，正在处理中'
        };

        const response: ApiResponse<UploadResponse> = {
            success: true,
            data: uploadResponse,
            message: '文件上传并处理成功'
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        let appError: AppError;

        if (error && typeof error === 'object' && 'type' in error) {
            appError = error as AppError;
        } else {
            appError = {
                type: ErrorType.PROCESSING_ERROR,
                message: error instanceof Error ? error.message : '文件上传失败',
                timestamp: new Date(),
                details: error
            };
        }

        // 记录错误日志
        logUploadError(appError, request, fileInfo);

        const response: ApiResponse<UploadResponse> = {
            success: false,
            error: appError
        };

        // 根据错误类型返回适当的状态码
        let statusCode = 500;
        switch (appError.type) {
            case ErrorType.FILE_TOO_LARGE:
            case ErrorType.UNSUPPORTED_FORMAT:
            case ErrorType.VALIDATION_ERROR:
                statusCode = 400;
                break;
            case ErrorType.PROCESSING_ERROR:
                statusCode = 500;
                break;
            default:
                statusCode = 500;
        }

        return NextResponse.json(response, { status: statusCode });
    }
}

// 处理 OPTIONS 请求 (CORS)
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}