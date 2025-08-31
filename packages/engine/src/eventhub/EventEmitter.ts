import { EventListener, EventEmitterInterface } from './types';

/**
 * 自定义EventEmitter实现
 * 支持异步事件监听器和一次性监听器
 */
export class EventEmitter implements EventEmitterInterface {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private onceListeners: Map<string, Set<EventListener>> = new Map();

  /**
   * 添加事件监听器
   */
  on<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventListener);
  }

  /**
   * 移除事件监听器
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceEventListeners = this.onceListeners.get(event);
    if (onceEventListeners) {
      onceEventListeners.delete(listener as EventListener);
      if (onceEventListeners.size === 0) {
        this.onceListeners.delete(event);
      }
    }
  }

  /**
   * 添加一次性事件监听器
   */
  once<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(listener as EventListener);
  }

  /**
   * 发射事件
   */
  async emit<T = any>(event: string, data?: T): Promise<void> {
    // 处理普通监听器
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const promises: Promise<void>[] = [];
      for (const listener of eventListeners) {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      }
      
      // 等待所有异步监听器完成
      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    }

    // 处理一次性监听器
    const onceEventListeners = this.onceListeners.get(event);
    if (onceEventListeners) {
      const promises: Promise<void>[] = [];
      const listenersToRemove = Array.from(onceEventListeners);
      
      // 清除一次性监听器
      this.onceListeners.delete(event);
      
      for (const listener of listenersToRemove) {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`Error in once event listener for ${event}:`, error);
        }
      }
      
      // 等待所有异步监听器完成
      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    const regularCount = this.listeners.get(event)?.size || 0;
    const onceCount = this.onceListeners.get(event)?.size || 0;
    return regularCount + onceCount;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    const allEvents = new Set([
      ...this.listeners.keys(),
      ...this.onceListeners.keys()
    ]);
    return Array.from(allEvents);
  }
}
