import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

// 生成对话标题的辅助函数
function generateThreadTitle(firstMessage: string): string {
  if (!firstMessage) return "新对话";
  
  // 清理消息内容
  const cleaned = firstMessage.trim().replace(/\n+/g, ' ');
  
  // 截取前30个字符作为标题
  if (cleaned.length <= 30) {
    return cleaned;
  }
  
  return cleaned.substring(0, 30) + '...';
}

// 获取对话历史列表 (增强版)
export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    const userId = req.nextUrl.searchParams.get("userId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const search = req.nextUrl.searchParams.get("search");

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const whereCondition: any = {
      agentId: agentId,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    // 获取线程总数
    const totalCount = await prisma.agentThread.count({
      where: whereCondition
    });

    // 获取线程列表
    const threads = await prisma.agentThread.findMany({
      where: whereCondition,
      orderBy: {
        updatedAt: 'desc'
      },
      skip: offset,
      take: limit,
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1, // 获取第一条消息用于生成标题
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    // 获取每个线程的最后一条消息
    const threadIds = threads.map(t => t.id);
    const lastMessages = await prisma.agentMessage.findMany({
      where: {
        threadId: {
          in: threadIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['threadId']
    });

    const lastMessageMap = new Map(
      lastMessages.map(msg => [msg.threadId, msg])
    );

    // 构建响应数据
    const chatThreads = threads.map(thread => {
      const firstMessage = thread.messages[0];
      const lastMessage = lastMessageMap.get(thread.id);
      const metadata = JSON.parse(thread.metadata || '{}');
      
      // 生成标题：优先使用自定义标题，否则基于第一条消息生成
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
        isActive: false // 这个需要前端设置
      };
    });

    // 如果有搜索条件，进行过滤
    let filteredThreads = chatThreads;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredThreads = chatThreads.filter(thread => 
        thread.title.toLowerCase().includes(searchLower) ||
        thread.lastMessage.toLowerCase().includes(searchLower)
      );
    }

    const response = {
      threads: filteredThreads,
      pagination: {
        page,
        limit,
        total: search ? filteredThreads.length : totalCount,
        hasMore: search ? false : (page * limit < totalCount)
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching chat threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat threads' },
      { status: 500 }
    );
  }
}

// 创建新对话
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, userId, title, metadata = {} } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    // 如果提供了自定义标题，保存到 metadata 中
    const threadMetadata = title ? { ...metadata, title } : metadata;

    const newThread = await prisma.agentThread.create({
      data: {
        agentId,
        userId: userId || 'anonymous',
        metadata: JSON.stringify(threadMetadata)
      }
    });

    const chatThread = {
      id: newThread.id,
      title: title || "新对话",
      agentId: newThread.agentId,
      userId: newThread.userId,
      messageCount: 0,
      lastMessage: '',
      lastMessageAt: newThread.createdAt,
      createdAt: newThread.createdAt,
      updatedAt: newThread.updatedAt,
      isActive: true
    };

    return NextResponse.json({
      thread: chatThread,
      success: true
    });
  } catch (error) {
    console.error('Error creating chat thread:', error);
    return NextResponse.json(
      { error: 'Failed to create chat thread' },
      { status: 500 }
    );
  }
}