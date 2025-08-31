// 聊天服务
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sender: string;
  avatar: string;
}

// 聊天消息接口保持不变，其他接口已内联到方法中

export class ChatService {
  
  /**
   * 发送消息
   */
  static async sendMessage(
    request: { message: string; agentId: string; threadId?: string; userId?: string; waitOutput?: boolean },
    endpoint: string = '/api/agentic'
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: request.agentId,
          input: request.message,
          threadId: request.threadId,
          userId: request.userId || 'default-user',
          waitOutput: request.waitOutput || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      return response.body;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * 提取助手回复
   */
  static async extractAssistantReply(stream: ReadableStream<Uint8Array>): Promise<{
    content: string;
    messageId: string;
  }> {
    try {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let messageId = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
              }
              if (data.messageId) {
                messageId = data.messageId;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      return {
        content,
        messageId,
      };
    } catch (error) {
      console.error('Error extracting assistant reply:', error);
      throw error;
    }
  }

  /**
   * 加载线程历史
   */
  static async loadThreadHistory(threadId: string): Promise<{
    success: boolean;
    data?: { messages: ChatMessage[] };
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/agentic/threads/${threadId}/messages`);
      
      if (!response.ok) {
        throw new Error(`Failed to load thread history: ${response.status} ${response.statusText}`);
      }
      
      const messages = await response.json();
      const chatMessages = messages.map((msg: any) => ({
        id: msg.id,
        role: msg.messageType === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        sender: msg.sender,
        avatar: msg.avatar || '',
      }));

      return {
        success: true,
        data: { messages: chatMessages },
      };
    } catch (error) {
      console.error('Error loading thread history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 获取线程列表
   */
  static async getThreads(agentId?: string, limit: number = 50): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (agentId) params.append('agentId', agentId);
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/agentic/threads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch threads: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error fetching threads:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 删除线程
   */
  static async deleteThread(threadId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/agentic/threads/${threadId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.status} ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting thread:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}