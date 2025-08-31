import { AgenticThreadData, AgenticThreadListOptions, AgenticThreadMessageAppendOptions, AgenticThreadMessageData, AgenticThreadMessageListOptions, IAgenticThreadLoader } from "@repo/common";
import { prisma } from '@repo/database';

export class DefaultAgentThreadLoader implements IAgenticThreadLoader{

    async appendMessages(opts: AgenticThreadMessageAppendOptions): Promise<boolean> {

        const client = prisma;
        const result = await client.$transaction(async (tx) =>{
            await tx.agentThread.update({
                where: { id: opts.threadId },
                data: {
                    updatedAt: new Date(),
                }
            })

            for(const message of opts.messages) {
                await tx.agentMessage.create({
                    data: message
                });
            }

            return true;
        })

        return result;
    }

    async createThread(thread: AgenticThreadData) : Promise<string> {

        const client = prisma;
        const result = await client.agentThread.create({
            data: {
                id: thread.id,
                agentId: thread.agentId,
                userId: thread.userId,
                metadata: thread.metadata
            }
        });
        return result.id;
    };

    async getThread(id: string): Promise<AgenticThreadData | undefined> {

        const client = prisma;
        const result = await client.agentThread.findUnique({
            where: { id }
        });
        return result || undefined;
    }

    async listMessages(opts: AgenticThreadMessageListOptions): Promise<AgenticThreadMessageData[]> {
        if (!opts.threadId) {
            return [];
        }

        const client = prisma;
        const result = await client.agentMessage.findMany({
            where: { threadId: opts.threadId },
            orderBy: { createdAt: 'desc' },
            take: opts.limit || 5,
        });
        return result;
    }

    async listThread(opts: AgenticThreadListOptions): Promise<AgenticThreadData[]> {

        const client = prisma;
        const result = await client.agentThread.findMany({
            orderBy: { createdAt: 'desc' },
            take: opts.limit || 20,
        });
        return result;
    }
}