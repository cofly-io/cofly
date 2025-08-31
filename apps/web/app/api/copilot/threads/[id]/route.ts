import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 获取单个对话详情
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const thread = await prisma.agentThread.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // 获取第一条和最后一条消息
    const [firstMessage, lastMessage] = await Promise.all([
      prisma.agentMessage.findFirst({
        where: { threadId: id },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.agentMessage.findFirst({
        where: { threadId: id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const metadata = JSON.parse(thread.metadata || '{}');
    const title = metadata.title || 
                 (firstMessage?.content ? generateThreadTitle(firstMessage.content) : "新对话");

    const chatThread = {
      id: thread.id,
      title,
      agentId: thread.agentId,
      userId: thread.userId,
      messageCount: thread._count.messages,
      lastMessage: lastMessage?.content?.substring(0, 100) || '',
      lastMessageAt: lastMessage?.createdAt || thread.createdAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      metadata: metadata
    };

    return NextResponse.json(chatThread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

// 更新对话信息
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, metadata = {} } = body;

    // 获取现有的 metadata
    const existingThread = await prisma.agentThread.findUnique({
      where: { id }
    });

    if (!existingThread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const existingMetadata = JSON.parse(existingThread.metadata || '{}');
    const updatedMetadata = { ...existingMetadata, ...metadata };

    // 如果提供了标题，更新到 metadata 中
    if (title !== undefined) {
      updatedMetadata.title = title;
    }

    const updatedThread = await prisma.agentThread.update({
      where: { id },
      data: {
        metadata: JSON.stringify(updatedMetadata),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      thread: {
        id: updatedThread.id,
        title: updatedMetadata.title || "新对话",
        metadata: updatedMetadata,
        updatedAt: updatedThread.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

// 删除对话
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx) => {
      // 先删除所有消息
      await tx.agentMessage.deleteMany({
        where: { threadId: id }
      });

      // 再删除线程
      await tx.agentThread.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}

// 辅助函数：生成对话标题
function generateThreadTitle(firstMessage: string): string {
  if (!firstMessage) return "新对话";
  
  const cleaned = firstMessage.trim().replace(/\n+/g, ' ');
  
  if (cleaned.length <= 30) {
    return cleaned;
  }
  
  return cleaned.substring(0, 30) + '...';
}