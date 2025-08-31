import { NextRequest, NextResponse } from "next/server";
import { AgentResult, type TextMessage } from "@repo/engine";
import { prisma } from '@repo/database';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

//获取某个话题的历史消息
export async function GET(req: NextRequest, { params }: RouteParams) {

    const {id} = await params;

    if (!id) {
        console.log("No threadId provided, returning empty history");
        return NextResponse.json([]);
    }

    // 获取分页参数
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // 获取总消息数量
    const totalCount = await prisma.agentMessage.count({
        where: {threadId: id}
    });

    const messages = await prisma.agentMessage.findMany({
        where: {threadId: id},
        orderBy: {createdAt: 'asc'},
        skip: offset,
        take: limit,
    });

    const results: AgentResult[] = [];

    for (const row of messages) {
        if (row.messageType === 'user') {
            // Convert user message to fake AgentResult (matching UI pattern)
            const userMessage: TextMessage = {
                type: "text",
                role: "user",
                content: row.content ?? "",
                stop_reason: "stop"
            };

            const fakeUserResult = new AgentResult(
                "user", // agentName: "user" (matches UI pattern)
                [userMessage], // output contains the user message
                [], // no tool calls for user messages
                new Date(row.createdAt)
            );

            results.push(fakeUserResult);
        } else if (row.messageType === 'agent') {
            // Deserialize real AgentResult objects from JSONB
            const data = JSON.parse(row.data ?? "{}");
            if (data.output?.length > 0 || data.toolCalls?.length > 0) {
                const realAgentResult = new AgentResult(
                    data.agentName,
                    data.output,
                    data.toolCalls,
                    new Date(data.createdAt)
                );

                results.push(realAgentResult);
            }
        }
    }

    // 返回分页信息和结果
    const response = {
        data: results,
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: page * limit < totalCount
        }
    };

    return NextResponse.json(response);
}