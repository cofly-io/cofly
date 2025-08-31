import { ChatMessage } from './chatService';

export interface ChatStreamOptions {
  endpoint?: string;
  userId?: string;
  agentId?: string | null;
  agentName?: string;
  agentAvatar?: string;
}

export interface StreamMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  avatar: string;
  role?: 'user' | 'assistant';
}

/**
 * 聊天流服务 - 处理实时聊天流和API调用
 */
export class ChatStreamService {
  private static currentStreamController: AbortController | null = null;

  /**
   * 清理当前流
   */
  private static cleanupCurrentStream() {
    if (this.currentStreamController) {
      this.currentStreamController.abort();
      this.currentStreamController = null;
    }
  }

  /**
   * 生成随机线程ID
   */
  static generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 格式化时间戳
   */
  static formatTimestamp(): string {
    return new Date().toLocaleString();
  }

  /**
   * 加载线程历史（支持分页）
   */
  static async loadThreadHistory(
    threadId: string,
    agentName: string = '智能体',
    agentAvatar: string = 'robot',
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: StreamMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    try {
      const url = `/api/agentic/threads/${threadId}/messages?page=${page}&limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load thread history');
      }

      const responseData = await response.json();
      const data = responseData.data || responseData; // 兼容新旧API格式
      const pagination = responseData.pagination;
      const uiMessages: StreamMessage[] = [];

      for (const item of data) {
        // 处理新的AgentResult格式数据
        if (item.agentName === 'user') {
          // 用户消息 - 从AgentResult的output中提取
          if (item.output && item.output.length > 0) {
            const textMessage = item.output.find((msg: any) => msg.type === 'text');
            if (textMessage) {
              const userMessage: StreamMessage = {
                id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: '我',
                content: textMessage.content,
                timestamp: this.formatTimestamp(),
                avatar: 'user',
                role: 'user'
              };
              uiMessages.push(userMessage);
            }
          }
        } else if (item.agentName && item.agentName !== 'user') {
          // 智能体消息 - 从AgentResult的output中提取
          if (item.output && item.output.length > 0) {
            let content = '';
            
            // 处理所有text类型的输出
            for (const output of item.output) {
              if (output.type === 'text' && output.content) {
                // if (content) content += '\n\n';
                content += output.content;
              }
            }

            if (content) {
              const assistantMessage: StreamMessage = {
                id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: agentName,
                content: content,
                timestamp: this.formatTimestamp(),
                avatar: agentAvatar,
                role: 'assistant'
              };
              uiMessages.push(assistantMessage);
            }
          }
        }
        // 兼容旧的数据库格式（如果存在）
        else if (item.messageType === 'user') {
          const userMessage: StreamMessage = {
            id: item.id || `user-legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            sender: '我',
            content: item.content,
            timestamp: this.formatTimestamp(),
            avatar: 'user',
            role: 'user'
          };
          uiMessages.push(userMessage);
        } else if (item.messageType === 'agent' && item.data) {
          try {
            const agentData = JSON.parse(item.data);
            let content = '';
            
            if (agentData.raw) {
              try {
                const rawData = JSON.parse(agentData.raw);
                
                if (rawData.choices && rawData.choices[0] && rawData.choices[0].message) {
                  const message = rawData.choices[0].message;
                  
                  if (message.content) {
                    content += message.content;
                  }
                  if (message.reasoning_content) {
                    // if (content) content += '\n\n';
                    content = '**推理过程:**\n' + message.reasoning_content + content;
                  }
                }
                else if (rawData.message) {
                  const message = rawData.message;
                  
                  if (message.content) {
                    content += message.content;
                  }
                  if (message.reasoning_content) {
                    // if (content) content += '\n\n';
                    content = '**推理过程:**\n' + message.reasoning_content + content;
                  }
                }
              } catch (e) {
                console.error('Failed to parse agent raw data:', e);
              }
            }

            if (content) {
              const assistantMessage: StreamMessage = {
                id: item.id || `assistant-legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: agentName,
                content: content,
                timestamp: this.formatTimestamp(),
                avatar: agentAvatar,
                role: 'assistant'
              };
              uiMessages.push(assistantMessage);
            }
          } catch (e) {
            console.error('Failed to parse agent data:', e);
          }
        }
      }

      console.log(`📚 Loaded thread ${threadId} with ${uiMessages.length} UI messages`);

      return {
        messages: uiMessages,
        pagination: pagination || {
          page: 1,
          limit: uiMessages.length,
          total: uiMessages.length,
          totalPages: 1,
          hasMore: false
        }
      };
    } catch (error) {
      console.error('Failed to load thread history:', error);
      throw error;
    }
  }

  /**
   * 加载更多历史消息（用于懒加载）
   */
  static async loadMoreThreadHistory(
    threadId: string,
    page: number,
    agentName: string = '智能体',
    agentAvatar: string = 'robot',
    limit: number = 50
  ): Promise<{
    messages: StreamMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    return this.loadThreadHistory(threadId, agentName, agentAvatar, page, limit);
  }

  /**
   * 发送消息并处理流式响应
   */
  static async sendMessage(
    content: string,
    options: ChatStreamOptions,
    onMessageUpdate: (message: StreamMessage) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    threadId?: string
  ): Promise<string> {
    const {
      endpoint = '/api/agentic',
      userId = 'admin',
      agentId,
      agentName = '智能体',
      agentAvatar = 'robot'
    } = options;

    console.log('🚀 ChatStreamService.sendMessage 开始');
    
    if (!content.trim() || !agentId) {
      throw new Error('Content and agentId are required');
    }

    this.cleanupCurrentStream();
    this.currentStreamController = new AbortController();

    // 生成线程ID（如果不存在）
    const currentThreadId = threadId || this.generateThreadId();

    try {
      const requestData = {
        agentId: agentId,
        input: content,
        threadId: currentThreadId,
        userId: userId,
        waitOutput: false,
        stream: true,
      };
      
      console.log('📤 准备发送API请求:', { endpoint, requestData });

      let assistantMessage: StreamMessage = {
        id: (Date.now() + Math.random()).toString(),
        sender: agentName,
        content: 'Thinking...',
        timestamp: this.formatTimestamp(),
        avatar: agentAvatar,
        role: 'assistant'
      };
      let renew = true;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: this.currentStreamController.signal,
      });
      
      console.log('📡 收到响应:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorMessage = 'Failed to get response';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let fullReasoning = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const newText = decoder.decode(value, { stream: true });
        buffer += newText;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const event = JSON.parse(line);
            let message;

            // 处理result中的raw数据
            if (event.data?.type === 'chunk') {
              if (event.data.message.streamEnd) {
                renew = true;
                fullContent = '';
                fullReasoning = '';
              } else {
                fullContent += event.data.message.content;
                fullReasoning += event.data.message.reasoning_content;

                message = event.data.message;
                message.content = fullContent;
                message.reasoning_content = fullReasoning;
              }
            } else if (event.data?.result) {
              const result = event.data?.result;
              if (result.toolCalls && result.toolCalls.length > 0) {
                message = {
                  toolCalls: result.toolCalls
                };
              }
            }

            if (message) {
              if (renew) {
                assistantMessage = {
                  id: (Date.now() + Math.random()).toString(),
                  sender: agentName,
                  content: 'Thinking...',
                  timestamp: this.formatTimestamp(),
                  avatar: agentAvatar,
                  role: 'assistant'
                };

                onMessageUpdate(assistantMessage);
                renew = false;
              }

              let content = '';

              // 组合content和reasoning_content
              if (message.content) {
                content += message.content;
                if(content.indexOf("<think>") >= 0 && content.indexOf("</think>") < 0) {
                  content += "</think>";
                }
              }
              if (message.reasoning_content) {
                content = '<think>' + message.reasoning_content + "</think>\n\n" + content;
              }
              if (message.toolCalls) {
                for (let call of message.toolCalls) {
                  // if (content) content += '\n\n';
                  content += '### 调用：' + call.tool.name;
                  if (call.content) {
                    // content += '\n\n';
                    content += '```json\n';
                    content += JSON.stringify(call.content,null,2);
                    content += '\n```';
                  }
                }
                renew = true;
              }

              if (content) {
                assistantMessage.content = content;
                onMessageUpdate(assistantMessage);
              }
            }

            if (event.data?.isCompleted === true) {
              console.log('✅ 对话完成');
              onComplete();
              this.cleanupCurrentStream();
            }
          } catch (e) {
            console.error('❌ 解析事件失败:', e, '原始数据:', line);
          }
        }
      }

      return currentThreadId;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'AbortError'
      ) {
        console.log('⏹️ 请求被取消');
        return currentThreadId;
      }

      console.error('❌ sendMessage发生错误:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
      this.cleanupCurrentStream();
      throw error;
    }
  }

  /**
   * 停止当前流
   */
  static stopCurrentStream() {
    this.cleanupCurrentStream();
  }
}