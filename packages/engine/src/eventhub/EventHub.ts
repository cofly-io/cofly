import { EventEmitter } from './EventEmitter';
import {
  EventHookRequest,
  EventReceiveData,
  EventData,
  EventPendingRequest,
  EventHubConfig,
  EVENT_KEY
} from './types';

/**
 * 事件管理器
 * 负责协调监听者和订阅者之间的数据流
 */
export class EventHub extends EventEmitter {
  private pendingRequests: Map<string, EventPendingRequest> = new Map();
  private config: EventHubConfig;

  constructor(config: Partial<EventHubConfig> = {}) {
    super();
    this.config = {
      defaultTimeout: 30000, // 30秒默认超时
      maxPendingRequests: 100,
      enableLogging: true,
      ...config
    };
  }

  /**
   * 创建API Hook请求
   */
  async createHook(request: Omit<EventHookRequest, 'timestamp'>): Promise<EventReceiveData> {
    // 检查待处理请求数量
    if (this.pendingRequests.size >= this.config.maxPendingRequests) {
      throw new Error('Too many pending requests');
    }

    const hookRequest: EventHookRequest = {
      ...request,
      timestamp: Date.now(),
      timeout: request.timeout || this.config.defaultTimeout
    };

    this.log(`Creating hook request: ${hookRequest.id}`);

    // 发射hook创建事件
    await this.emit(EVENT_KEY.HOOK_CREATED, {
      requestId: hookRequest.id,
      status: 'pending',
      request: hookRequest
    } as EventData);

    // 创建Promise来等待响应
    return new Promise<EventReceiveData>((resolve, reject) => {
      const pendingRequest: EventPendingRequest = {
        request: hookRequest,
        resolve,
        reject
      };

      // 设置超时
      if (hookRequest.timeout && hookRequest.timeout > 0) {
        pendingRequest.timeoutId = setTimeout(() => {
          this.handleTimeout(hookRequest.id);
        }, hookRequest.timeout);
      }

      // 存储待处理请求
      this.pendingRequests.set(hookRequest.id, pendingRequest);

      // 发射pending事件
      this.emit(EVENT_KEY.HOOK_PENDING, {
        requestId: hookRequest.id,
        status: 'pending',
        request: hookRequest
      } as EventData);
    });
  }

  /**
   * 接收API数据
   */
  async receiveData(data: Omit<EventReceiveData, 'timestamp'>): Promise<boolean> {
    const receiveData: EventReceiveData = {
      ...data,
      timestamp: Date.now()
    };

    this.log(`Receiving data for request: ${receiveData.id}`);

    // 发射接收数据事件
    await this.emit(EVENT_KEY.RECEIVE_DATA, receiveData);

    // 查找对应的待处理请求
    const pendingRequest = this.pendingRequests.get(receiveData.id);
    if (!pendingRequest) {
      this.log(`No pending request found for ID: ${receiveData.id}`);
      return false;
    }

    // 清除超时定时器
    if (pendingRequest.timeoutId) {
      clearTimeout(pendingRequest.timeoutId);
    }

    // 移除待处理请求
    this.pendingRequests.delete(receiveData.id);

    try {
      if (receiveData.status === 'success') {
        // 成功响应
        pendingRequest.resolve(receiveData);
        
        await this.emit(EVENT_KEY.REQUEST_COMPLETED, {
          requestId: receiveData.id,
          status: 'completed',
          request: pendingRequest.request,
          response: receiveData
        } as EventData);
      } else {
        // 错误响应
        const error = new Error(receiveData.error || 'API request failed');
        pendingRequest.reject(error);
        
        await this.emit(EVENT_KEY.REQUEST_ERROR, {
          requestId: receiveData.id,
          status: 'error',
          request: pendingRequest.request,
          response: receiveData,
          error: receiveData.error
        } as EventData);
      }
      
      return true;
    } catch (error) {
      this.log(`Error processing received data: ${error}`);
      return false;
    }
  }

  /**
   * 处理请求超时
   */
  private async handleTimeout(requestId: string): Promise<void> {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      return;
    }

    this.log(`Request timeout: ${requestId}`);

    // 移除待处理请求
    this.pendingRequests.delete(requestId);

    // 拒绝Promise
    const timeoutError = new Error(`Request timeout after ${pendingRequest.request.timeout}ms`);
    pendingRequest.reject(timeoutError);

    // 发射超时事件
    await this.emit(EVENT_KEY.HOOK_TIMEOUT, {
      requestId,
      status: 'timeout',
      request: pendingRequest.request,
      error: 'Request timeout'
    } as EventData);
  }

  /**
   * 获取待处理请求信息
   */
  getPendingRequests(): EventHookRequest[] {
    return Array.from(this.pendingRequests.values()).map(pr => pr.request);
  }

  /**
   * 取消待处理请求
   */
  cancelRequest(requestId: string): boolean {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      return false;
    }

    // 清除超时定时器
    if (pendingRequest.timeoutId) {
      clearTimeout(pendingRequest.timeoutId);
    }

    // 移除待处理请求
    this.pendingRequests.delete(requestId);

    // 拒绝Promise
    pendingRequest.reject(new Error('Request cancelled'));

    this.log(`Request cancelled: ${requestId}`);
    return true;
  }

  /**
   * 清理所有待处理请求
   */
  cleanup(): void {
    for (const [requestId, pendingRequest] of this.pendingRequests) {
      if (pendingRequest.timeoutId) {
        clearTimeout(pendingRequest.timeoutId);
      }
      pendingRequest.reject(new Error('Manager cleanup'));
    }
    this.pendingRequests.clear();
    this.removeAllListeners();
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 日志记录
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[ApiEventManager] ${message}`);
    }
  }
}
