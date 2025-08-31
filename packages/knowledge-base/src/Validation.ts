import { SupportedFileType, ErrorType, ValidationResult, DocumentMetadata } from '@repo/common';

// 文件大小限制 (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 支持的 MIME 类型映射
export const SUPPORTED_MIME_TYPES: Record<SupportedFileType, string[]> = {
  [SupportedFileType.TXT]: ['text/plain'],
  [SupportedFileType.DOC]: ['application/msword'],
  [SupportedFileType.DOCX]: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  [SupportedFileType.PDF]: ['application/pdf'],
  [SupportedFileType.XLS]: ['application/vnd.ms-excel'],
  [SupportedFileType.XLSX]: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  [SupportedFileType.PPT]: ['application/vnd.ms-powerpoint'],
  [SupportedFileType.PPTX]: [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

// 获取文件扩展名
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

// 根据文件扩展名获取文件类型
export function getFileTypeFromExtension(extension: string): SupportedFileType | null {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case 'txt':
      return SupportedFileType.TXT;
    case 'doc':
      return SupportedFileType.DOC;
    case 'docx':
      return SupportedFileType.DOCX;
    case 'pdf':
      return SupportedFileType.PDF;
    case 'xls':
      return SupportedFileType.XLS;
    case 'xlsx':
      return SupportedFileType.XLSX;
    case 'ppt':
      return SupportedFileType.PPT;
    case 'pptx':
      return SupportedFileType.PPTX;
    default:
      return null;
  }
}

// 验证文件类型
export function validateFileType(file: File): ValidationResult {
  const extension = getFileExtension(file.name);
  const fileType = getFileTypeFromExtension(extension);
  
  if (!fileType) {
    return {
      isValid: false,
      error: `不支持的文件格式: ${extension}`,
      errorType: ErrorType.UNSUPPORTED_FORMAT
    };
  }
  
  const supportedMimeTypes = SUPPORTED_MIME_TYPES[fileType];
  if (!supportedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `文件 MIME 类型不匹配: ${file.type}`,
      errorType: ErrorType.UNSUPPORTED_FORMAT
    };
  }
  
  return { isValid: true };
}

// 验证文件大小
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `文件大小超过限制 (${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB)`,
      errorType: ErrorType.FILE_TOO_LARGE
    };
  }
  
  if (file.size === 0) {
    return {
      isValid: false,
      error: '文件为空',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  return { isValid: true };
}

// 综合文件验证
export function validateFile(file: File): ValidationResult {
  // 验证文件大小
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }
  
  // 验证文件类型
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }
  
  return { isValid: true };
}

// 验证文档元数据
export function validateDocumentMetadata(metadata: Partial<DocumentMetadata>): ValidationResult {
  if (!metadata.fileName || metadata.fileName.trim() === '') {
    return {
      isValid: false,
      error: '文件名不能为空',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  if (!metadata.fileType || !Object.values(SupportedFileType).includes(metadata.fileType)) {
    return {
      isValid: false,
      error: '无效的文件类型',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  if (!metadata.fileSize || metadata.fileSize <= 0) {
    return {
      isValid: false,
      error: '无效的文件大小',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  return { isValid: true };
}

// 验证搜索查询
export function validateSearchQuery(query: string): ValidationResult {
  if (!query || query.trim() === '') {
    return {
      isValid: false,
      error: '搜索查询不能为空',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  if (query.length > 1000) {
    return {
      isValid: false,
      error: '搜索查询过长',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  return { isValid: true };
}

// 验证向量数据
export function validateVectorData(vector: number[]): ValidationResult {
  if (!Array.isArray(vector) || vector.length === 0) {
    return {
      isValid: false,
      error: '向量数据无效',
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  // 检查向量维度 (通常为 384 或 1536)
  if (vector.length !== 384 && vector.length !== 1536) {
    return {
      isValid: false,
      error: `向量维度无效: ${vector.length}`,
      errorType: ErrorType.VALIDATION_ERROR
    };
  }
  
  // 检查向量值是否为有效数字
  for (const value of vector) {
    if (typeof value !== 'number' || !isFinite(value)) {
      return {
        isValid: false,
        error: '向量包含无效数值',
        errorType: ErrorType.VALIDATION_ERROR
      };
    }
  }
  
  return { isValid: true };
}