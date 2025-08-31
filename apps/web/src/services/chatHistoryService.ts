// 历史对话服务
export interface Thread {
  id: string;
  title?: string;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
  agentId: string;
  userId: string;
}

export interface Message {
  id: string;
  threadId: string;
  sender: string;
  content: string;
  timestamp: string;
  messageType: 'user' | 'agent';
}

export class ChatHistoryService {
  
  /**
   * 获取历史会话列表
   */
  static async getThreads(agentId: string, userId: string, limit: number = 50): Promise<Thread[]> {
    try {
      const response = await fetch(`/api/agentic/threads?agentId=${agentId}&userid=${userId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw error;
    }
  }

  /**
   * 获取特定会话的消息历史
   */
  static async getThreadMessages(threadId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/agentic/threads/${threadId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch thread messages: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      throw error;
    }
  }

  /**
   * 删除会话
   */
  static async deleteThread(threadId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/agentic/threads/${threadId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }

  /**
   * 获取特定会话信息
   */
  static async getThread(threadId: string): Promise<Thread | null> {
    try {
      const response = await fetch(`/api/agentic/threads/${threadId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch thread: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      throw error;
    }
  }

  /**
   * 格式化时间显示
   */
  static formatTime(timeStr: string): string {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * 生成会话标题
   */
  static generateThreadTitle(thread: Thread): string {
    if (thread.title) {
      return thread.title;
    }
    return `会话 ${thread.id.slice(-6)}`;
  }
} 