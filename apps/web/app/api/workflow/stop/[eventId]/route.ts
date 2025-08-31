import { NextRequest, NextResponse } from 'next/server'
import { EventMediator } from "@repo/engine";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;

    try {
        const result = await EventMediator.stopEvent(eventId);

        return NextResponse.json({
            success: result
        }, {
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
        }, {
            status: 500
        });
    }
}