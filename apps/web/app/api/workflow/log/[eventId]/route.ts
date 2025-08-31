import { NextRequest, NextResponse } from 'next/server'
import { EventMediator } from "@repo/engine";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;
    const includeOutput = req.nextUrl.searchParams.get('includeOutput') === 'false' ? false : true;

    if (!eventId) {
        return NextResponse.json({
            success: false,
            error: '缺少必填参数: eventId'
        }, {
            status: 400
        });
    }

    try {
        const result = await EventMediator.getEventTrace(eventId, includeOutput);

        return NextResponse.json({
            success: true,
            data: result
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