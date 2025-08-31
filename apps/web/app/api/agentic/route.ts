import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@inngest/realtime";
import { agentManager, inngest, AgentInvokeOptions } from "@repo/engine";
import { prisma } from '@repo/database';

export async function POST(req: NextRequest ) {
    try {

        const opts = await req.json() as unknown as AgentInvokeOptions;

        // 检查agentManager中可用的agents
        if(opts.agentId) {
            const agent = await agentManager.get(opts.agentId);

            if (!agent) {
                console.error(`❌ 未找到agent "${opts.agentId}"`);
                return NextResponse.json({
                    error: `Unable to find agent "${opts.agentId}"`,
                }, {status: 404});
            }

            if (opts.threadId && (await prisma.agentThread.count({
                where: {id: opts.threadId}
            })) === 0) {
                await prisma.agentThread.create({
                    data: {
                        id: opts.threadId,
                        agentId: opts.agentId,
                        userId: opts.userId,
                        metadata: JSON.stringify({userId: opts.userId})
                    }
                });
            }
        }

        opts.persistentHistory = true;

        const result = await agentManager.invoke(opts);

        if(opts.waitOutput) {
            return NextResponse.json(result);
        } else {
            const stream = await subscribe({
                app: inngest,
                channel: `chat/${opts.agentId}/${opts.threadId}`,
                topics: ["messages"],
            });

            return new Response(stream.getEncodedStream(), {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            });
        }
    } catch (error) {
        console.error('❌ /api/agentic 异常:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : '内部服务器错误',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}