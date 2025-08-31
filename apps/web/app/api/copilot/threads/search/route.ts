import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

// 搜索对话
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q");
    const agentId = req.nextUrl.searchParams.get("agentId");
    const userId = req.nextUrl.searchParams.get("userId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    if (!query || !agentId) {
      return NextResponse.json({ error: 'Query and agentId are required' }, { status: 400 });
    }

    const whereCondition: any = {
      agentId: agentId,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    // 搜索包含关键词的消息
    const matchingMessages = await prisma.agentMessage.findMany({
      where: {
        thread: whereCondition,
        OR: [
          {
            content: {
              contains: query,
            }
          }
        ]
      },
      include: {
        thread: {
          include: {
            _count: {
              select: {
                messages: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit * 2 // 取更多结果，因为可能有重复的线程
    });

    // 按线程分组，去重
    const threadMap = new Map();
    const threadIds = new Set<string>();

    matchingMessages.forEach(message => {
      const threadId = message.threadId;
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          thread: message.threadId,
          matchingMessage: message,
          relevanceScore: calculateRelevanceScore(message.content || '', query)
        });
        threadIds.add(threadId);
      }
    });

    // 获取每个线程的第一条消息（用于生成标题）和最后一条消息
    const [firstMessages, lastMessages] = await Promise.all([
      prisma.agentMessage.findMany({
        where: {
          threadId: { in: Array.from(threadIds) }
        },
        orderBy: { createdAt: 'asc' },
        distinct: ['threadId']
      }),
      prisma.agentMessage.findMany({
        where: {
          threadId: { in: Array.from(threadIds) }
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['threadId']
      })
    ]);

    const firstMessageMap = new Map(firstMessages.map(msg => [msg.threadId, msg]));
    const lastMessageMap = new Map(lastMessages.map(msg => [msg.threadId, msg]));

    // 构建搜索结果
    const searchResults = Array.from(threadMap.values())
      .map(({ thread, matchingMessage, relevanceScore }) => {
        const firstMessage = firstMessageMap.get(thread.id);
        const lastMessage = lastMessageMap.get(thread.id);
        const metadata = JSON.parse(thread.metadata || '{}');
        
        const title = metadata.title || 
                     (firstMessage?.content ? generateThreadTitle(firstMessage.content) : "新对话");

        return {
          id: thread.id,
          title,
          agentId: thread.agentId,
          userId: thread.userId,
          messageCount: thread._count.messages,
          lastMessage: lastMessage?.content?.substring(0, 100) || '',
          lastMessageAt: lastMessage?.createdAt || thread.createdAt,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          matchingContent: highlightMatch(matchingMessage.content || '', query),
          relevanceScore
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore) // 按相关性排序
      .slice(0, limit); // 限制结果数量

    return NextResponse.json({
      results: searchResults,
      total: searchResults.length,
      query
    });
  } catch (error) {
    console.error('Error searching threads:', error);
    return NextResponse.json(
      { error: 'Failed to search threads' },
      { status: 500 }
    );
  }
}

// 计算相关性分数
function calculateRelevanceScore(content: string, query: string): number {
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let score = 0;
  
  // 完全匹配得分更高
  if (contentLower.includes(queryLower)) {
    score += 10;
  }
  
  // 单词匹配
  const queryWords = queryLower.split(/\s+/);
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      score += 5;
    }
  });
  
  // 内容长度影响（较短的匹配内容得分更高）
  score += Math.max(0, 100 - content.length / 10);
  
  return score;
}

// 高亮匹配内容
function highlightMatch(content: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return content.replace(regex, '<mark>$1</mark>');
}

// 生成对话标题
function generateThreadTitle(firstMessage: string): string {
  if (!firstMessage) return "新对话";
  
  const cleaned = firstMessage.trim().replace(/\n+/g, ' ');
  
  if (cleaned.length <= 30) {
    return cleaned;
  }
  
  return cleaned.substring(0, 30) + '...';
}