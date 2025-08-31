// 导出所有事件系统相关的类和类型

export { EventEmitter } from './EventEmitter';
export { EventHub } from './EventHub';
export * from './types';

// 动态导入以避免服务端渲染问题
import { EventHub } from './EventHub';

// 使用globalThis来确保在所有执行上下文中共享同一个实例
declare global {
  var __apiEventManager: EventHub | undefined;
}

/**
 * 获取全局API事件管理器实例
 */
export function getEventHubManager(): EventHub {
  if (!globalThis.__apiEventManager) {
    globalThis.__apiEventManager = new EventHub({
      defaultTimeout: 30000,
      maxPendingRequests: 100,
      enableLogging: process.env.NODE_ENV === 'development'
    });
  }
  return globalThis.__apiEventManager;
}
