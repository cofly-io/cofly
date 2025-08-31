import path from 'path';
import crypto from 'crypto';
import {
  SupportedFileType, 
  DocumentStatus, 
  ValidationResult, 
  ErrorType,
  AppError 
} from '@repo/common';
import { 
  validateFile, 
  validateDocumentMetadata, 
  getFileTypeFromExtension, 
  getFileExtension 
} from './Validation';
import { FileStorage } from './FileStorage';
import { TextExtractor } from './TextExtractor';
import { TextChunker } from './TextChunker';
import { ProcessedDocumentMetadata } from "./types";

export class DocumentProcessor {
    private fileStorage: FileStorage;
    private textExtractor: TextExtractor;
    private textChunker: TextChunker;

    constructor(opts: {
        storageDir: string,
        chunkSize: number,
        chunkOverlap: number
    }) {
        this.fileStorage = new FileStorage(opts.storageDir);
        this.textExtractor = new TextExtractor();
        this.textChunker = new TextChunker(opts.chunkSize, opts.chunkOverlap);
    }

    /**
     * 初始化上传目录
     */
    async initializeDirectories(): Promise<void> {
        try {
            await this.fileStorage.initializeDirectories();
        } catch (error) {
            throw new Error(`Failed to initialize directories: ${error}`);
        }
    }

    /**
     * 验证文件
     */
    validateFile(file: File): ValidationResult {
        return validateFile(file);
    }

    /**
     * 生成文件校验和
     */
    async generateChecksum(filePath: string): Promise<string> {
        try {
            return await this.fileStorage.generateChecksum(filePath);
        } catch (error) {
            throw new Error(`Failed to generate checksum: ${error}`);
        }
    }

    /**
     * 生成唯一文件ID
     */
    generateFileId(): string {
        return crypto.randomUUID();
    }

    /**
     * 获取安全的文件名
     */
    getSafeFileName(originalName: string, fileId: string): string {
        const extension = getFileExtension(originalName);
        const baseName = path.basename(originalName, `.${extension}`);
        // 清理文件名，移除特殊字符
        const safeName = baseName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
        return `${fileId}_${safeName}.${extension}`;
    }

