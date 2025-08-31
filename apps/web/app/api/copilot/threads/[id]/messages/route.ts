import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 获取对话的消息历史
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // 验证thread是否存在
    const thread = await prisma.agentThread.findUnique({
      where: { id }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // 获取消息总数
    const totalCount = await prisma.agentMessage.count({
      where: { threadId: id }
    });

    // 获取消息列表
    const messages = await prisma.agentMessage.findMany({
      where: { threadId: id },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });

    // 格式化消息数据
    const formattedMessages = messages.map(message => ({
      id: message.id,
      threadId: message.threadId,
      messageType: message.messageType,
      agentName: message.agentName,
      content: message.content,
      data: message.data ? JSON.parse(message.data) : null,
      raw: message.raw ? JSON.parse(message.raw) : null,
      checksum: message.checksum,
      createdAt: message.createdAt,
      timestamp: message.createdAt // 添加timestamp别名以便前端使用
    }));

    const response = {
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: page * limit < totalCount
      },
      thread: {
        id: thread.id,
        agentId: thread.agentId,
        userId: thread.userId
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread messages' },
      { status: 500 }
    );
  }
}