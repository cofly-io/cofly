// 事件系统的类型定义

export interface EventListener<T = any> {
  (data: T): void | Promise<void>;
}

export interface EventEmitterInterface {
  on<T = any>(event: string, listener: EventListener<T>): void;
  off<T = any>(event: string, listener: EventListener<T>): void;
  emit<T = any>(event: string, data?: T): void;
  once<T = any>(event: string, listener: EventListener<T>): void;
  removeAllListeners(event?: string): void;
}

// API事件相关类型
export interface EventHookRequest {
  id: string;
  remote: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timestamp: number;
  timeout?: number; // 超时时间（毫秒）
}

export interface EventReceiveData {
  id: string;
  data: any;
  status: 'success' | 'error';
  timestamp: number;
  error?: string;
}

export interface EventData {
  requestId: string;
  status: 'pending' | 'completed' | 'timeout' | 'error';
  request?: EventHookRequest;
  response?: EventReceiveData;
  error?: string;
}

// 事件名称常量
export const EVENT_KEY = {
  HOOK_CREATED: 'event:hook:created',
  HOOK_PENDING: 'event:hook:pending',
  HOOK_TIMEOUT: 'event:hook:timeout',
  RECEIVE_DATA: 'event:receive:data',
  REQUEST_COMPLETED: 'event:request:completed',
  REQUEST_ERROR: 'event:request:error',
} as const;

export type EventName = typeof EVENT_KEY[keyof typeof EVENT_KEY];

// Hook状态管理
export interface EventPendingRequest {
  request: EventHookRequest;
  resolve: (data: EventReceiveData) => void;
  reject: (error: Error) => void;
  timeoutId?: NodeJS.Timeout;
}

export interface EventHubConfig {
  defaultTimeout: number; // 默认超时时间
  maxPendingRequests: number; // 最大待处理请求数
  enableLogging: boolean; // 是否启用日志
}