    /**
     * 保存上传的文件到临时目录
     */
    async saveTemporaryFile(file: File, fileId: string): Promise<string> {
        try {
            const safeFileName = this.getSafeFileName(file.name, fileId);
            let buffer: Buffer;

            // Handle both browser File objects and test File objects
            if (typeof file.arrayBuffer === 'function') {
                const arrayBuffer = await file.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            } else if (file instanceof Buffer) {
                buffer = file;
            } else if (typeof file.stream === 'function') {
                // Handle Node.js File-like objects
                const chunks: Buffer[] = [];
                const reader = file.stream().getReader();

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    chunks.push(Buffer.from(value));
                }
                buffer = Buffer.concat(chunks);
            } else {
                // Fallback for test environments - assume file content is in a property
                const content = (file as any).content || (file as any)[0] || '';
                buffer = Buffer.from(content, 'utf-8');
            }

            return await this.fileStorage.saveTemporaryFile(buffer, safeFileName);
        } catch (error) {
            throw new Error(`Failed to save temporary file: ${error}`);
        }
    }

    /**
     * 移动文件从临时目录到永久目录
     */
    async moveToFinalLocation(tempFilePath: string): Promise<string> {
        try {
            return await this.fileStorage.moveToFinalLocation(tempFilePath);
        } catch (error) {
            throw new Error(`Failed to move file to final location: ${error}`);
        }
    }

    /**
     * 删除文件
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            await this.fileStorage.deleteFile(filePath);
        } catch (error) {
            throw new Error(`Failed to delete file: ${error}`);
        }
    }

    /**
     * 获取文件信息
     */
    async getFileInfo(filePath: string): Promise<{ size: number; mtime: Date }> {
        try {
            return await this.fileStorage.getFileInfo(filePath);
        } catch (error) {
            throw new Error(`Failed to get file info: ${error}`);
        }
    }

    /**
     * 创建文档元数据
     */
    async createDocumentMetadata(
        file: File,
        fileId: string,
        filePath: string
    ): Promise<ProcessedDocumentMetadata> {
        try {
            const extension = getFileExtension(file.name);
            const fileType = getFileTypeFromExtension(extension);

            if (!fileType) {
                throw new Error(`Unsupported file type: ${extension}`);
            }

            const checksum = await this.generateChecksum(filePath);
            const fileInfo = await this.getFileInfo(filePath);

            const metadata: ProcessedDocumentMetadata = {
                id: fileId,
                fileName: this.getSafeFileName(file.name, fileId),
                originalName: file.name,
                fileType,
                fileSize: file.size,
                uploadTime: new Date(),
                status: DocumentStatus.UPLOADING,
                chunkCount: 0,
                filePath,
                textPreview: '',
                mimeType: file.type,
                checksum
            };

            // 验证元数据
            const validation = validateDocumentMetadata(metadata);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            return metadata;
        } catch (error) {
            throw new Error(`Failed to create document metadata: ${error}`);
        }
    }

    /**
     * 处理文件上传的完整流程
     */
    async processFile(file: File): Promise<ProcessedDocumentMetadata> {
        let tempFilePath: string | null = null;

        try {
            // 1. 验证文件
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                const error: AppError = {
                    type: validation.errorType || ErrorType.VALIDATION_ERROR,
                    message: validation.error || 'File validation failed',
                    timestamp: new Date()
                };
                throw error;
            }

            // 2. 生成文件ID
            const fileId = this.generateFileId();

            // 3. 保存到临时目录
            tempFilePath = await this.saveTemporaryFile(file, fileId);

            // 4. 创建文档元数据
            const metadata = await this.createDocumentMetadata(file, fileId, tempFilePath);

            // 5. 移动到最终位置
            const finalPath = await this.moveToFinalLocation(tempFilePath);
            metadata.filePath = finalPath;
            metadata.status = DocumentStatus.PROCESSING;

            return metadata;
        } catch (error) {
            // 清理临时文件
            if (tempFilePath) {
                try {
                    await this.deleteFile(tempFilePath);
                } catch (cleanupError) {
                    console.error('Failed to cleanup temporary file:', cleanupError);
                }
            }

            // 重新抛出错误
            if (error instanceof Error && 'type' in error) {
                throw error as unknown as AppError;
            }

            const appError: AppError = {
                type: ErrorType.PROCESSING_ERROR,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date(),
                details: error
            };
            throw appError;
        }
    }

    /**
     * 清理过期的临时文件
     */
    async cleanupTemporaryFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
        await this.fileStorage.cleanupTemporaryFiles(maxAge);
    }

    /**
     * 验证文件是否存在且可访问
     */
    async validateFileExists(filePath: string): Promise<boolean> {
        return await this.fileStorage.fileExists(filePath);
    }

    /**
     * 获取文件的 MIME 类型
     */
    getMimeType(fileName: string): string {
        const extension = getFileExtension(fileName);
        const fileType = getFileTypeFromExtension(extension);

        if (!fileType) {
            return 'application/octet-stream';
        }

        // 简单的 MIME 类型映射
        const mimeMap: Record<SupportedFileType, string> = {
            [SupportedFileType.TXT]: 'text/plain',
            [SupportedFileType.DOC]: 'application/msword',
            [SupportedFileType.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            [SupportedFileType.PDF]: 'application/pdf',
            [SupportedFileType.XLS]: 'application/vnd.ms-excel',
            [SupportedFileType.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            [SupportedFileType.PPT]: 'application/vnd.ms-powerpoint',
            [SupportedFileType.PPTX]: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };

        return mimeMap[fileType] || 'application/octet-stream';
    }

    /**
     * 从文档中提取文本内容
     */
    async extractTextFromDocument(filePath: string, fileType: SupportedFileType): Promise<string> {
        try {
            return await this.textExtractor.extractText(filePath, fileType);
        } catch (error) {
            // 如果是 AppError，保持原始错误结构
            if (error && typeof error === 'object' && 'type' in error) {
                throw error as AppError;
            }
            
            // 对于其他错误，提取错误消息
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to extract text from document: ${errorMessage}`);
        }
    }

    /**
     * 验证提取的文本内容
     */
    validateExtractedText(text: string): ValidationResult {
        const result = this.textExtractor.validateExtractedText(text);
        return {
            isValid: result.isValid,
            error: result.error,
            errorType: result.isValid ? undefined : ErrorType.EXTRACTION_FAILED
        };
    }

    /**
     * 获取文本预览
     */
    getTextPreview(text: string, maxLength: number = 500): string {
        return this.textExtractor.getTextPreview(text, maxLength);
    }

    /**
     * 获取文本统计信息
     */
    getTextStats(text: string) {
        return this.textExtractor.getTextStats(text);
    }

    /**
     * 将文本分割成块
     */
    chunkText(text: string, documentId: string, options?: {
        chunkSize?: number;
        chunkOverlap?: number;
        preserveParagraphs?: boolean;
        preserveSentences?: boolean;
    }) {
        return this.textChunker.chunkText(text, documentId, options);
    }

    /**
     * 验证分块结果
     */
    validateChunks(chunks: any[]) {
        return this.textChunker.validateChunks(chunks);
    }

    /**
     * 获取分块统计信息
     */
    getChunkingStats(chunks: any[], originalText: string) {
        return this.textChunker.getChunkingStats(chunks, originalText);
    }

    /**
     * 优化分块大小
     */
    optimizeChunkSize(text: string, targetVectorDimension?: number) {
        return this.textChunker.optimizeChunkSize(text, targetVectorDimension);
    }

    /**
     * 处理文档的完整流程（包括文本提取和分块）
     */
    async processDocumentWithTextExtraction(file: File): Promise<ProcessedDocumentMetadata & {
        extractedText?: string;
        chunks?: any[];
        chunkingStats?: any;
    }> {
        let tempFilePath: string | null = null;

        try {
            // 1. 验证文件
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                const error: AppError = {
                    type: validation.errorType || ErrorType.VALIDATION_ERROR,
                    message: validation.error || 'File validation failed',
                    timestamp: new Date()
                };
                throw error;
            }

            // 2. 生成文件ID
            const fileId = this.generateFileId();

            // 3. 保存到临时目录
            tempFilePath = await this.saveTemporaryFile(file, fileId);

            // 4. 创建文档元数据
            const metadata = await this.createDocumentMetadata(file, fileId, tempFilePath);

            // 5. 移动到最终位置
            const finalPath = await this.moveToFinalLocation(tempFilePath);
            metadata.filePath = finalPath;
            metadata.status = DocumentStatus.PROCESSING;

            // 6. 提取文本内容
            let extractedText: string | undefined;
            let chunks: any[] | undefined;
            let chunkingStats: any | undefined;

            try {
                extractedText = await this.extractTextFromDocument(finalPath, metadata.fileType);

                // 验证提取的文本
                const textValidation = this.validateExtractedText(extractedText);
                if (!textValidation.isValid) {
                    console.warn(`Text extraction validation failed: ${textValidation.error}`);
                    // 不抛出错误，继续处理，但记录警告
                }

                // 7. 文本分块处理
                if (extractedText && extractedText.trim().length > 0) {
                    try {
                        // 优化分块大小
                        const optimalChunkSize = this.optimizeChunkSize(extractedText);

                        // 执行文本分块
                        chunks = this.chunkText(extractedText, metadata.id, {
                            chunkSize: optimalChunkSize,
                            preserveParagraphs: true,
                            preserveSentences: true
                        });

                        // 验证分块结果
                        const chunkValidation = this.validateChunks(chunks);
                        if (!chunkValidation.isValid) {
                            console.warn('Chunk validation failed:', chunkValidation.errors);
                        }

                        // 获取分块统计信息
                        chunkingStats = this.getChunkingStats(chunks, extractedText);
                        metadata.chunkCount = chunks.length;
                    } catch (chunkError) {
                        console.error('Text chunking failed:', chunkError);
                        metadata.chunkCount = 0;
                    }
                }

                // 生成文本预览
                metadata.textPreview = this.getTextPreview(extractedText);
                metadata.status = DocumentStatus.COMPLETED;
            } catch (textError) {
                console.error('Text extraction failed:', textError);
                metadata.textPreview = `文本提取失败: ${textError instanceof Error ? textError.message : '未知错误'}`;
                metadata.status = DocumentStatus.FAILED;
                metadata.chunkCount = 0;
                // 不抛出错误，允许文档保存但标记为失败
            }

            return {
                ...metadata,
                extractedText,
                chunks,
                chunkingStats
            };
        } catch (error) {
            // 清理临时文件
            if (tempFilePath) {
                try {
                    await this.deleteFile(tempFilePath);
                } catch (cleanupError) {
                    console.error('Failed to cleanup temporary file:', cleanupError);
                }
            }

            // 重新抛出错误
            if (error instanceof Error && 'type' in error) {
                throw error as unknown as AppError;
            }

            const appError: AppError = {
                type: ErrorType.PROCESSING_ERROR,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date(),
                details: error
            };
            throw appError;
        }
    }
}