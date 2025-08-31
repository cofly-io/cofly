import { NextRequest } from 'next/server';
import { AppError, ErrorType } from '@repo/common';

// 文件上传中间件配置
export interface UploadMiddlewareConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  maxFiles: number;
}

// 默认配置
export const DEFAULT_UPLOAD_CONFIG: UploadMiddlewareConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  maxFiles: 1
};

/**
 * 验证上传请求
 */
export async function validateUploadRequest(
  request: NextRequest,
  config: UploadMiddlewareConfig = DEFAULT_UPLOAD_CONFIG
): Promise<{ isValid: boolean; error?: AppError; formData?: FormData }> {
  try {
    // 检查 Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        isValid: false,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: '请求必须是 multipart/form-data 格式',
          timestamp: new Date()
        }
      };
    }

    // 解析 FormData
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      return {
        isValid: false,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: '无法解析上传的文件数据',
          timestamp: new Date(),
          details: error
        }
      };
    }

    // 检查文件数量
    const files = formData.getAll('file') as File[];
    if (files.length === 0) {
      return {
        isValid: false,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: '未找到上传的文件',
          timestamp: new Date()
        }
      };
    }

    if (files.length > config.maxFiles) {
      return {
        isValid: false,
        error: {
          type: ErrorType.VALIDATION_ERROR,
          message: `最多只能上传 ${config.maxFiles} 个文件`,
          timestamp: new Date()
        }
      };
    }

    // 验证每个文件
    for (const file of files) {
      // 检查文件大小
      if (file.size > config.maxFileSize) {
        return {
          isValid: false,
          error: {
            type: ErrorType.FILE_TOO_LARGE,
            message: `文件 "${file.name}" 大小超过限制 (${Math.round(config.maxFileSize / 1024 / 1024)}MB)`,
            timestamp: new Date()
          }
        };
      }

      // 检查文件类型
      if (!config.allowedMimeTypes.includes(file.type)) {
        return {
          isValid: false,
          error: {
            type: ErrorType.UNSUPPORTED_FORMAT,
            message: `不支持的文件类型: ${file.type}`,
            timestamp: new Date()
          }
        };
      }

      // 检查文件名
      if (!file.name || file.name.trim() === '') {
        return {
          isValid: false,
          error: {
            type: ErrorType.VALIDATION_ERROR,
            message: '文件名不能为空',
            timestamp: new Date()
          }
        };
      }
    }

    return {
      isValid: true,
      formData
    };

  } catch (error) {
    return {
      isValid: false,
      error: {
        type: ErrorType.PROCESSING_ERROR,
        message: error instanceof Error ? error.message : '请求验证失败',
        timestamp: new Date(),
        details: error
      }
    };
  }
}

/**
 * 记录上传请求日志
 */
export function logUploadRequest(
  request: NextRequest,
  fileInfo?: { name: string; size: number; type: string }
): void {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'Unknown';

  console.log(`[${timestamp}] Upload Request:`, {
    ip,
    userAgent,
    file: fileInfo ? {
      name: fileInfo.name,
      size: `${Math.round(fileInfo.size / 1024)}KB`,
      type: fileInfo.type
    } : 'No file info'
  });
}

/**
 * 记录上传错误日志
 */
export function logUploadError(
  error: AppError,
  request: NextRequest,
  fileInfo?: { name: string; size: number; type: string }
): void {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'Unknown';

  console.error(`[${timestamp}] Upload Error:`, {
    error: {
      type: error.type,
      message: error.message,
      details: error.details
    },
    request: {
      ip,
      userAgent
    },
    file: fileInfo
  });
}

/**
 * 记录上传成功日志
 */
export function logUploadSuccess(
  fileId: string,
  request: NextRequest,
  fileInfo: { name: string; size: number; type: string }
): void {
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'Unknown';

  console.log(`[${timestamp}] Upload Success:`, {
    fileId,
    file: {
      name: fileInfo.name,
      size: `${Math.round(fileInfo.size / 1024)}KB`,
      type: fileInfo.type
    },
    request: {
      ip,
      userAgent
    }
  });
}