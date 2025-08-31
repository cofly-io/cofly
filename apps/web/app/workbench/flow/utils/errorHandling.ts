/**
 * 统一错误处理工具
 */

export type Result<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export type AsyncResult<T> = Promise<Result<T>>;

/**
 * 处理异步操作的统一错误处理函数
 */
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = '操作失败'
): AsyncResult<T> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error(`[AsyncOperation Error]: ${errorMessage}`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : errorMessage 
    };
  }
};

/**
 * 处理同步操作的统一错误处理函数
 */
export const handleSyncOperation = <T>(
  operation: () => T,
  errorMessage: string = '操作失败'
): Result<T> => {
  try {
    const data = operation();
    return { success: true, data };
  } catch (error) {
    console.error(`[SyncOperation Error]: ${errorMessage}`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : errorMessage 
    };
  }
};

/**
 * 创建带有重试机制的异步操作处理函数
 */
export const handleAsyncOperationWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  errorMessage: string = '操作失败'
): AsyncResult<T> => {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      lastError = error;
      console.warn(`[AsyncOperation Retry ${attempt}/${maxRetries}]: ${errorMessage}`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.error(`[AsyncOperation Failed]: ${errorMessage} after ${maxRetries} attempts`, lastError);
  return { 
    success: false, 
    error: lastError instanceof Error ? lastError.message : errorMessage 
  };
};

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
  }
}

/**
 * 创建特定类型的错误
 */
export const createError = {
  network: (message: string, details?: any) => 
    new AppError(message, ErrorType.NETWORK_ERROR, 'NETWORK_ERROR', details),
  
  validation: (message: string, details?: any) => 
    new AppError(message, ErrorType.VALIDATION_ERROR, 'VALIDATION_ERROR', details),
  
  permission: (message: string, details?: any) => 
    new AppError(message, ErrorType.PERMISSION_ERROR, 'PERMISSION_ERROR', details),
  
  notFound: (message: string, details?: any) => 
    new AppError(message, ErrorType.NOT_FOUND_ERROR, 'NOT_FOUND_ERROR', details),
  
  timeout: (message: string, details?: any) => 
    new AppError(message, ErrorType.TIMEOUT_ERROR, 'TIMEOUT_ERROR', details),
};

/**
 * 错误处理中间件类型
 */
export type ErrorHandler = (error: AppError) => void;

/**
 * 全局错误处理器
 */
export class GlobalErrorHandler {
  private static handlers: Map<ErrorType, ErrorHandler[]> = new Map();

  static addHandler(type: ErrorType, handler: ErrorHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  static removeHandler(type: ErrorType, handler: ErrorHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  static handle(error: AppError) {
    const handlers = this.handlers.get(error.type) || [];
    handlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }
}

/**
 * 日志记录工具
 */
export const logger = {
  error: (message: string, error?: any, context?: any) => {
    console.error(`[ERROR] ${message}`, { error, context, timestamp: new Date().toISOString() });
  },
  
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, { context, timestamp: new Date().toISOString() });
  },
  
  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, { context, timestamp: new Date().toISOString() });
  },
  
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, { context, timestamp: new Date().toISOString() });
    }
  }
};