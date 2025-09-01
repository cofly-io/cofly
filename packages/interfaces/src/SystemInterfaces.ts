// 错误类型枚举
import { DocumentStatus, SupportedFileType } from "./KnowledgeBaseInterfaces";

export enum ErrorType {
    FILE_TOO_LARGE = 'FILE_TOO_LARGE',
    UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
    EXTRACTION_FAILED = 'EXTRACTION_FAILED',
    VECTORIZATION_FAILED = 'VECTORIZATION_FAILED',
    MILVUS_CONNECTION_ERROR = 'MILVUS_CONNECTION_ERROR',
    SEARCH_FAILED = 'SEARCH_FAILED',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PROCESSING_ERROR = 'PROCESSING_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 应用错误接口
export class AppError {
    public name?: string = 'AppError';
    public timestamp?: Date = new Date();

    constructor(
        public type: ErrorType = ErrorType.UNKNOWN_ERROR,
        public message: string,
        public code?: string,
        public details?: any
    ) {
    }
}

// API 响应基础接口
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: AppError;
    message?: string;
}

// 文件上传相关接口
export interface UploadProps {
    onUploadSuccess: (fileId: string) => void;
    onUploadError: (error: string) => void;
    acceptedTypes: SupportedFileType[];
    maxFileSize: number;
}

export interface UploadResponse {
    fileId: string;
    fileName: string;
    fileSize: number;
    status: DocumentStatus;
    message?: string;
}

export interface UploadProgress {
    fileId: string;
    progress: number;
    status: DocumentStatus;
    error?: string;
}