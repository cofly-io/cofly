import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

// 获取对话统计信息
export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const whereCondition: any = {
      agentId: agentId,
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    // 计算日期范围
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 并行执行多个查询
    const [
      totalThreads,
      totalMessages,
      activeThreadsLast7Days,
      activeThreadsLast30Days,
      messagesLast7Days,
      messagesLast30Days,
      threadMessageCounts
    ] = await Promise.all([
      // 总对话数
      prisma.agentThread.count({
        where: whereCondition
      }),
      
      // 总消息数
      prisma.agentMessage.count({
        where: {
          thread: whereCondition
        }
      }),
      
      // 最近7天活跃对话数
      prisma.agentThread.count({
        where: {
          ...whereCondition,
          updatedAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // 最近30天活跃对话数
      prisma.agentThread.count({
        where: {
          ...whereCondition,
          updatedAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // 最近7天消息数
      prisma.agentMessage.count({
        where: {
          thread: whereCondition,
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      
      // 最近30天消息数
      prisma.agentMessage.count({
        where: {
          thread: whereCondition,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // 每个对话的消息数（用于计算平均值）
      prisma.agentThread.findMany({
        where: whereCondition,
        include: {
          _count: {
            select: {
              messages: true
            }
          }
        }
      })
    ]);

    // 计算平均每个对话的消息数
    const averageMessagesPerThread = totalThreads > 0 
      ? totalMessages / totalThreads 
      : 0;

    // 计算消息数分布
    const messageCountDistribution = {
      '1-5': 0,
      '6-20': 0,
      '21-50': 0,
      '50+': 0
    };

    threadMessageCounts.forEach(thread => {
      const count = thread._count.messages;
      if (count <= 5) {
        messageCountDistribution['1-5']++;
      } else if (count <= 20) {
        messageCountDistribution['6-20']++;
      } else if (count <= 50) {
        messageCountDistribution['21-50']++;
      } else {
        messageCountDistribution['50+']++;
      }
    });

    // 计算用户类型分布（如果有 userId）
    let userStats = null;
    if (!userId) {
      const userDistribution : any[] = await prisma.agentThread.groupBy({
        by: ['userId'],
        where: {
          agentId: agentId
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10 // 取前10个最活跃用户
      });

      userStats = {
        totalUsers: userDistribution.length,
        topUsers: userDistribution.map(user => ({
          userId: user.userId,
          threadCount: user._count.id
        }))
      };
    }

    const stats = {
      totalThreads,
      totalMessages,
      activeThreadsLast7Days,
      activeThreadsLast30Days,
      messagesLast7Days,
      messagesLast30Days,
      averageMessagesPerThread: Math.round(averageMessagesPerThread * 100) / 100,
      messageCountDistribution,
      userStats,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching thread stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread stats' },
      { status: 500 }
    );
  }
}