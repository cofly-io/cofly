import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {

    const { id } = await params;
    const result = await prisma.agentThread.findUnique({
        where: { id: id }
    });

    return NextResponse.json(result);
}

//删除话题
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    try {
        await prisma.$transaction(async (tx) => {

            // Delete messages first (before deleting the thread)
            await tx.agentMessage.deleteMany({
                where: { threadId: id },
            });

            // Delete the thread
            await tx.agentThread.delete({
                where: {id: id},
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Failed to delete thread:", error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Failed to delete thread' },
            { status: 500 }
        );
    }
}