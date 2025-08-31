// 消息时间戳管理工具

interface MessageTimestampData {
  messageId: string;
  timestamp: string;
  content: string;
}

class MessageTimestampManager {
  private timestamps = new Map<string, string>();
  private messageContents = new Map<string, string>();

  // 生成消息的唯一标识符
  private generateMessageId(content: string, role: 'user' | 'assistant'): string {
    const hash = this.simpleHash(content + role);
    return `${role}_${hash}`;
  }

  // 简单的哈希函数
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  // 设置消息时间戳
  setMessageTimestamp(content: string, role: 'user' | 'assistant', timestamp?: string): string {
    const messageId = this.generateMessageId(content, role);
    const finalTimestamp = timestamp || new Date().toISOString();
    
    this.timestamps.set(messageId, finalTimestamp);
    this.messageContents.set(messageId, content);
    
    return messageId;
  }

  // 获取消息时间戳
  getMessageTimestamp(content: string, role: 'user' | 'assistant'): string | null {
    const messageId = this.generateMessageId(content, role);
    return this.timestamps.get(messageId) || null;
  }

  // 从rawData中提取时间戳
  extractTimestamp(rawData: any): string | null {
    if (!rawData) return null;
    
    // 尝试多种可能的时间戳字段
    const possibleFields = ['createdAt', 'timestamp', 'created_at', 'time', 'date'];
    
    for (const field of possibleFields) {
      if (rawData[field]) {
        return rawData[field];
      }
    }
    
    return null;
  }

  // 获取或创建消息时间戳
  getOrCreateTimestamp(content: string, role: 'user' | 'assistant', rawData?: any): string {
    // 首先尝试从rawData中提取
    const extractedTimestamp = this.extractTimestamp(rawData);
    if (extractedTimestamp) {
      this.setMessageTimestamp(content, role, extractedTimestamp);
      return extractedTimestamp;
    }

    // 然后尝试从缓存中获取
    const cachedTimestamp = this.getMessageTimestamp(content, role);
    if (cachedTimestamp) {
      return cachedTimestamp;
    }

    // 最后创建新的时间戳
    const newTimestamp = new Date().toISOString();
    this.setMessageTimestamp(content, role, newTimestamp);
    return newTimestamp;
  }

  // 清理旧的时间戳数据（可选，用于内存管理）
  cleanup(maxAge: number = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now();
    const cutoff = now - maxAge;

    for (const [messageId, timestamp] of this.timestamps.entries()) {
      if (new Date(timestamp).getTime() < cutoff) {
        this.timestamps.delete(messageId);
        this.messageContents.delete(messageId);
      }
    }
  }
}

// 创建全局实例
export const messageTimestampManager = new MessageTimestampManager();

// 导出工具函数
export function getMessageTimestamp(content: string, role: 'user' | 'assistant', rawData?: any): string {
  return messageTimestampManager.getOrCreateTimestamp(content, role, rawData);
}