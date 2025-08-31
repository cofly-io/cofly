import { NextRequest, NextResponse } from "next/server";
import { loadThreadState, getThreadMessageCount, threadExists, getLastMessage } from "@/protocols/threadStateService";

interface RouteParams {
  params: Promise<{
    threadId: string;
  }>;
}

/**
 * 获取线程状态和消息
 * GET /api/copilot/thread-state/[threadId]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    // 获取查询参数
    const includeMessages = req.nextUrl.searchParams.get('includeMessages') !== 'false';
    const includeState = req.nextUrl.searchParams.get('includeState') !== 'false';
    const onlyLastMessage = req.nextUrl.searchParams.get('onlyLastMessage') === 'true';

    if (onlyLastMessage) {
      // 只返回最后一条消息
      const lastMessage = await getLastMessage(threadId);
      const exists = await threadExists(threadId);
      
      return NextResponse.json({
        threadId,
        threadExists: exists,
        lastMessage,
        messageCount: exists ? await getThreadMessageCount(threadId) : 0
      });
    }

    // 加载完整的线程状态
    const threadState = await loadThreadState(threadId);

    // 根据参数过滤返回内容
    const response: any = {
      threadId: threadState.threadId,
      threadExists: threadState.threadExists,
      messageCount: threadState.messages.length
    };

    if (includeMessages) {
      response.messages = threadState.messages;
    }

    if (includeState) {
      response.state = threadState.state;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error loading thread state:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load thread state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 更新线程状态
 * PUT /api/copilot/thread-state/[threadId]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;
    const body = await req.json();
    
    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    // 这里可以添加更新线程状态的逻辑
    // 目前只是一个占位符实现
    
    return NextResponse.json({
      success: true,
      message: 'Thread state update endpoint - not implemented yet',
      threadId,
      receivedData: body
    });
  } catch (error) {
    console.error('Error updating thread state:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update thread state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}