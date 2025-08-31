import { prisma } from '@repo/database';

// 定义返回的消息格式
export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 定义线程状态响应格式
export interface ThreadStateResponse {
  threadId: string;
  threadExists: boolean;
  state: string;
  messages: string;
}

/**
 * 从数据库读取指定线程的消息数据
 * @param threadId 线程ID
 * @returns 线程状态和消息列表
 */
export async function loadThreadState(threadId: string): Promise<ThreadStateResponse> {
  try {
    // 首先检查线程是否存在
    const thread = await prisma.agentThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return {
        threadId,
        threadExists: false,
        state: "{}",
        messages: "[]"
      };
    }

    // 获取线程的所有消息，按创建时间排序
    const agentMessages = await prisma.agentMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    });

    // 转换消息格式
    const messages: ThreadMessage[] = [];

    for (const dbMessage of agentMessages) {
      if (dbMessage.messageType === 'user') {
        // 用户消息
        messages.push({
          id: dbMessage.id.toString(),
          role: 'user',
          content: dbMessage.content || '',
          timestamp: dbMessage.createdAt,
        });
      } else if (dbMessage.messageType === 'agent') {
        // AI助手消息
        try {
          // 解析存储在 data 字段中的 JSON 数据
          const data = JSON.parse(dbMessage.data || '{}');
          const raw = JSON.parse(dbMessage.raw || '{}');
          
          // 提取消息内容
          let content = '';
          let reasoningContent = '';
          
          if (data.output && Array.isArray(data.output)) {
            // 从 output 数组中提取文本内容
            content = data.output
              .filter((item: any) => item.type === 'text' || item.role === 'assistant')
              .map((item: any) => item.content || '')
              .join('');
          }

          if(raw.choices && Array.isArray(raw.choices)) {
              reasoningContent = raw.choices[0].message?.reasoning_content || '';
          }
          
          // 如果没有从 output 中找到内容，尝试从 content 字段获取
          if (!content && dbMessage.content) {
            content = dbMessage.content;
          }

          if(reasoningContent) {
              content = "<think>" + reasoningContent + "</think>" + content || '';
          }

          // 处理工具调用
          if (data.toolCalls && Array.isArray(data.toolCalls) && data.toolCalls.length > 0) {
            // 将工具调用添加到内容中
            for (const toolCall of data.toolCalls) {
              if (toolCall.tool && toolCall.content) {
                content += `\n<tool_call>\n${JSON.stringify({
                  id: toolCall.tool.id,
                  name: toolCall.tool.name,
                  result: toolCall.content
                }, null, 2)}\n</tool_call>`;
              }
            }
          }

          if (content) {
            messages.push({
              id: dbMessage.id.toString(),
              role: 'assistant',
              content: content.trim(),
              timestamp: dbMessage.createdAt
            });
          }
        } catch (error) {
          console.error('Error parsing agent message data:', error);
          // 如果解析失败，使用原始内容
          if (dbMessage.content) {
            messages.push({
              id: dbMessage.id.toString(),
              role: 'assistant',
              content: dbMessage.content,
              timestamp: dbMessage.createdAt
            });
          }
        }
      }
    }

    // 解析线程的 metadata 作为 state
    let state: Record<string, any> = {};
    try {
      state = JSON.parse(thread.metadata || '{}');
    } catch (error) {
      console.error('Error parsing thread metadata:', error);
      state = {};
    }

    return {
      threadId,
      threadExists: true,
      state: JSON.stringify(state),
      messages: JSON.stringify(messages),
    };

  } catch (error) {
    console.error('Error loading thread state:', error);
    
    // 发生错误时返回空状态
    return {
      threadId,
      threadExists: false,
      state: "{}",
      messages: "[]"
    };
  }
}

/**
 * 获取线程的消息数量
 * @param threadId 线程ID
 * @returns 消息数量
 */
export async function getThreadMessageCount(threadId: string): Promise<number> {
  try {
    return await prisma.agentMessage.count({
      where: { threadId }
    });
  } catch (error) {
    console.error('Error getting thread message count:', error);
    return 0;
  }
}

/**
 * 检查线程是否存在
 * @param threadId 线程ID
 * @returns 是否存在
 */
export async function threadExists(threadId: string): Promise<boolean> {
  try {
    const thread = await prisma.agentThread.findUnique({
      where: { id: threadId },
      select: { id: true }
    });
    return !!thread;
  } catch (error) {
    console.error('Error checking thread existence:', error);
    return false;
  }
}

/**
 * 获取线程的最后一条消息
 * @param threadId 线程ID
 * @returns 最后一条消息或null
 */
export async function getLastMessage(threadId: string): Promise<ThreadMessage | null> {
  try {
    const lastMessage = await prisma.agentMessage.findFirst({
      where: { threadId },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastMessage) {
      return null;
    }

    // 转换为标准格式
    if (lastMessage.messageType === 'user') {
      return {
        id: lastMessage.id.toString(),
        role: 'user',
        content: lastMessage.content || '',
        timestamp: lastMessage.createdAt
      };
    } else if (lastMessage.messageType === 'agent') {
      try {
        const data = JSON.parse(lastMessage.data || '{}');
        let content = '';
        
        if (data.output && Array.isArray(data.output)) {
          content = data.output
            .filter((item: any) => item.type === 'text' || item.role === 'assistant')
            .map((item: any) => item.content || '')
            .join('');
        }
        
        if (!content && lastMessage.content) {
          content = lastMessage.content;
        }

        return {
          id: lastMessage.id.toString(),
          role: 'assistant',
          content: content.trim(),
          timestamp: lastMessage.createdAt,
        };
      } catch (error) {
        console.error('Error parsing last message:', error);
        return {
          id: lastMessage.id.toString(),
          role: 'assistant',
          content: lastMessage.content || '',
          timestamp: lastMessage.createdAt,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting last message:', error);
    return null;
  }
}