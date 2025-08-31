import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

export async function GET(req: NextRequest) {
    const agentId = req.nextUrl.searchParams.get("agentId") as string;
    const limit = req.nextUrl.searchParams.get("limit");

    if (!agentId) {
        return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    // 1. 根据agentId查找agent_thread表，按createdAt排序取前50条
    const threads = await prisma.agentThread.findMany({
        where: {
            agentId: agentId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit ? parseInt(limit) : 50
    });

    // 2. 获取这些thread的ID集合
    const threadIds = threads.map(thread => thread.id);

    if (threadIds.length === 0) {
        return NextResponse.json([]);
    }

    // 3. 根据threadId分组，获取每个thread中最早的用户消息
    const earliestMessages = await prisma.agentMessage.findMany({
        where: {
            threadId: {
                in: threadIds
            },
            messageType: 'user'
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // 4. 按threadId分组，每组取最早的一条（createdAt最小）
    const messageMap = new Map<string, any>();
    earliestMessages.forEach(message => {
        if (!messageMap.has(message.threadId)) {
            messageMap.set(message.threadId, message);
        }
    });

    // 5. 构建最终结果，保持thread的创建时间排序
    const result = threads
        .map(thread => {
            const earliestMessage = messageMap.get(thread.id);
            if (earliestMessage) {
                return {
                    threadId: thread.id,
                    agentId: thread.agentId,
                    content: earliestMessage.content || '',
                    createdAt: earliestMessage.createdAt
                };
            }
            return null;
        })
        .filter(item => item !== null);

    return NextResponse.json(result);
}

// export async function GET(req: NextRequest) {
//     const agentId = req.nextUrl.searchParams.get("agentId") as string;
//     const userId = req.nextUrl.searchParams.get("userid") as string;
//     const limit = req.nextUrl.searchParams.get("limit");

//     const result = await prisma.agentThread.findMany({
//         where: {
//             agentId: agentId,
//             userId: userId
//         },
//         take: limit ? parseInt(limit) : 50,
//     });

//     return NextResponse.json(result);
// }